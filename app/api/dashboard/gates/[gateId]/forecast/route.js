import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function GET(request, { params }) {
  const { gateId } = await params;
  const forecast = stadiaStore.getGateForecast(gateId);
  return NextResponse.json(forecast);
}
