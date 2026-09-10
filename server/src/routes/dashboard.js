import { Router } from 'express';
import { db } from '../db.js';
import { predictedLoad, loadStatus } from '../lib/load.js';
import { arrivalSlots, gateForecastSummary, arrivalFractionAt } from '../lib/forecast.js';
import { SHUTTLE_ZONES, TRANSIT_STATIONS } from '../lib/assignment.js';
import { haversineKm, nearest } from '../lib/geo.js';

export const dashboardRouter = Router();

// Two approach paths closer than this are flagged as a potential spot where
// the local and outstation crowds could mix.
const MIX_DIST_KM = 0.22;

// Next upcoming match (or the earliest one if none are left). Forecasts are
// anchored to its kickoff time so the demo always shows a meaningful window.
function upcomingMatch() {
  const now = new Date().toISOString();
  return (
    db.prepare('SELECT * FROM matches WHERE kickoff_time >= ? ORDER BY kickoff_time LIMIT 1').get(now) ??
    db.prepare('SELECT * FROM matches ORDER BY kickoff_time LIMIT 1').get()
  );
}

function gateAssignments() {
  return db
    .prepare(
      `SELECT g.id, g.name, g.capacity, g.side,
              (SELECT COUNT(*) FROM tickets t WHERE t.entry_gate_id = g.id) AS assigned
       FROM gates g ORDER BY g.id`,
    )
    .all();
}

// GET /api/dashboard/gates/forecast-summary — predicted peak per gate.
// Optional ?matchId= anchors the curve to a specific match's kickoff;
// defaults to the next upcoming match.
dashboardRouter.get('/gates/forecast-summary', (req, res) => {
  const match = req.query.matchId
    ? db.prepare('SELECT * FROM matches WHERE id = ?').get(Number(req.query.matchId))
    : upcomingMatch();
  if (!match) return res.status(404).json({ error: 'No match found to forecast against' });

  const gates = gateAssignments().map((g) => ({
    id: g.id,
    name: g.name,
    side: g.side,
    assigned: g.assigned,
    capacity: g.capacity,
    ...gateForecastSummary(g.assigned, g.capacity),
  }));
  res.json({
    match: { id: match.id, home_team: match.home_team, away_team: match.away_team, kickoff_time: match.kickoff_time },
    flagThresholdPct: 90,
    gates,
  });
});

// GET /api/dashboard/gates/:gateId/forecast — full 15-min curve for one gate.
dashboardRouter.get('/gates/:gateId/forecast', (req, res) => {
  const gate = db.prepare('SELECT * FROM gates WHERE id = ?').get(Number(req.params.gateId));
  if (!gate) return res.status(404).json({ error: 'Gate not found' });
  const match = req.query.matchId
    ? db.prepare('SELECT * FROM matches WHERE id = ?').get(Number(req.query.matchId))
    : upcomingMatch();
  if (!match) return res.status(404).json({ error: 'No match found to forecast against' });

  const assigned = db
    .prepare('SELECT COUNT(*) AS c FROM tickets WHERE entry_gate_id = ?')
    .get(gate.id).c;
  res.json({
    gate: { id: gate.id, name: gate.name, capacity: gate.capacity, assigned },
    match: { id: match.id, home_team: match.home_team, away_team: match.away_team, kickoff_time: match.kickoff_time },
    slots: arrivalSlots(assigned, gate.capacity),
  });
});

