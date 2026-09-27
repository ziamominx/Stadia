// One server-owned simulation. A tick represents one event minute, not wall time.
export const TICK_MS = 2500;
const clone = (value) => JSON.parse(JSON.stringify(value));
const requireValue = (condition, message) => {
  if (!condition) throw new Error(message);
};
export const gateStatus = (zone, rules) =>
  zone.occupancy >= rules.critical
    ? "critical"
    : zone.occupancy >= rules.warning
      ? "attention"
      : "normal";
export const waitMinutes = (queue, rate, open = true) =>
  open && rate > 0 ? Math.ceil(queue / rate) : null;

export function createState(now = Date.now()) {
  return {
    version: 0,
    lastTick: now,
    minute: 0,
    paused: false,
    sequence: 882,
    event: {
      name: "India vs Australia",
      venue: "DY Patil Stadium, Nerul",
      lat: 19.04194,
      lng: 73.02667,
      capacity: 54000,
      inside: 42184,
      expected: 48500,
      date: "2026-10-01",
      startTime: "19:30",
      entered: 43824,
      exited: 1640,
    },
    rules: { warning: 75, critical: 90, stableMinutes: 3 },
    zones: [
      {
        id: "west",
        name: "West Gate",
        sector: "W-04",
        occupancy: 62,
        queue: 480,
        rate: 120,
        open: true,
        trend: 0,
        history: [62, 62, 62, 62],
        fire: false,
      },
      {
        id: "north",
        name: "North VIP",
        sector: "N-01",
        occupancy: 62,
        queue: 240,
        rate: 80,
        open: true,
        trend: 0,
        history: [62, 62, 62, 62],
        fire: false,
      },
      {
        id: "east",
        name: "East Gate",
        sector: "E-02",
        occupancy: 68,
        queue: 320,
        rate: 100,
        open: true,
        trend: 0,
        history: [68, 68, 68, 68],
        fire: false,
      },
      {
        id: "south",
        name: "South Concourse",
        sector: "S-03",
        occupancy: 44,
        queue: 180,
        rate: 90,
        open: true,
        trend: 0,
        history: [44, 44, 44, 44],
        fire: false,
      },
    ],
    personnel: [
      { id: "security", name: "Security guards", total: 100, deployed: 84 },
      { id: "police", name: "Police officers", total: 40, deployed: 32 },
      { id: "staff", name: "Venue staff", total: 50, deployed: 40 },
      {
        id: "volunteers",
        name: "Volunteer marshals",
        total: 150,
        deployed: 118,
      },
      { id: "medical", name: "Medical teams", total: 15, deployed: 4 },
    ],
    buses: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      hub: i < 12 ? "P3" : "P4",
      load: i < 18 ? 48 + ((i * 7) % 32) : 0,
      capacity: 80,
      status: i < 18 ? "active" : "standby",
    })),
    hubs: [
      { id: "P3", name: "West approach", queue: 420, capacity: 1500 },
      { id: "P4", name: "East relief", queue: 280, capacity: 2000 },
    ],
    parking: [
      { id: "P1", name: "North parking", used: 420, capacity: 600 },
      { id: "P2", name: "West parking", used: 470, capacity: 500 },
      { id: "P5", name: "South overflow", used: 80, capacity: 400 },
    ],
    exits: [
      {
        id: "EX-W",
        zone: "west",
        name: "West emergency exit",
        status: "available",
      },
      {
        id: "EX-N",
        zone: "north",
        name: "North emergency exit",
        status: "available",
      },
      {
        id: "EX-E",
        zone: "east",
        name: "East emergency exit",
        status: "available",
      },
      {
        id: "EX-S",
        zone: "south",
        name: "South emergency exit",
        status: "available",
      },
    ],
    facilities: [
      {
        id: "food",
        name: "East food court",
        zone: "east",
        queue: 36,
        rate: 12,
      },
      {
        id: "restroom",
        name: "South restrooms",
        zone: "south",
        queue: 18,
        rate: 6,
      },
    ],
    weather: {
      rain: false,
      shelterCapacity: 1800,
      sheltered: 0,
      waterlogged: false,
    },
    incidents: [],
    tasks: [],
    hospitalityRequests: [],
    approvedRoutes: [],
    hazardDrill: null,
    spike: false,
    emergency: false,
    log: [
      {
        id: "boot",
        minute: 0,
        text: "Event loaded. Simulated telemetry online.",
        type: "normal",
      },
    ],
  };
}

