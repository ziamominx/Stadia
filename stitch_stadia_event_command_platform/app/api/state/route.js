import { NextResponse } from 'next/server';
import { getEventState } from '@/lib/eventState';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getEventState());
}
