import { NextResponse } from 'next/server';
import { MATCHES_DATA } from '../../../../lib/stadiaData';

export async function GET(request, { params }) {
  const { id } = await params;
  const match = MATCHES_DATA.find((m) => String(m.id) === String(id));
  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }
  return NextResponse.json(match);
}