function log(s, text, type = "normal") {
  s.log.unshift({ id: `log-${++s.sequence}`, minute: s.minute, text, type });
  s.log = s.log.slice(0, 60);
}
function record(s, incident, text, status) {
  if (status) incident.status = status;
  incident.timeline.push({ minute: s.minute, text, status: incident.status });
  log(s, `${incident.id}: ${text}`, incident.severity);
}
function incident(s, type, zoneId, title, severity = "critical") {
  const existing = s.incidents.find(
    (i) => i.type === type && i.zoneId === zoneId && i.status !== "resolved",
  );
  if (existing) return existing;
  const item = {
    id: `INC-${++s.sequence}`,
    type,
    zoneId,
    title,
    severity,
    status: "detected",
    created: s.minute,
    peak: s.zones.find((z) => z.id === zoneId)?.occupancy || 0,
    stable: 0,
    timeline: [],
  };
  s.incidents.unshift(item);
  record(s, item, "Incident detected. Awaiting executive review.");
  return item;
}
function evaluate(s) {
  for (const zone of s.zones) {
    if (zone.occupancy >= s.rules.critical)
      incident(s, "crowd", zone.id, `${zone.name} crowd surge`);
  }
}
function task(s, i, team, title, resource, quantity = 0, busIds = []) {
  const t = {
    id: `TASK-${++s.sequence}`,
    incidentId: i.id,
    zoneId: i.zoneId,
    team,
    title,
    resource,
    quantity,
    busIds,
    status: "pending",
    created: s.minute,
  };
  s.tasks.unshift(t);
  if (resource) s.personnel.find((p) => p.id === resource).deployed += quantity;
  return t;
}
function resolve(s, i) {
  i.resolved = s.minute;
  i.finalOccupancy = s.zones.find((z) => z.id === i.zoneId)?.occupancy;
  record(
    s,
    i,
    i.type === "crowd"
      ? `Below warning threshold for ${s.rules.stableMinutes} simulated minutes. Resolution verified.`
      : "Staff confirmed the incident is clear.",
    "resolved",
  );
  for (const t of s.tasks.filter((t) => t.incidentId === i.id)) {
    t.status = "completed";
    if (t.resource)
      s.personnel.find((p) => p.id === t.resource).deployed -= t.quantity;
  }
}

