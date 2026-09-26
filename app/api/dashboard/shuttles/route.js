import { NextResponse } from 'next/server';
import { SHUTTLES_DATA } from '@/lib/stadiaData';

export async function GET() {
  return NextResponse.json(SHUTTLES_DATA);
}
