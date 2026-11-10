import { NextResponse } from 'next/server';
import { GATES_DATA } from '@/lib/stadiaData';
import { STADIUM_GATES } from '@/lib/operations/dy-patil.mjs';

export async function GET() {
  return NextResponse.json(GATES_DATA.map((gate, index) => ({ ...gate, lat: STADIUM_GATES[index].lat, lng: STADIUM_GATES[index].lng })));
}