export function tick(s) {
  s.minute += 1;
  const west = s.zones.find((z) => z.id === "west");
  const activeCrowd = s.incidents.find(
    (i) => i.type === "crowd" && i.zoneId === "west" && i.status !== "resolved",
  );
  const teamTasks = activeCrowd
    ? s.tasks.filter((t) => t.incidentId === activeCrowd.id)
    : [];
  const ready =
    teamTasks.length >= 2 &&
    teamTasks.every(
      (t) => !t.flagged && ["in_progress", "completed"].includes(t.status),
    );
  for (const z of s.zones) {
    const previous = z.occupancy;
    if (z.id === "west" && s.spike) {
      z.occupancy = ready
        ? Math.max(Math.min(62, s.rules.warning - 10), z.occupancy - 5)
        : Math.min(97, z.occupancy + 5);
      z.queue = ready
        ? Math.max(180, z.queue - 150)
        : Math.min(1600, z.queue + 80);
      s.hubs[0].queue = ready
        ? Math.max(320, s.hubs[0].queue - 130)
        : Math.min(1450, s.hubs[0].queue + 60);
      if (ready) s.hubs[1].queue = Math.min(650, s.hubs[1].queue + 35);
    }
    if (z.id !== "west" || !s.spike) {
      const response = s.incidents.find(
        (i) =>
          i.type === "crowd" && i.zoneId === z.id && i.status !== "resolved",
      );
      const assigned = response
        ? s.tasks.filter((t) => t.incidentId === response.id)
        : [];
      if (
        assigned.length >= 2 &&
        assigned.every(
          (t) => !t.flagged && ["in_progress", "completed"].includes(t.status),
        )
      ) {
        z.occupancy = Math.max(
          Math.min(62, s.rules.warning - 10),
          z.occupancy - 5,
        );
        z.queue = Math.max(0, z.queue - 150);
      }
    }
    z.trend = z.occupancy - previous;
    z.history = [...z.history.slice(-19), z.occupancy];
  }
  evaluate(s);
  for (const i of s.incidents.filter((i) => i.status !== "resolved")) {
    const z = s.zones.find((z) => z.id === i.zoneId);
    i.peak = Math.max(i.peak, z?.occupancy || 0);
    if (i.type !== "crowd") continue;
    const ownTasks = s.tasks.filter((t) => t.incidentId === i.id);
    if (
      !ownTasks.length ||
      !ownTasks.every(
        (t) => !t.flagged && ["in_progress", "completed"].includes(t.status),
      )
    ) {
      i.stable = 0;
      continue;
    }
    if (z.occupancy < s.rules.critical && i.status !== "stabilizing")
      record(
        s,
        i,
        "Crowd pressure falling. Monitoring stability.",
        "stabilizing",
      );
    i.stable = z.occupancy < s.rules.warning ? i.stable + 1 : 0;
    if (i.stable >= s.rules.stableMinutes) {
      resolve(s, i);
      if (z.id === west.id) s.spike = false;
    }
  }
}

export function advance(s, now = Date.now()) {
  if (s.paused) {
    s.lastTick = now;
    return s;
  }
  const elapsed = Math.max(0, Math.floor((now - s.lastTick) / TICK_MS));
  // Limit unattended catch-up; browsing another screen never starts a second clock.
  for (let n = 0; n < Math.min(elapsed, 120); n++) tick(s);
  if (elapsed) {
    s.lastTick = now - ((now - s.lastTick) % TICK_MS);
    s.version++;
  }
  return s;
}

