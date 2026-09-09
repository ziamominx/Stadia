import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCENARIOS = [
  {
    id: 'demand_spike',
    title: '+30% Unregistered Demand Influx',
    domain: 'Capacity Saturation',
    code: 'SCEN-01',
    description: 'Models a 30% sudden surge of walk-in attendees and highway arrivals exceeding forecast models.',
    unmitigatedImpact: 'Immediate 100% saturation in Core Nerul hotels with 2.4x surge pricing. 48-minute gate entry queues and Sion-Panvel expressway gridlock.',
    orchestratedOutcome: 'Automated redistribution of reservations to Kharghar & Belapur transit corridors. Fast-track early arrival incentive broadcasts to disperse peak.'
  },
  {
    id: 'rain_delay',
    title: '120-Minute Schedule Shift & Egress Overrun',
    domain: 'Schedule Disruption',
    code: 'SCEN-02',
    description: 'Weather suspension and overtime shifts event conclusion to 23:45, coinciding with reduced municipal night train schedules.',
    unmitigatedImpact: 'Over 14,000 visitors stranded at Nerul rail platforms with zero outbound local trains and severe crowd density.',
    orchestratedOutcome: 'Pre-emptive dispatch of 35 dedicated electric municipal bus loops and activation of partner hospitality zones to absorb egress flow.'
  },
  {
    id: 'gate_disruption',
    title: 'Electronic Turnstile Hardware Failure at North Gate A',
    domain: 'Perimeter Infrastructure',
    code: 'SCEN-03',
    description: 'Power surge disables 85% of automated turnstiles at primary North Gate A plaza.',
    unmitigatedImpact: 'Plaza queue exceeds 4,200 attendees with wait times escalating past 55 minutes.',
    orchestratedOutcome: 'Automated turnstile re-balancing protocol re-routes local ticket holders to West Gates G & H with direct push directives to third-party apps.'
  },
  {
    id: 'transit_outage',
    title: 'Suburban Rail Line Signal Failure (Harbour Corridor)',
    domain: 'Transit Interruption',
    code: 'SCEN-04',
    description: 'Complete stoppage of Harbour Line train movements between Mankhurd and Nerul stations.',
    unmitigatedImpact: 'Immediate diversion of 18,000 transit riders onto road arteries, triggering level-5 gridlock.',
    orchestratedOutcome: 'Direct trigger of dedicated express shuttle bridge from Vashi terminal with emergency priority bus lane enforcement.'
  }
];

export async function GET() {
  return NextResponse.json({ scenarios: SCENARIOS });
}

export async function POST(req) {
  try {
    const { scenarioId } = await req.json();
    if (!scenarioId) {
      return NextResponse.json({ error: 'scenarioId required' }, { status: 400 });
    }

    let surge = 0;
    let gateDisrupt = 'none';
    let transitOutage = 'none';

    if (scenarioId === 'demand_spike') {
      surge = 30;
    } else if (scenarioId === 'gate_disruption') {
      gateDisrupt = '1';
    } else if (scenarioId === 'transit_outage') {
      transitOutage = '3';
    }

    const stmt = db.prepare('INSERT OR REPLACE INTO simulation_state (key, value) VALUES (?, ?)');
    stmt.run('active_scenario', scenarioId);
    stmt.run('surge_pct', String(surge));
    stmt.run('gate_disruption_gate_id', gateDisrupt);
    stmt.run('transit_outage_corridor_id', transitOutage);
    stmt.run('last_updated', new Date().toISOString());

    db.prepare(`
      INSERT INTO active_interventions (scenario_id, action_type, title, description, impact_metric)
      VALUES (?, 'STRESS_TEST_ACTIVATED', 'Operational Drill Triggered', ?, 'Dynamic telemetry active')
    `).run(scenarioId, `Drill scenario ${scenarioId} executed from command console.`);

    return NextResponse.json({ ok: true, activeScenario: scenarioId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
