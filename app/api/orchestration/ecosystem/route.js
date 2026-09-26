import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function GET() {
  const data = stadiaStore.getEcosystem();
  return NextResponse.json(data);
}
