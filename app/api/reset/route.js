import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('active_scenario', 'baseline')").run();
    db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('surge_pct', '0')").run();
    db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('gate_disruption_gate_id', 'none')").run();
    db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('transit_outage_corridor_id', 'none')").run();
    db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('last_updated', datetime('now'))").run();

    db.prepare(`
      INSERT INTO active_interventions (scenario_id, action_type, title, description, impact_metric)
      VALUES ('baseline', 'RESET', 'System Telemetry Baseline Restored', 'Operational parameters restored to nominal telemetry.', 'Nominal')
    `).run();

    return NextResponse.json({ ok: true, message: 'System telemetry restored to nominal baseline.' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
