import { NextResponse } from 'next/server';
import { TOURISM_DATA } from '../../../lib/stadiaData';

export async function GET() {
  return NextResponse.json(TOURISM_DATA);
}
