import { NextResponse } from 'next/server';
import { MATCHES_DATA, BLOCKS_DATA } from '../../../../../lib/stadiaData';

export async function GET(request, { params }) {
  const { id } = await params;
  const match = MATCHES_DATA.find((m) => String(m.id) === String(id));
  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  const blocks = BLOCKS_DATA.map((b) => ({
    id: b.id,
    block_name: b.block_name,
    capacity: b.capacity,
    price: b.price,
    sold: b.sold,
    available: Math.max(0, b.capacity - b.sold),
    soldSeats: ['A1', 'A2', 'A3', 'B1', 'B2', 'C4', 'D10', 'D11'],
  }));

  return NextResponse.json({
    match,
    blocks,
  });
}
