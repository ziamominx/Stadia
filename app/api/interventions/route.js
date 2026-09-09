import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { actionType, title, description, impactMetric } = await req.json();

    db.prepare(`
      INSERT INTO active_interventions (scenario_id, action_type, title, description, impact_metric)
      VALUES ('active', ?, ?, ?, ?)
    `).run(
      actionType || 'CROSS_AGENCY_DIRECTIVE',
      title || 'Tactical Load Rebalancing',
      description || 'Autonomous orchestration directive distributed to participating agencies.',
      impactMetric || '-35% Choke Risk'
    );

    // Transition simulation status to mitigated
    db.prepare("INSERT OR REPLACE INTO simulation_state (key, value) VALUES ('active_scenario', 'mitigated')").run();

    return NextResponse.json({
      ok: true,
      message: 'Tactical directive acknowledged and deployed to partner agency endpoints.',
      appliedDirective: { title, impactMetric }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
