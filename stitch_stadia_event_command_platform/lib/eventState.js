// lib/eventState.js — The Shared Live Event State Engine (per MD/flow.md)
//
// One state object. Every role reads from it, every action writes to it.
// The simulation tick mutates it; the threshold evaluator creates incidents;
// the decision engine proposes actions; dispatch writes tasks that Ground and
// Transport teams act on; their confirmations feed back into crowd physics.
// That closed loop is the product.

const g = globalThis;

const TICK_MS = 2500;          // one simulation tick
const STABLE_TICKS_TO_RESOLVE = 3;

function baseState() {
  return {
    event: {
      name: 'India vs Australia',
      venue: 'DY Patil Stadium',
      date: '26 Sep 2026',
      kickoff: '19:30 IST',
      expected: 48500,
      capacity: 54000,
      status: 'LIVE', // SETUP | LIVE | EMERGENCY
      startedAt: Date.now(),
      tick: 0,
    },
    crowd: {
      inside: 42184,
      enteredRate: 380,          // people / min
      zones: [
        { id: 'north', name: 'North Stand', density: 62, trend: 1.0, status: 'NORMAL' },
        { id: 'east',  name: 'East Stand',  density: 68, trend: 0.8, status: 'NORMAL' },
        { id: 'west',  name: 'West Stand',  density: 71, trend: 1.4, status: 'NORMAL' },
        { id: 'south', name: 'South Stand', density: 48, trend: 0.5, status: 'NORMAL' },
      ],
    },
    gates: [
      { id: 'A', name: 'Gate A · North',  side: 'local',      load: 54, warning: 75, critical: 90, throughput: 1150, trend: 0.4 },
      { id: 'B', name: 'Gate B · North',  side: 'local',      load: 61, warning: 75, critical: 90, throughput: 1200, trend: 0.6 },
      { id: 'C', name: 'Gate C · East',   side: 'outstation', load: 66, warning: 75, critical: 90, throughput: 1180, trend: 0.7 },
      { id: 'D', name: 'Gate D · East',   side: 'outstation', load: 58, warning: 75, critical: 90, throughput: 1100, trend: 0.5 },
      { id: 'E', name: 'Gate E · South',  side: 'outstation', load: 47, warning: 75, critical: 90, throughput: 1050, trend: 0.3 },
      { id: 'F', name: 'Gate F · South',  side: 'outstation', load: 52, warning: 75, critical: 90, throughput: 1080, trend: 0.4 },
      { id: 'G', name: 'Gate G · West',   side: 'local',      load: 69, warning: 75, critical: 90, throughput: 1250, trend: 0.9 },
      { id: 'W', name: 'West Gate',       side: 'local',      load: 78, warning: 75, critical: 90, throughput: 1240, trend: 0.8 },
    ],
    parking: [
      { id: 'P1', name: 'P1 · North Lot', occupancy: 62, capacity: 900,  status: 'NORMAL' },
      { id: 'P2', name: 'P2 · West Lot',  occupancy: 71, capacity: 1100, status: 'NORMAL' },
      { id: 'P3', name: 'P3 · Transit Hub', occupancy: 88, capacity: 1600, status: 'ATTENTION' },
      { id: 'P4', name: 'P4 · South Lot', occupancy: 28, capacity: 1400, status: 'NORMAL' },
      { id: 'P5', name: 'P5 · East Lot',  occupancy: 44, capacity: 800,  status: 'NORMAL' },
    ],
    transport: {
      buses: [
        { id: 'Bus 11', route: 'P3 → Stadium (West)', load: 74, cap: 80, status: 'ACTIVE' },
        { id: 'Bus 12', route: 'P3 → Stadium (West)', load: 61, cap: 80, status: 'ACTIVE' },
        { id: 'Bus 14', route: 'P3 → Stadium (West)', load: 79, cap: 80, status: 'ACTIVE' },
        { id: 'Bus 07', route: 'P4 → Stadium (South)', load: 32, cap: 80, status: 'ACTIVE' },
        { id: 'Bus 09', route: 'P4 → Stadium (South)', load: 44, cap: 80, status: 'ACTIVE' },
        { id: 'Bus 03', route: 'Rail Link → East', load: 66, cap: 80, status: 'ACTIVE' },
      ],
      cabs: { active: 32, total: 50 },
      reserve: 7,
    },
    personnel: {
      security:   { total: 100, deployed: 84, available: 16 },
      police:     { total: 60,  deployed: 41, available: 19 },
      volunteers: { total: 150, deployed: 118, available: 32 },
      medical:    { total: 24,  deployed: 12, available: 12 },
    },
    incidents: [],   // { id, zone, priority, status, createdAt, cause, prediction, timeline[] }
    tasks: {
      ground:    [], // { id, zone, task, reason, from, priority, status, createdAt }
      transport: [], // { id, buses, oldRoute, newRoute, reason, from, priority, status, createdAt }
    },
    control: {
      emergencyMode: false,
      thresholdOverrides: {},     // gateId -> { warning, critical }
    },
    intelligence: {
      history: [],                // rolling per-tick { t, westLoad }
    },
    demo: { spikeTicksLeft: 0, spikeGate: 'W', spikeHub: 'P3' },
    log: [],                      // global ops feed
  };
}

