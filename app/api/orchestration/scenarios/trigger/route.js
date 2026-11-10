import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { scenarioId } = body;
    if (!scenarioId) {
      return NextResponse.json({ error: 'scenarioId required' }, { status: 400 });
    }

    const ecosystem = stadiaStore.triggerScenario(scenarioId);
    return NextResponse.json({
      ok: true,
      scenarioId,
      status: 'CRISIS_ACTIVE',
      ecosystem,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
