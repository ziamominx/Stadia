import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { scenario = 'baseline', surge_pct, rain_delay_hours, gate_disruption_gate_id, transit_outage_corridor_id } = body;
    const ecosystem = stadiaStore.setScenario(scenario, {
      surge_pct,
      rain_delay_hours,
      gate_disruption_gate_id,
      transit_outage_corridor_id,
    });
    return NextResponse.json({ ok: true, scenario, ecosystem });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