if (!g.__STADIA_STATE__) g.__STADIA_STATE__ = baseState();
if (!g.__STADIA_TICK__) {
  g.__STADIA_TICK__ = setInterval(() => {
    try { tick(); } catch { /* keep the demo alive */ }
  }, TICK_MS);
}

const S = () => g.__STADIA_STATE__;

function log(msg, kind = 'info') {
  S().log.unshift({ t: clock(), msg, kind });
  if (S().log.length > 80) S().log.pop();
}

function clock() {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000);
  return d.toISOString().slice(11, 19);
}

function gateById(id) { return S().gates.find((x) => x.id === id); }
function statusFor(load, warning, critical) {
  if (load >= critical) return 'CRITICAL';
  if (load >= warning) return 'WARNING';
  return 'NORMAL';
}

/* ---------------- simulation tick ---------------- */

export function tick() {
  const s = S();
  s.event.tick += 1;

  // demo spike physics: P3 → West Gate inflow pressure
  let spikePressure = 0;
  if (s.demo.spikeTicksLeft > 0) {
    s.demo.spikeTicksLeft -= 1;
    spikePressure = 3.2; // % per tick while spiked
    // P3 queue builds while buses keep feeding the surge
    const p3 = s.parking.find((p) => p.id === 'P3');
    if (p3 && p3.occupancy < 97) p3.occupancy = Math.min(97, p3.occupancy + 0.8);
  }

  // transport diversions reduce P3 → West pressure once confirmed
  const diverted = s.tasks.transport.some((t) => t.status === 'CONFIRMED');
  if (diverted && s.demo.spikeTicksLeft > 0) s.demo.spikeTicksLeft = Math.min(s.demo.spikeTicksLeft, 2);

  // ground deployments increase throughput at the target zone (relief ramps in)
  const deployedRelief = s.tasks.ground
    .filter((t) => t.status === 'COMPLETED' || t.status === 'IN_PROGRESS')
    .reduce((acc, t) => acc + (t.relief || 0), 0);

  for (const gate of s.gates) {
    const isTarget = gate.id === s.demo.spikeGate;
    let delta = gate.trend * 0.25;                        // organic drift
    if (isTarget) delta += spikePressure;
    if (isTarget && diverted && s.demo.spikeTicksLeft > 0) delta -= 2.6; // buses redirected away (only while the surge is on)
    if (isTarget && deployedRelief && gate.load > gate.warning) delta -= 0.55 * deployedRelief; // staffed turnstiles, natural floor at warning
    gate.load = Math.max(20, Math.min(99, gate.load + delta));
    gate.peak = Math.max(gate.peak ?? gate.load, gate.load);   // analytics: high-water mark
    // mean-reverting drift: long-running demos settle toward baseline instead of melting down
    gate.trend = Math.max(-0.8, Math.min(1.6, gate.trend + (0.5 - gate.trend) * 0.06 + (Math.random() - 0.5) * 0.25));
    gate.trend = Math.round(gate.trend * 10) / 10;
    gate.status = statusFor(gate.load, gate.warning, gate.critical);
  }

  // crowd inside follows gate throughput gently
  const flow = diverted ? -140 : 0;
  s.crowd.inside = Math.min(s.event.capacity, s.crowd.inside + Math.round((s.crowd.enteredRate / 60) * (TICK_MS / 1000) + flow * 0.4));

  // zone densities track their gates loosely
  const west = gateById('W');
  const wz = s.crowd.zones.find((z) => z.id === 'west');
  if (wz && west) {
    wz.density = Math.round(west.load);
    wz.trend = west.trend;
    wz.status = statusFor(wz.density, 75, 90);
  }

  // rolling history for trend computation
  s.intelligence.history.push({ t: Date.now(), west: west ? west.load : 0 });
  if (s.intelligence.history.length > 40) s.intelligence.history.shift();

  // analytics: event-level high-water marks + history of resolved incidents
  if (!s.analytics) s.analytics = { westPeak: 0, resolvedCount: 0, trajectory: [] };
  s.analytics.westPeak = Math.max(s.analytics.westPeak, west ? west.load : 0);
  s.analytics.resolvedCount = s.incidents.filter((i) => i.status === 'RESOLVED').length;
  if (s.event.tick % 2 === 0) {
    s.analytics.trajectory.push({ t: s.event.tick, west: Math.round(west ? west.load : 0), occupancy: Math.round((s.crowd.inside / s.event.capacity) * 100) });
    if (s.analytics.trajectory.length > 90) s.analytics.trajectory.shift();
    // per-gate ring buffer for sparklines
    for (const gate of s.gates) {
      gate.history = gate.history || [];
      gate.history.push(Math.round(gate.load));
      if (gate.history.length > 30) gate.history.shift();
    }
  }

  // incident lifecycle evolution
  evaluateThresholds();
  evolveIncidents();
}

