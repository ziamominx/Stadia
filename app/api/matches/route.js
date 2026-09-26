import { NextResponse } from 'next/server';
import { MATCHES_DATA } from '../../../lib/stadiaData';

export async function GET() {
  return NextResponse.json(MATCHES_DATA);
}
