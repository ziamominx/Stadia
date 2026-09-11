import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function GET() {
  const ecosystem = stadiaStore.getEcosystem();
  return NextResponse.json(ecosystem.zones);
}
