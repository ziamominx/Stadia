import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function GET() {
  const summary = stadiaStore.getReferralsSummary();
  return NextResponse.json(summary);
}
