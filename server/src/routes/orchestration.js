import { Router } from 'express';
import { db } from '../db.js';

export const orchestrationRouter = Router();

// GET /api/orchestration/ecosystem — Live multi-layer ecosystem snapshot
orchestrationRouter.get('/ecosystem', (req, res) => {
  const simState = Object.fromEntries(
    db.prepare('SELECT key, value FROM simulation_state').all().map(r => [r.key, r.value])
  );

  const activeScenario = simState.active_scenario || 'baseline';
  const surgePct = Number(simState.surge_pct || 0);
  const rainDelayHours = Number(simState.rain_delay_hours || 0);
  const gateDisruption = simState.gate_disruption_gate_id || 'none';
  const transitOutage = simState.transit_outage_corridor_id || 'none';

  // 1. Accommodation Zones
  const zones = db.prepare('SELECT * FROM accommodation_zones ORDER BY id').all().map(z => {
    let booked = z.booked_rooms;
    let surge = z.surge_multiplier;
    if (activeScenario === 'demand_spike') {
      booked = Math.min(z.total_rooms, Math.round(booked * (1 + surgePct / 100)));
      surge = Number((surge * 1.25).toFixed(2));
    }
    const occupancyPct = Math.round((booked / z.total_rooms) * 100);
    return {
      ...z,
      booked_rooms: booked,
      occupancy_pct: occupancyPct,
      surge_multiplier: surge,
      status: occupancyPct >= 90 ? 'critical' : occupancyPct >= 75 ? 'warning' : 'optimal'
    };
  });

  // 2. Transit Corridors
  const transit = db.prepare('SELECT * FROM transit_corridors ORDER BY id').all().map(t => {
    let load = t.current_load_pct;
    let status = t.status;
    if (activeScenario === 'demand_spike') {
      load = Math.min(100, Math.round(load * 1.2));
      if (load >= 90) status = 'chokepoint';
      else if (load >= 75) status = 'heavy';
    } else if (activeScenario === 'transit_outage' && String(t.id) === transitOutage) {
      load = 98;
      status = 'disrupted';
    }
    return { ...t, current_load_pct: load, status };
  });

  // 3. Venue Gates
  const gates = db.prepare(`
    SELECT g.id, g.name, g.capacity, g.side, g.lat, g.lng,
           (SELECT COUNT(*) FROM tickets t WHERE t.entry_gate_id = g.id) AS assigned
    FROM gates g ORDER BY g.id
  `).all().map(g => {
    let assigned = g.assigned;
    let cap = g.capacity;
    if (activeScenario === 'demand_spike') {
      assigned = Math.round(assigned * (1 + surgePct / 100));
    } else if (activeScenario === 'gate_disruption' && String(g.id) === gateDisruption) {
      cap = Math.round(cap * 0.15); // Turnstiles largely failed
    }
    const loadPct = cap > 0 ? Math.round((assigned / cap) * 100) : 100;
    const waitTimeMins = Math.max(3, Math.round((loadPct / 100) * 35));
    return {
      ...g,
      assigned,
      capacity: cap,
      load_pct: loadPct,
      projected_wait_mins: waitTimeMins,
      status: loadPct >= 90 ? 'critical' : loadPct >= 75 ? 'warning' : 'ok'
    };
  });

  // 4. Hospitality & Dining Dispersal
  const merchants = db.prepare('SELECT * FROM hospitality_merchants ORDER BY id').all();

  // 5. Active Interventions History
  const interventions = db.prepare('SELECT * FROM active_interventions ORDER BY id DESC LIMIT 10').all();

  // 6. Ecosystem Health Indices
  const avgHotelSaturation = Math.round(zones.reduce((a, b) => a + b.occupancy_pct, 0) / zones.length);
  const avgTransitLoad = Math.round(transit.reduce((a, b) => a + b.current_load_pct, 0) / transit.length);
  const flaggedGatesCount = gates.filter(g => g.status !== 'ok').length;

  res.json({
    activeScenario,
    simulationState: {
      surgePct,
      rainDelayHours,
      gateDisruption,
      transitOutage,
      lastUpdated: simState.last_updated
    },
    metrics: {
      avgHotelSaturation,
      avgTransitLoad,
      flaggedGatesCount,
      totalRoomsTracked: zones.reduce((a, b) => a + b.total_rooms, 0),
      totalRoomsBooked: zones.reduce((a, b) => a + b.booked_rooms, 0),
      ecosystemHealthScore: Math.max(25, 100 - (flaggedGatesCount * 12 + (avgHotelSaturation > 80 ? 15 : 0) + (avgTransitLoad > 80 ? 15 : 0)))
    },
    zones,
    transit,
    gates,
    merchants,
    interventions
  });
});

