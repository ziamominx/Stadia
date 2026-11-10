import { NextResponse } from 'next/server';
import { MATCHES_DATA, BLOCKS_DATA } from '../../../../../lib/stadiaData';
import { stadiaStore } from '../../../../../lib/stadiaStore';

export async function GET(request, { params }) {
  const { id } = await params;
  const match = MATCHES_DATA.find((m) => String(m.id) === String(id));
  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  const blocks = BLOCKS_DATA.map((b) => {
    const bookedSeats = stadiaStore.bookings
      .filter((booking) => String(booking.matchId) === String(id) && booking.seatBlockId === b.id)
      .map((booking) => booking.seatNumber);
    return {
      id: b.id,
      block_name: b.block_name,
      capacity: b.capacity,
      price: b.price,
      sold: b.sold + bookedSeats.length,
      available: Math.max(0, b.capacity - b.sold - bookedSeats.length),
      soldSeats: ['A1', 'A2', 'A3', 'B1', 'B2', 'C4', 'D10', 'D11', ...bookedSeats],
    };
  });

  return NextResponse.json({
    match,
    blocks,
  });
}
