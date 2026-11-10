import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const intervention = stadiaStore.applyIntervention({
      scenario_id: body.scenario_id,
      action_type: body.action_type || body.actionType,
      title: body.title,
      description: body.description,
      impact_metric: body.impact_metric || body.impactMetric,
    });
    const ecosystem = stadiaStore.getEcosystem();
    return NextResponse.json({ ok: true, intervention, ecosystem });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
