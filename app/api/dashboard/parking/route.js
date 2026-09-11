import { NextResponse } from 'next/server';
import { PARKING_DATA } from '@/lib/stadiaData';

export async function GET() {
  return NextResponse.json(PARKING_DATA);
}
