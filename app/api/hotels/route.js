import { NextResponse } from 'next/server';
import { HOTELS_DATA } from '../../../lib/stadiaData';

export async function GET() {
  return NextResponse.json(HOTELS_DATA);
}
