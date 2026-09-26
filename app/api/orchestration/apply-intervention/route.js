import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const intervention = stadiaStore.applyIntervention(body);
    const ecosystem = stadiaStore.getEcosystem();
    return NextResponse.json({ ok: true, intervention, ecosystem });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