/* ---------------- threshold evaluation → incidents ---------------- */

export function evaluateThresholds() {
  const s = S();
  for (const gate of s.gates) {
    const { warning, critical } = thresholdsFor(gate);
    if (gate.load >= critical && !s.incidents.some((i) => i.zoneId === gate.id && i.status !== 'RESOLVED')) {
      createIncident(gate, 'CRITICAL');
    }
  }
}

function thresholdsFor(gate) {
  const ov = S().control.thresholdOverrides[gate.id];
  return { warning: ov?.warning ?? gate.warning, critical: ov?.critical ?? gate.critical };
}

export function createIncident(gate, priority) {
  const s = S();
  const n = 47 + s.incidents.length;
  const cause = analyseCause(gate);
  const incident = {
    id: `INC-${String(n).padStart(3, '0')}`,
    zoneId: gate.id,
    zone: gate.name,
    priority,
    status: 'DETECTED',
    createdAt: clock(),
    createdTick: s.event.tick,
    cause,
    prediction: predict(gate),
    recommendation: recommend(gate, cause),
    peakLoad: Math.round(gate.load),
    timeline: [{ t: clock(), label: 'Detected', detail: `Density reached ${Math.round(gate.load)}%` }],
  };
  s.incidents.unshift(incident);
  log(`${incident.id} — ${gate.name} at ${Math.round(gate.load)}%`, 'critical');
  return incident;
}

export function analyseCause(gate) {
  const s = S();
  if (s.demo.spikeTicksLeft > 0 || s.demo.spikeGate === gate.id) {
    const p3 = s.parking.find((p) => p.id === 'P3');
    const inbound = s.transport.buses.filter((b) => b.route.includes('P3') && b.status === 'ACTIVE');
    return {
      summary: `High inflow from Shuttle Hub P3`,
      detail: `${inbound.length} buses inbound to ${gate.name} · ${Math.round((p3?.occupancy ?? 0) * 16)} attendees in transit`,
      contributors: ['P3 queue building', 'Buses 11, 12, 14 on West approach'],
    };
  }
  return { summary: 'Organic arrival wave', detail: 'Normal T-90min arrival curve pressure', contributors: [] };
}

export function predict(gate) {
  const s = S();
  // gate.trend is maintained per-gate every tick (% per 5 min); the shared
  // history sparkline stays West-specific for the demo spike trajectory.
  const rate = gate.trend;
  const gap = Math.max(0, 99 - gate.load);
  const mins = gate.load >= 99 ? 0 : rate > 0.2 ? Math.max(0, Math.round(gap / rate)) : null;
  return {
    current: Math.round(gate.load),
    trendPer5: Math.round(rate * 10) / 10,
    peakEstimate: Math.min(99, Math.round(gate.load + Math.max(0, rate) * 6)),
    timeToCritical: gate.load >= gate.critical ? 'Already critical' : mins === null ? 'Stable' : `${String(mins).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`,
  };
}

export function recommend(gate, cause) {
  const s = S();
  const isSpike = cause.summary.includes('P3');
  return {
    confidence: isSpike ? 84 : 61,
    eta: '~6 min',
    outcome: `~${Math.max(50, Math.round(gate.load - 11))}%`,
    actions: isSpike
      ? [
          { kind: 'ground', label: `Deploy 6 volunteers → ${gate.name}`, relief: 6 },
          { kind: 'transport', label: 'Divert Bus 11, 12, 14 → P4 route', buses: ['Bus 11', 'Bus 12', 'Bus 14'] },
        ]
      : [{ kind: 'ground', label: `Deploy 4 volunteers → ${gate.name}`, relief: 4 }],
  };
}