// GET /api/orchestration/scenarios — Available stress-testing scenarios
orchestrationRouter.get('/scenarios', (req, res) => {
  res.json([
    {
      id: 'demand_spike',
      title: 'Sudden +30% Demand Spike (Unregistered Surge)',
      category: 'Capacity Overrun',
      badge: 'Surge Warning',
      description: 'Simulates a sudden 30% influx of attendees arriving via public roads and walk-ins, stressing stadium gates and near-venue hotels.',
      expectedImpact: 'Core hotels reach 100% saturation, Highway corridor bottlenecks at 96%, Gate wait times swell to 45 mins.',
      aiMitigation: 'Auto-diverts outstation bookings to Belapur/Kharghar with free rapid shuttle passes, opens P5 Overflow parking lot, and pushes early-arrival stadium F&B vouchers.'
    },
    {
      id: 'rain_delay',
      title: '2-Hour Event Overrun & Severe Weather Shift',
      category: 'Schedule Shock',
      badge: 'Schedule Disruption',
      description: 'Event schedule pushes back 120 minutes due to torrential rain and overtime, causing evening egress to clash with reduced nighttime train schedules.',
      expectedImpact: 'Severe egress bottleneck at midnight, 5,000+ attendees stranded without local transit.',
      aiMitigation: 'Synchronizes 35 electric city buses for midnight shuttle corridors, activates 30% dining vouchers at Sector 15 Fan District to stagger departure, and extends partner hotel checkouts.'
    },
    {
      id: 'gate_disruption',
      title: 'Turnstile Failure at North Gate A & B',
      category: 'Venue Infrastructure',
      badge: 'Turnstile Breakdown',
      description: 'Major electronic turnstile failure at Gate A drops throughput by 85%, causing dangerous crowd buildup on North plaza.',
      expectedImpact: 'Plaza queue exceeds 4,000 visitors, wait times hit 55+ minutes.',
      aiMitigation: 'Dynamically re-assigns tickets to West Gates G & H with real-time app push notifications and activates directional digital signage.'
    },
    {
      id: 'transit_outage',
      title: 'Suburban Rail Disruption (Harbour Line Halt)',
      category: 'Transit Crisis',
      badge: 'Rail Disruption',
      description: 'Signaling fault halts Harbour Line rail services between Mankhurd and Nerul, stranding 18,000 anticipated transit riders.',
      expectedImpact: 'Mass transit riders shift to private cabs/autos, causing gridlock on Sion-Panvel Highway.',
      aiMitigation: 'Immediately dispatches 24 emergency high-capacity feeder shuttles between Vashi terminal and DY Patil Stadium, with free priority bus lane enforcement.'
    }
  ]);
});

// POST /api/orchestration/scenarios/trigger — Trigger a crisis scenario
orchestrationRouter.post('/scenarios/trigger', (req, res) => {
  const { scenarioId } = req.body;
  if (!scenarioId) return res.status(400).json({ error: 'scenarioId required' });

  let surge = 0;
  let rain = 0;
  let gateDisrupt = 'none';
  let transitOutage = 'none';

  if (scenarioId === 'demand_spike') {
    surge = 30;
  } else if (scenarioId === 'rain_delay') {
    rain = 2;
  } else if (scenarioId === 'gate_disruption') {
    gateDisrupt = '1'; // Gate A
  } else if (scenarioId === 'transit_outage') {
    transitOutage = '3'; // Harbour Line
  }

  const stmt = db.prepare('INSERT OR REPLACE INTO simulation_state (key, value) VALUES (?, ?)');
  stmt.run('active_scenario', scenarioId);
  stmt.run('surge_pct', String(surge));
  stmt.run('rain_delay_hours', String(rain));
  stmt.run('gate_disruption_gate_id', gateDisrupt);
  stmt.run('transit_outage_corridor_id', transitOutage);
  stmt.run('last_updated', new Date().toISOString());

  // Log intervention event
  db.prepare(`
    INSERT INTO active_interventions (scenario_id, action_type, title, description, impact_metric)
    VALUES (?, 'SCENARIO_TRIGGERED', 'Simulated Crisis Active', ?, 'Ecosystem stress-test initiated')
  `).run(scenarioId, `Scenario "${scenarioId}" activated by operator.`);

  res.json({ ok: true, activeScenario: scenarioId });
});

// POST /api/orchestration/interventions/apply — Execute automated AI mitigation
orchestrationRouter.post('/interventions/apply', (req, res) => {
  const { actionType, title, description, impactMetric } = req.body;

  db.prepare(`
    INSERT INTO active_interventions (scenario_id, action_type, title, description, impact_metric)
    VALUES ('active', ?, ?, ?, ?)
  `).run(
    actionType || 'AI_ORCHESTRATION',
    title || 'Automated Load Re-balancing',
    description || 'Intelligent redistribution of accommodation buffers, feeder shuttles, and gate queues executed.',
    impactMetric || '-38% Projected Congestion'
  );

  // Return ecosystem towards optimal
  db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('active_scenario', 'mitigated')").run();

  res.json({
    ok: true,
    message: 'AI Mitigation successfully executed. Load rebalancing active across ecosystem.',
    appliedIntervention: { title, impactMetric }
  });
});

// POST /api/orchestration/reset — Reset to baseline
orchestrationRouter.post('/reset', (req, res) => {
  db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('active_scenario', 'baseline')").run();
  db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('surge_pct', '0')").run();
  db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('rain_delay_hours', '0')").run();
  db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('gate_disruption_gate_id', 'none')").run();
  db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('transit_outage_corridor_id', 'none')").run();
  db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('last_updated', datetime('now'))").run();

  db.prepare(`
    INSERT INTO active_interventions (scenario_id, action_type, title, description, impact_metric)
    VALUES ('baseline', 'SYSTEM_RESET', 'Ecosystem Reset to Baseline', 'All parameters restored to live telemetry baseline.', 'Nominal 100%')
  `).run();

  res.json({ ok: true, message: 'System reset to baseline state.' });
});