// GET /api/dashboard/flow?time=60&matchId=5 — crowd-separation simulation.
// Returns the local and outstation approach-path segments with the density
// of people currently on each at the simulated time, plus any spots where the
// two crowds' paths come close enough to risk mixing.
dashboardRouter.get('/flow', (req, res) => {
  const match = req.query.matchId
    ? db.prepare('SELECT * FROM matches WHERE id = ?').get(Number(req.query.matchId))
    : upcomingMatch();
  if (!match) return res.status(404).json({ error: 'No match to simulate' });

  const t = Number(req.query.time);
  const time = Number.isFinite(t) ? Math.max(0, Math.min(180, t)) : 60;
  const fraction = arrivalFractionAt(time);

  const gates = db.prepare('SELECT * FROM gates ORDER BY id').all();
  const localGates = gates.filter((g) => g.side === 'local');
  const outGates = gates.filter((g) => g.side === 'outstation');
  const segments = [];

  // Local: parking zone -> its gate.
  const parkingRows = db
    .prepare(
      `SELECT p.id, p.name, p.lat, p.lng, g.id AS gate_id, g.name AS gate_name, g.lat AS gate_lat, g.lng AS gate_lng,
              (SELECT COUNT(*) FROM tickets t WHERE t.parking_zone_id = p.id AND t.match_id = ?) AS routed
       FROM parking_zones p JOIN gates g ON g.id = p.nearest_gate_id`,
    )
    .all(match.id);
  for (const p of parkingRows) {
    segments.push({
      id: `parking-${p.id}`,
      name: `${p.name} → ${p.gate_name}`,
      kind: 'local_parking',
      side: 'local',
      from: [p.lat, p.lng],
      to: [p.gate_lat, p.gate_lng],
      routed: p.routed,
    });
  }

  // Local: public transit — station -> its nearest local gate.
  const transitCounts = new Map(
    db
      .prepare(
        `SELECT entry_gate_id, COUNT(*) AS c FROM tickets
         WHERE travel_mode = 'transit' AND match_id = ? GROUP BY entry_gate_id`,
      )
      .all(match.id)
      .map((r) => [r.entry_gate_id, r.c]),
  );
  for (const st of TRANSIT_STATIONS) {
    const gate = nearest(localGates, st).item;
    segments.push({
      id: `transit-${st.name}`,
      name: `${st.name} → ${gate.name}`,
      kind: 'local_transit',
      side: 'local',
      from: [st.lat, st.lng],
      to: [gate.lat, gate.lng],
      routed: transitCounts.get(gate.id) ?? 0,
    });
  }

  // Outstation: shuttle drop point -> its gate.
  const shuttleRows = db
    .prepare(
      `SELECT s.zone, COUNT(sa.id) AS routed FROM shuttles s
       LEFT JOIN shuttle_assignments sa ON sa.shuttle_id = s.id
       WHERE s.match_id = ? GROUP BY s.zone`,
    )
    .all(match.id);
  for (const z of shuttleRows) {
    const coords = SHUTTLE_ZONES.find((z2) => z2.zone === z.zone) ?? SHUTTLE_ZONES[0];
    const gate = nearest(outGates, coords).item;
    segments.push({
      id: `shuttle-${z.zone}`,
      name: `Shuttle ${z.zone} → ${gate.name}`,
      kind: 'outstation_shuttle',
      side: 'outstation',
      from: [coords.lat, coords.lng],
      to: [gate.lat, gate.lng],
      routed: z.routed,
    });
  }

  // People currently on each segment at the simulated time.
  for (const s of segments) s.density = Math.round((s.routed * fraction) / 10) * 10;

  // Mixing points: closest approach between any local and outstation path.
  // Deduplicated to the single closest local approach per outstation corridor
  // so the dashboard flags hot spots, not a cloud of near-duplicates.
  const candidates = [];
  const local = segments.filter((s) => s.side === 'local');
  const outstation = segments.filter((s) => s.side === 'outstation');
  for (const l of local) {
    for (const o of outstation) {
      let minD = Infinity;
      let bestPair = null;
      for (let i = 0; i <= 8; i++) {
        const pa = {
          lat: l.from[0] + ((l.to[0] - l.from[0]) * i) / 8,
          lng: l.from[1] + ((l.to[1] - l.from[1]) * i) / 8,
        };
        for (let j = 0; j <= 8; j++) {
          const pb = {
            lat: o.from[0] + ((o.to[0] - o.from[0]) * j) / 8,
            lng: o.from[1] + ((o.to[1] - o.from[1]) * j) / 8,
          };
          const d = haversineKm(pa, pb);
          if (d < minD) {
            minD = d;
            bestPair = { pa, pb };
          }
        }
      }
      candidates.push({ l, o, minD, bestPair });
    }
  }
  candidates.sort((a, b) => a.minD - b.minD);

  const mixingPoints = [];
  const flaggedOutstation = new Set();
  for (const c of candidates) {
    if (c.minD >= MIX_DIST_KM) break;
    if (flaggedOutstation.has(c.o.id)) continue;
    flaggedOutstation.add(c.o.id);
    mixingPoints.push({
      id: `mix-${c.l.id}-${c.o.id}`,
      localPath: c.l.name,
      outstationPath: c.o.name,
      distanceM: Math.round(c.minD * 1000),
      lat: (c.bestPair.pa.lat + c.bestPair.pb.lat) / 2,
      lng: (c.bestPair.pa.lng + c.bestPair.pb.lng) / 2,
      note: `${c.l.kind === 'local_parking' ? 'Local parking' : 'Local rail'} and outstation shuttle approaches converge within ${Math.round(c.minD * 1000)} m — flag for marshalling barriers.`,
    });
  }

  res.json({
    match: { id: match.id, home_team: match.home_team, away_team: match.away_team, kickoff_time: match.kickoff_time },
    time,
    fraction,
    segments,
    mixingPoints,
  });
});

