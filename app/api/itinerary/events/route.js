import { NextResponse } from 'next/server';
import { INITIAL_EVENTS } from '../../../../lib/eventsData';

export async function GET() {
  return NextResponse.json({ events: INITIAL_EVENTS });
}