export function command(state, action, now = Date.now()) {
  requireValue(
    action && typeof action.type === "string",
    "An action type is required.",
  );
  const s = clone(state); // Invalid commands cannot partially mutate shared state.
  const zone = s.zones.find((z) => z.id === (action.zoneId || "west"));
  const item = s.incidents.find((i) => i.id === action.id);
  switch (action.type) {
    case "reset":
      return createState(now);
    case "pause":
      s.paused = !s.paused;
      s.lastTick = now;
      break;
    case "spike":
      requireValue(!s.spike, "The inflow scenario is already active.");
      s.spike = true;
      s.zones[0].occupancy = 82;
      s.zones[0].queue = 1240;
      s.hubs[0].queue = 1240;
      log(s, "P3 inflow spike simulated. West Gate at 82%.", "attention");
      evaluate(s);
      break;
    case "report":
      requireValue(zone, "Choose a valid zone.");
      requireValue(
        ["fire", "medical"].includes(action.kind),
        "Choose fire or medical.",
      );
      if (action.kind === "fire") {
        zone.fire = true;
        s.exits.find((e) => e.zone === zone.id).status = "blocked";
      }
      if (action.kind === "fire")
        s.approvedRoutes = s.approvedRoutes.filter(
          (r) => r.exitId !== s.exits.find((e) => e.zone === zone.id).id,
        );
      incident(
        s,
        action.kind,
        zone.id,
        `${zone.name} ${action.kind === "fire" ? "smoke sensor alert" : "medical assistance"}`,
      );
      break;
    case "dispatch": {
      requireValue(
        item && item.status === "detected",
        "This incident has already been dispatched or closed.",
      );
      const resource =
        item.type === "crowd"
          ? "volunteers"
          : item.type === "fire"
            ? "security"
            : "medical";
      const quantity = item.type === "crowd" ? 6 : item.type === "fire" ? 4 : 1;
      const p = s.personnel.find((p) => p.id === resource);
      requireValue(
        p.total - p.deployed >= quantity,
        `Not enough available ${p.name.toLowerCase()}.`,
      );
      const candidates = s.buses
        .filter((b) => b.hub === "P3" && b.status === "active")
        .slice(0, 3);
      if (item.type === "crowd")
        requireValue(
          candidates.length === 3,
          "Three active P3 buses are required for this response.",
        );
      task(
        s,
        item,
        "ground",
        item.type === "crowd"
          ? `Deploy 6 volunteers to ${s.zones.find((z) => z.id === item.zoneId).name}`
          : item.type === "fire"
            ? "Inspect smoke alert and secure affected zone"
            : "Send medical team to reported location",
        resource,
        quantity,
      );
      if (item.type === "crowd") {
        task(
          s,
          item,
          "transport",
          "Divert 3 incoming buses from P3 to P4",
          null,
          0,
          candidates.map((b) => b.id),
        );
        candidates.forEach((b) => {
          b.status = "assigned";
        });
      }
      item.dispatched = s.minute;
      record(
        s,
        item,
        "Executive approved response. Tasks dispatched; resources reserved.",
        "responding",
      );
      break;
    }
    case "task": {
      const t = s.tasks.find((t) => t.id === action.id);
      requireValue(t, "Task not found.");
      requireValue(
        !t.flagged,
        "Clear the reported issue before progressing this task.",
      );
      const next = {
        pending: "accepted",
        accepted: "in_progress",
        in_progress: "completed",
      }[t.status];
      requireValue(next, "This task is already complete.");
      t.status = next;
      if (t.team === "transport" && next === "in_progress")
        for (const b of s.buses.filter((b) => t.busIds.includes(b.id))) {
          b.hub = "P4";
          b.status = "diverted";
        }
      record(
        s,
        s.incidents.find((i) => i.id === t.incidentId),
        `${t.team === "ground" ? "Ground" : "Transport"} task ${next.replace("_", " ")}.`,
      );
      break;
    }
    case "flag": {
      const t = s.tasks.find((t) => t.id === action.id);
      requireValue(t && t.status !== "completed", "Choose an active task.");
      t.flagged = !t.flagged;
      record(
        s,
        s.incidents.find((i) => i.id === t.incidentId),
        t.flagged
          ? `${t.team} reported an issue. Executive attention required.`
          : `${t.team} cleared the reported issue.`,
      );
      break;
    }
    case "resolve":
      requireValue(
        item && item.status !== "resolved",
        "Choose an open incident.",
      );
      requireValue(
        item.type !== "crowd",
        "Crowd incidents resolve only after the stability window.",
      );
      requireValue(
        s.tasks.some((t) => t.incidentId === item.id) &&
          s.tasks
            .filter((t) => t.incidentId === item.id)
            .every((t) => t.status === "completed" && !t.flagged),
        "Complete the response tasks and clear flagged issues first.",
      );
      if (item.type === "fire") {
        const z = s.zones.find((z) => z.id === item.zoneId);
        z.fire = false;
      }
      resolve(s, item);
      break;
    case "exit": {
      const e = s.exits.find((e) => e.id === action.id);
      requireValue(
        e && ["available", "blocked", "closed"].includes(action.status),
        "Invalid exit status.",
      );
      requireValue(
        action.status !== "available" ||
          !s.zones.find((z) => z.id === e.zone).fire,
        "Resolve the fire alert before reopening this exit.",
      );
      e.status = action.status;
      if (e.status !== "available")
        s.approvedRoutes = s.approvedRoutes.filter((r) => r.exitId !== e.id);
      log(s, `${e.name}: staff marked ${e.status}.`);
      break;
    }
    case "route": {
      requireValue(
        item && item.type === "fire" && item.status !== "resolved",
        "Choose an active fire incident.",
      );
      const exit = s.exits.find((e) => e.id === action.exitId);
      requireValue(
        exit &&
          exit.status === "available" &&
          !s.zones.find((z) => z.id === exit.zone).fire,
        "The selected exit is unavailable.",
      );
      const instructions = String(action.instructions || "").trim();
      requireValue(
        action.verified === true &&
          instructions.length >= 5 &&
          instructions.length <= 240,
        "Staff verification and 5–240 character instructions are required.",
      );
      s.approvedRoutes = s.approvedRoutes.filter(
        (r) => r.incidentId !== item.id,
      );
      s.approvedRoutes.push({
        incidentId: item.id,
        exitId: exit.id,
        instructions,
        minute: s.minute,
      });
      record(s, item, `Staff approved an alternate route to ${exit.name}.`);
      break;
    }
    case "resource": {
      const p = s.personnel.find((p) => p.id === action.id),
        total = Number(action.total);
      requireValue(
        p && Number.isInteger(total) && total >= p.deployed && total <= 2000,
        "Resource total must be a whole number between deployed count and 2,000.",
      );
      p.total = total;
      log(s, `${p.name} roster updated to ${total}.`);
      break;
    }
    case "gate":
      requireValue(zone, "Choose a valid gate.");
      zone.open = !zone.open;
      log(s, `${zone.name} ${zone.open ? "opened" : "held"} by operator.`);
      break;
    case "entry": {
      requireValue(
        zone?.open && !zone.fire,
        "This gate is unavailable for entry.",
      );
      const count = Number(action.count);
      requireValue(
        [25, -25].includes(count),
        "Use a 25-person entry or exit batch.",
      );
      requireValue(
        s.event.inside + count >= 0 &&
          s.event.inside + count <= s.event.capacity,
        "Venue capacity limit reached.",
      );
      s.event.inside += count;
      s.event[count > 0 ? "entered" : "exited"] += Math.abs(count);
      if (count > 0) zone.queue = Math.max(0, zone.queue - count);
      log(
        s,
        `${zone.name}: simulated ${Math.abs(count)} ${count > 0 ? "entries" : "exits"}.`,
      );
      break;
    }
    case "parking": {
      const lot = s.parking.find((p) => p.id === action.id);
      const delta = Number(action.delta);
      requireValue(
        lot && [-10, 10].includes(delta),
        "Invalid parking adjustment.",
      );
      requireValue(
        lot.used + delta >= 0 && lot.used + delta <= lot.capacity,
        "Parking capacity limit reached.",
      );
      lot.used += delta;
      break;
    }
    case "reserve": {
      const buses = s.buses.filter((b) => b.status === "standby").slice(0, 4);
      requireValue(buses.length > 0, "No reserve coaches available.");
      buses.forEach((b) => {
        b.status = "active";
        b.hub = "P4";
      });
      log(s, `${buses.length} reserve coaches dispatched to P4.`);
      break;
    }
    case "settings": {
      const warning = Number(action.warning),
        critical = Number(action.critical),
        capacity = Number(action.capacity);
      requireValue(
        Number.isFinite(warning) &&
          warning >= 50 &&
          warning < critical &&
          critical <= 99,
        "Thresholds must satisfy 50 ≤ warning < critical ≤ 99.",
      );
      requireValue(
        Number.isInteger(capacity) &&
          capacity >= s.event.inside &&
          capacity <= 150000,
        "Capacity must be a whole number between current occupancy and 150,000.",
      );
      const name = String(action.name || "").trim();
      requireValue(
        name.length >= 3 && name.length <= 100,
        "Event name must contain 3–100 characters.",
      );
      s.rules.warning = warning;
      s.rules.critical = critical;
      s.event.capacity = capacity;
      s.event.name = name;
      log(s, "Event configuration committed. Thresholds re-evaluated.");
      evaluate(s);
      break;
    }
    case "setup": {
      const config = action.config || {};
      const name = String(config.name || "").trim();
      const venue = String(config.venue || "").trim();
      const date = String(config.date || "");
      const startTime = String(config.startTime || "");
      const capacity = Number(config.capacity);
      const expected = Number(config.expected);
      const warning = Number(config.rules?.warningThreshold);
      const critical = Number(config.rules?.criticalThreshold);
      requireValue(name.length >= 3 && name.length <= 100, "Event name must contain 3–100 characters.");
      requireValue(venue.length >= 3 && venue.length <= 100, "Venue name must contain 3–100 characters.");
      requireValue(/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date + "T00:00:00Z")), "A valid event date is required.");
      requireValue(/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime), "A valid start time is required.");
      requireValue(Number.isInteger(capacity) && capacity >= s.event.inside && capacity <= 150000, "Capacity must be between current attendance and 150,000.");
      requireValue(Number.isInteger(expected) && expected >= 0 && expected <= capacity, "Expected attendance must be within event capacity.");
      requireValue(Number.isInteger(warning) && Number.isInteger(critical) && warning >= 50 && warning < critical && critical <= 99, "Invalid warning and critical thresholds.");
      const lat = Number(config.lat);
      const lng = Number(config.lng);
      requireValue(Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lng >= -180 && lng <= 180, "Valid venue coordinates are required for the live map.");
      requireValue(!s.tasks.some((task) => task.status !== "completed"), "Complete active response tasks before changing event setup.");
      s.event = { ...s.event, name, venue, date, startTime, capacity, expected, lat, lng };
      s.rules.warning = warning;
      s.rules.critical = critical;
      for (const person of s.personnel) {
        const total = Number(config.staffing?.[person.id]);
        requireValue(Number.isInteger(total) && total >= person.deployed && total <= 2000, `Invalid ${person.name} headcount.`);
        person.total = total;
      }
      for (const zone of s.zones) {
        const gateCapacity = Number(config.gates?.[zone.id]?.capacity);
        requireValue(Number.isInteger(gateCapacity) && gateCapacity >= 100 && gateCapacity <= capacity, `Invalid ${zone.name} capacity.`);
        zone.rate = Math.max(1, Math.round(gateCapacity / 90));
        zone.capacity = gateCapacity;
      }
      requireValue(s.zones.reduce((total, zone) => total + zone.capacity, 0) <= capacity, "Combined gate allocation exceeds venue capacity.");
      const fleetSize = Number(config.transit?.shuttleBuses);
      requireValue(Number.isInteger(fleetSize) && fleetSize >= 1 && fleetSize <= 200, "Shuttle fleet must contain 1–200 vehicles.");
      s.buses = Array.from({ length: fleetSize }, (_, index) => s.buses[index] || {
        id: index + 1, hub: index % 2 ? "P4" : "P3", load: 0, capacity: 80, status: "standby",
      });
      s.event.transit = { shuttleBuses: fleetSize };
      log(s, `Event setup committed: ${name} at ${venue}. Expected ${expected} attendees.`);
      evaluate(s);
      break;
    }
    case "hazard_drill": {
      requireValue(zone, "Choose a valid hazard zone.");
      requireValue(
        !s.incidents.some((entry) => entry.type === "fire" && entry.status !== "resolved"),
        "A fire incident is already active. Complete that response before starting another drill.",
      );
      const affectedExit = s.exits.find((exit) => exit.zone === zone.id);
      zone.fire = true;
      zone.open = false;
      zone.occupancy = Math.max(zone.occupancy, s.rules.critical);
      zone.queue = Math.max(zone.queue, 760);
      zone.trend = Math.max(zone.trend, 4);
      zone.history.push(zone.occupancy);
      zone.history = zone.history.slice(-12);
      affectedExit.status = "blocked";
      s.approvedRoutes = s.approvedRoutes.filter((route) => route.exitId !== affectedExit.id);
      s.emergency = true;
      s.hazardDrill = { zoneId: zone.id, started: s.minute, radioAcks: { security: false, ground: false, pa: false } };
      incident(s, "fire", zone.id, `${zone.name} smoke / fire drill`);
      log(s, `DRILL: simulated smoke sensor and camera checkpoint flagged ${zone.name}; processing held and ${affectedExit.name} blocked.`, "critical");
      break;
    }
    case "radio_ack": {
      const channel = String(action.channel || "");
      requireValue(
        s.hazardDrill && s.incidents.some((entry) => entry.type === "fire" && entry.status !== "resolved"),
        "Start an active fire drill before recording a radio check.",
      );
      requireValue(["security", "ground"].includes(channel), "Choose a valid radio channel.");
      requireValue(!s.hazardDrill.radioAcks[channel], "This radio check is already recorded.");
      s.hazardDrill.radioAcks[channel] = true;
      log(s, `DRILL: operator recorded verbal radio confirmation from ${channel} team.`, "attention");
      break;
    }
    case "rain":
      s.weather.rain = !s.weather.rain;
      s.weather.waterlogged = s.weather.rain;
      s.weather.sheltered = s.weather.rain ? 640 : 0;
      log(
        s,
        s.weather.rain
          ? "Rain simulated. South walkway waterlogging reported; shelter open."
          : "Weather simulation cleared.",
        "attention",
      );
      break;
    case "facility": {
      const f = s.facilities.find((f) => f.id === action.id);
      requireValue(f, "Facility not found.");
      f.queue = f.queue > 50 ? 18 : 96;
      log(s, `${f.name}: simulated queue changed to ${f.queue}.`, "attention");
      break;
    }
    case "hospitality_request": {
      const message = String(action.message || "").trim();
      requireValue(message.length >= 10 && message.length <= 240, "Describe the request in 10–240 characters.");
      const request = { id: `HOSP-${++s.sequence}`, message, status: "open", minute: s.minute };
      s.hospitalityRequests.unshift(request);
      log(s, `Hospitality request ${request.id}: ${message}`, "attention");
      break;
    }
    case "hospitality_ack": {
      const request = s.hospitalityRequests.find((entry) => entry.id === action.id);
      requireValue(request && request.status === "open", "Choose an open hospitality request.");
      request.status = "acknowledged";
      log(s, `Executive acknowledged hospitality request ${request.id}.`);
      break;
    }
    case "broadcast": {
      const message = String(action.message || "").trim();
      requireValue(
        message.length >= 5 && message.length <= 240,
        "Announcement must be 5–240 characters.",
      );
      log(s, `SIMULATED PA: ${message}`, "attention");
      if (s.hazardDrill && s.incidents.some((entry) => entry.type === "fire" && entry.status !== "resolved"))
        s.hazardDrill.radioAcks.pa = true;
      break;
    }
    case "emergency":
      s.emergency = !s.emergency;
      log(
        s,
        s.emergency
          ? "Executive activated simulated emergency mode. Staff approval required for routes."
          : "Executive ended simulated emergency mode.",
        "critical",
      );
      break;
    default:
      throw new Error("Unknown action.");
  }
  s.version++;
  return s;
}

export function snapshot(s) {
  const result = clone(s);
  result.posture =
    s.emergency ||
    s.incidents.some(
      (i) => i.status !== "resolved" && i.severity === "critical",
    )
      ? "critical"
      : s.zones.some((z) => z.occupancy >= s.rules.warning)
        ? "attention"
        : "normal";
  return result;
}