// GET /api/dashboard/gates — gate load summary
dashboardRouter.get('/gates', (req, res) => {
  const rows = db
    .prepare(
      `SELECT g.id, g.name, g.lat, g.lng, g.capacity, g.side,
              (SELECT COUNT(*) FROM tickets t WHERE t.entry_gate_id = g.id) AS assigned,
              (SELECT COUNT(*) FROM tickets t WHERE t.exit_gate_id = g.id) AS exits
       FROM gates g
       ORDER BY g.id`,
    )
    .all();
  res.json(
    rows.map((g) => {
      const load = predictedLoad(g.assigned, g.capacity, g.id);
      return { ...g, load: Number(load.toFixed(3)), status: loadStatus(load) };
    }),
  );
});

// GET /api/dashboard/parking — parking load summary
dashboardRouter.get('/parking', (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.id, p.name, p.lat, p.lng, p.capacity, p.nearest_gate_id,
              (SELECT COUNT(*) FROM tickets t WHERE t.parking_zone_id = p.id) AS assigned
       FROM parking_zones p
       ORDER BY p.id`,
    )
    .all();
  res.json(
    rows.map((p) => {
      const load = predictedLoad(p.assigned, p.capacity, p.id + 50);
      return { ...p, load: Number(load.toFixed(3)), status: loadStatus(load) };
    }),
  );
});

// GET /api/dashboard/shuttles — shuttle fill summary
dashboardRouter.get('/shuttles', (req, res) => {
  const rows = db
    .prepare(
      `SELECT s.id, s.zone, s.capacity, s.departure_time, s.match_id,
              (SELECT COUNT(*) FROM shuttle_assignments sa WHERE sa.shuttle_id = s.id) AS booked
       FROM shuttles s
       ORDER BY s.match_id, s.zone, s.departure_time`,
    )
    .all();
  const matches = new Map(db.prepare('SELECT id, home_team, away_team FROM matches').all().map((m) => [m.id, m]));
  res.json(
    rows.map((s) => {
      const load = predictedLoad(s.booked, s.capacity, s.id + 100);
      const m = matches.get(s.match_id);
      return {
        ...s,
        load: Number(load.toFixed(3)),
        status: loadStatus(load),
        matchLabel: m ? `${m.home_team} vs ${m.away_team}` : `Match ${s.match_id}`,
      };
    }),
  );
});

// GET /api/dashboard/revenue — referral revenue totals
dashboardRouter.get('/revenue', (req, res) => {
  const rows = db
    .prepare('SELECT type, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total FROM referral_events GROUP BY type')
    .all();
  const byType = Object.fromEntries(rows.map((r) => [r.type, { count: r.count, total: r.total }]));
  const hotel = byType.hotel ?? { count: 0, total: 0 };
  const airtelTv = byType.airtel_tv ?? { count: 0, total: 0 };
  const tickets = db.prepare('SELECT COUNT(*) AS c FROM tickets').get().c;
  res.json({
    hotel,
    airtel_tv: airtelTv,
    grand_total: Math.round((hotel.total ?? 0) + (airtelTv.total ?? 0)),
    tickets,
  });
});

// GET /api/dashboard/routing/decisions — recent load-aware reassignments
// (the proof-of-intelligence feed behind the command center's
// "Routing Intelligence" panel).
dashboardRouter.get('/routing/decisions', (req, res) => {
  const rows = db
    .prepare(
      `SELECT unique_ticket_id, routing_decision, created_at FROM tickets
       WHERE routing_decision LIKE '%"reassigned":true%'
       ORDER BY id DESC LIMIT 8`,
    )
    .all();
  const decisions = rows
    .map((r) => {
      try {
        const d = JSON.parse(r.routing_decision);
        return { ticketId: r.unique_ticket_id, createdAt: r.created_at, ...d };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  res.json({ decisions, total: decisions.length });
});

// GET /api/dashboard/overview — everything at once for the organizer page
dashboardRouter.get('/overview', (req, res) => {
  const gates = db
    .prepare(
      `SELECT g.id, g.name, g.capacity, g.side,
              (SELECT COUNT(*) FROM tickets t WHERE t.entry_gate_id = g.id) AS assigned
       FROM gates g ORDER BY g.id`,
    )
    .all();
  const gatesWithLoad = gates.map((g) => {
    const load = predictedLoad(g.assigned, g.capacity, g.id);
    return { ...g, load: Number(load.toFixed(3)), status: loadStatus(load) };
  });

  const parking = db
    .prepare(
      `SELECT p.id, p.name, p.capacity,
              (SELECT COUNT(*) FROM tickets t WHERE t.parking_zone_id = p.id) AS assigned
       FROM parking_zones p ORDER BY p.id`,
    )
    .all();
  const parkingWithLoad = parking.map((p) => {
    const load = predictedLoad(p.assigned, p.capacity, p.id + 50);
    return { ...p, load: Number(load.toFixed(3)), status: loadStatus(load) };
  });

  const shuttles = db
    .prepare(
      `SELECT s.id, s.zone, s.capacity, s.departure_time, s.match_id,
              (SELECT COUNT(*) FROM shuttle_assignments sa WHERE sa.shuttle_id = s.id) AS booked
       FROM shuttles s ORDER BY s.match_id, s.zone, s.departure_time`,
    )
    .all();
  const shuttleWithLoad = shuttles.map((s) => {
    const load = predictedLoad(s.booked, s.capacity, s.id + 100);
    return { ...s, load: Number(load.toFixed(3)), status: loadStatus(load) };
  });

  const revenueRows = db
    .prepare('SELECT type, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total FROM referral_events GROUP BY type')
    .all();
  const byType = Object.fromEntries(revenueRows.map((r) => [r.type, { count: r.count, total: r.total }]));

  // Tickets whose route was visibly reassigned by the load-aware engine.
  const rerouted = db
    .prepare("SELECT COUNT(*) AS c FROM tickets WHERE routing_decision LIKE '%\"reassigned\":true%'")
    .get().c;

  res.json({
    gates: gatesWithLoad,
    parking: parkingWithLoad,
    shuttles: shuttleWithLoad,
    revenue: {
      hotel: byType.hotel ?? { count: 0, total: 0 },
      airtel_tv: byType.airtel_tv ?? { count: 0, total: 0 },
      grand_total:
        Math.round((byType.hotel?.total ?? 0) + (byType.airtel_tv?.total ?? 0)),
    },
    tickets: db.prepare('SELECT COUNT(*) AS c FROM tickets').get().c,
    matches: db.prepare('SELECT COUNT(*) AS c FROM matches').get().c,
    rerouted,
  });
});