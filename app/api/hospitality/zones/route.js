import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function GET() {
  const ecosystem = stadiaStore.getEcosystem();
  const zones = (ecosystem.zones || []).map((z) => ({
    ...z,
    available_rooms: z.available_rooms ?? Math.max(0, (z.total_rooms || 0) - (z.booked_rooms || 0)),
  }));
  return NextResponse.json(zones);
}
