import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function POST() {
  stadiaStore.reset();
  const ecosystem = stadiaStore.getEcosystem();
  return NextResponse.json({ ok: true, ecosystem });
}