/* ---------------- executive actions ---------------- */

export function dispatchActions(incidentId, actions) {
  const s = S();
  const inc = s.incidents.find((i) => i.id === incidentId);
  if (!inc) return { error: 'Unknown incident' };
  const now = clock();
  for (const a of actions) {
    if (a.kind === 'ground') {
      s.tasks.ground.unshift({
        id: `GT-${String(s.tasks.ground.length + 1).padStart(3, '0')}`,
        incidentId, zone: inc.zone, zoneId: inc.zoneId,
        task: a.label, relief: a.relief || 0,
        reason: inc.cause.summary, from: 'Executive Organizer',
        priority: inc.priority, status: 'PENDING', createdAt: now,
      });
    } else if (a.kind === 'transport') {
      s.tasks.transport.unshift({
        id: `TT-${String(s.tasks.transport.length + 1).padStart(3, '0')}`,
        incidentId, buses: a.buses || [],
        oldRoute: 'P3 → Stadium (West)', newRoute: 'P4 → Stadium (South)',
        reason: 'Reduce West Gate inflow', from: 'Executive Organizer',
        priority: inc.priority, status: 'PENDING', createdAt: now,
      });
    }
  }
  if (inc.status === 'DETECTED') {
    inc.status = 'RESPONDING';
    inc.timeline.push({ t: now, label: 'Responding', detail: 'Executive dispatched actions' });
  }
  log(`Actions dispatched for ${incidentId}`, 'action');
  return { ok: true };
}

export function acceptGroundTask(id) {
  const s = S();
  const t = s.tasks.ground.find((x) => x.id === id);
  if (!t) return { error: 'Unknown task' };
  t.status = 'IN_PROGRESS';
  const p = S().personnel.volunteers;
  const n = Math.min(t.relief || 0, p.available);
  p.available -= n; p.deployed += n;
  log(`${id} accepted — ${n} volunteers en route to ${t.zone}`, 'action');
  return { ok: true };
}

export function completeGroundTask(id) {
  const s = S();
  const t = s.tasks.ground.find((x) => x.id === id);
  if (!t) return { error: 'Unknown task' };
  t.status = 'COMPLETED';
  const inc = s.incidents.find((i) => i.id === t.incidentId);
  if (inc && inc.status !== 'RESOLVED') inc.timeline.push({ t: clock(), label: 'Tasks accepted', detail: `${id} completed — relief on station` });
  log(`${id} completed at ${t.zone}`, 'ok');
  return { ok: true };
}

export function confirmTransportTask(id) {
  const s = S();
  const t = s.tasks.transport.find((x) => x.id === id);
  if (!t) return { error: 'Unknown task' };
  t.status = 'CONFIRMED';
  for (const b of s.transport.buses) {
    if (t.buses.includes(b.id)) { b.route = 'P4 → Stadium (South)'; b.status = 'DIVERTED'; }
  }
  const p3 = s.parking.find((p) => p.id === 'P3');
  if (p3) p3.occupancy = Math.max(30, p3.occupancy - 6);
  const inc = s.incidents.find((i) => i.id === t.incidentId);
  if (inc) inc.timeline.push({ t: clock(), label: 'Route change confirmed', detail: `${t.buses.join(', ')} diverted P3 → P4` });
  log(`${id} confirmed — ${t.buses.join(', ')} now on P4 approach`, 'action');
  return { ok: true };
}

export function flagTask(id, kind, issue) {
  const s = S();
  const list = kind === 'ground' ? s.tasks.ground : s.tasks.transport;
  const t = list.find((x) => x.id === id);
  if (!t) return { error: 'Unknown task' };
  t.flagged = issue || 'Issue flagged by field team';
  log(`${id} flagged: ${t.flagged}`, 'warn');
  return { ok: true };
}

/* ---------------- incident lifecycle ---------------- */

