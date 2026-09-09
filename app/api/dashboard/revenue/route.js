import { NextResponse } from 'next/server';
import { OVERVIEW_DATA } from '../../../../lib/stadiaData';

export async function GET() {
  return NextResponse.json(OVERVIEW_DATA.revenue);
}
