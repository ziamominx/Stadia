import { NextResponse } from 'next/server';
import { BLOCKS_DATA } from '@/lib/stadiaData';

export async function GET() {
  return NextResponse.json(BLOCKS_DATA);
}