function evolveIncidents() {
  const s = S();
  for (const inc of s.incidents) {
    if (inc.status === 'RESOLVED') continue;
    const gate = gateById(inc.zoneId);
    if (!gate) continue;
    inc.peakLoad = Math.max(inc.peakLoad, Math.round(gate.load));
    const { warning } = thresholdsFor(gate);
    const hasResponse = s.tasks.ground.some((t) => t.incidentId === inc.id && (t.status === 'IN_PROGRESS' || t.status === 'COMPLETED'))
      || s.tasks.transport.some((t) => t.incidentId === inc.id && t.status === 'CONFIRMED');

    if (inc.status === 'DETECTED' && hasResponse) {
      inc.status = 'RESPONDING';
      inc.timeline.push({ t: clock(), label: 'Responding', detail: 'Field actions underway' });
    }
    if (inc.status === 'RESPONDING' && gate.load < gate.critical - 4) {
      inc.status = 'STABILIZING';
      inc.timeline.push({ t: clock(), label: 'Stabilizing', detail: `Density fell to ${Math.round(gate.load)}%` });
      inc.stableTicks = 0;
    }
    if (inc.status === 'STABILIZING') {
      if (gate.load >= gate.critical) { // relapse
        inc.status = 'RESPONDING';
        inc.timeline.push({ t: clock(), label: 'Escalated', detail: `Density rebounded to ${Math.round(gate.load)}%` });
      } else if (gate.load < warning) {
        inc.stableTicks = (inc.stableTicks || 0) + 1;
        if (inc.stableTicks >= STABLE_TICKS_TO_RESOLVE) resolveIncident(inc, gate);
      }
    }
  }
}

function resolveIncident(inc, gate) {
  const s = S();
  inc.status = 'RESOLVED';
  inc.resolvedAt = clock();
  const durMin = Math.max(1, Math.round(((s.event.tick - inc.createdTick) * TICK_MS) / 60000));
  // response timing from the audit timeline (flow.md Step 14)
  const stamp = (t) => { if (!t) return null; const [h, m, x] = t.split(':').map(Number); return h * 3600 + m * 60 + x; };
  const t0 = stamp(inc.timeline.find((x) => x.label === 'Detected')?.t);
  const t1 = stamp(inc.timeline.find((x) => x.label === 'Responding')?.t);
  const t2 = stamp(inc.resolvedAt);
  let lag = t1 != null && t0 != null ? t1 - t0 : null;
  if (lag != null && lag < 0) lag += 86400;
  let res = t2 != null && t0 != null ? t2 - t0 : null;
  if (res != null && res < 0) res += 86400;
  inc.summary = {
    peak: inc.peakLoad,
    final: Math.round(gate.load),
    durationMin: durMin,
    responseLagSecs: lag,
    resolutionSecs: res,
    ground: s.tasks.ground.filter((t) => t.incidentId === inc.id && t.status === 'COMPLETED').map((t) => t.task),
    transport: s.tasks.transport.filter((t) => t.incidentId === inc.id && t.status === 'CONFIRMED').map((t) => `${t.buses.join(', ')} → ${t.newRoute}`),
    outcome: `Density reduced ${inc.peakLoad}% → ${Math.round(gate.load)}% · resolved without escalation`,
  };
  inc.timeline.push({ t: clock(), label: 'Resolved', detail: `Held below threshold for ${STABLE_TICKS_TO_RESOLVE} ticks` });
  log(`${inc.id} resolved — ${inc.zone} stabilized`, 'ok');
}

/* ---------------- demo + control ---------------- */

export function simulateInflowSpike() {
  const s = S();
  s.demo.spikeTicksLeft = 10;
  s.demo.spikeGate = 'W';
  log('DEMO — inflow spike injected at Shuttle Hub P3 → West Gate', 'warn');
  return { ok: true };
}

export function updateThresholds(gateId, warning, critical) {
  const gate = gateById(gateId);
  if (!gate) return { error: 'Unknown gate' };
  S().control.thresholdOverrides[gateId] = { warning, critical };
  log(`Thresholds updated — ${gateId}: warn ${warning}% / crit ${critical}%`, 'action');
  return { ok: true };
}

export function toggleEmergency(on) {
  const s = S();
  s.control.emergencyMode = !!on;
  s.event.status = on ? 'EMERGENCY' : 'LIVE';
  log(on ? 'EMERGENCY MODE ACTIVATED' : 'Emergency mode cleared', on ? 'critical' : 'ok');
  return { ok: true };
}

export function broadcast(message) {
  log(`PA BROADCAST — ${message}`, 'action');
  return { ok: true };
}

export function reportManualIncident({ zone, note }) {
  const gate = gateById(zone) || gateById('W');
  const inc = createIncident(gate, 'ATTENTION');
  if (note) inc.timeline[0].detail = `Manually reported: ${note}`;
  return { ok: true, incident: inc.id };
}

export function resetSimulation() {
  g.__STADIA_STATE__ = baseState();
  log('Simulation reset to baseline', 'ok');
  return { ok: true };
}

export function getEventState() {
  return S();
}
