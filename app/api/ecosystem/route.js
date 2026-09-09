import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const simState = Object.fromEntries(
      db.prepare('SELECT key, value FROM simulation_state').all().map(r => [r.key, r.value])
    );

    const activeScenario = simState.active_scenario || 'baseline';
    const surgePct = Number(simState.surge_pct || 0);
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

    // 2. Multimodal Transit Corridors
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

    // 3. Perimeter Gates & Turnstiles
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
        cap = Math.round(cap * 0.15);
      }
      const loadPct = cap > 0 ? Math.round((assigned / cap) * 100) : 100;
      const waitTimeMins = Math.max(2, Math.round((loadPct / 100) * 35));
      return {
        ...g,
        assigned,
        capacity: cap,
        load_pct: loadPct,
        projected_wait_mins: waitTimeMins,
        status: loadPct >= 90 ? 'critical' : loadPct >= 75 ? 'warning' : 'optimal'
      };
    });

    // 4. Third-Party Agency Sync Status
    const agencyConnectors = [
      {
        id: 'bookmyshow',
        name: 'BookMyShow Enterprise Ticketing Gateway',
        type: 'Ticketing Feed',
        status: 'synced',
        lastIngestion: '14s ago',
        recordsIngested: 37921,
        latencyMs: 38
      },
      {
        id: 'fifa_tms',
        name: 'FIFA Central Match Management System',
        type: 'Tournament Authority',
        status: 'synced',
        lastIngestion: '42s ago',
        recordsIngested: 9,
        latencyMs: 112
      },
      {
        id: 'hotel_pms',
        name: 'MMR Hospitality Consortium PMS Bridge',
        type: 'Accommodation PMS',
        status: 'synced',
        lastIngestion: '28s ago',
        recordsIngested: 23700,
        latencyMs: 84
      },
      {
        id: 'mmrda_transit',
        name: 'MMRDA Intelligent Transportation Telemetry',
        type: 'Transit SCADA',
        status: transitOutage !== 'none' ? 'degraded' : 'synced',
        lastIngestion: '6s ago',
        recordsIngested: 97500,
        latencyMs: 24
      }
    ];

    // 5. Active Directives & Interventions
    const activeDirectives = db.prepare('SELECT * FROM active_interventions ORDER BY id DESC LIMIT 6').all();

    // 6. Aggregate Health Metrics
    const avgHotelSaturation = Math.round(zones.reduce((a, b) => a + b.occupancy_pct, 0) / zones.length);
    const avgTransitLoad = Math.round(transit.reduce((a, b) => a + b.current_load_pct, 0) / transit.length);
    const flaggedGatesCount = gates.filter(g => g.status !== 'optimal').length;

    return NextResponse.json({
      activeScenario,
      metrics: {
        avgHotelSaturation,
        avgTransitLoad,
        flaggedGatesCount,
        totalRoomsTracked: zones.reduce((a, b) => a + b.total_rooms, 0),
        totalRoomsBooked: zones.reduce((a, b) => a + b.booked_rooms, 0),
        ecosystemHealthScore: Math.max(30, 100 - (flaggedGatesCount * 10 + (avgHotelSaturation > 80 ? 15 : 0) + (avgTransitLoad > 80 ? 15 : 0)))
      },
      zones,
      transit,
      gates,
      agencyConnectors,
      activeDirectives
    });
  } catch (error) {
    console.error('Error fetching ecosystem state:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
