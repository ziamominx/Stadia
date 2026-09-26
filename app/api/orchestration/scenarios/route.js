import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function GET() {
  const scenarios = stadiaStore.getScenarios();
  return NextResponse.json(scenarios);
}
