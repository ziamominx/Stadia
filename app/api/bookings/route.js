import { NextResponse } from 'next/server';
import { stadiaStore } from '../../../lib/stadiaStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { matchId, seatBlockId, seatNumber, user, matchSnapshot, price } = body;

    const booking = stadiaStore.createBooking({
      matchId,
      seatBlockId,
      seatNumber,
      user,
      matchSnapshot,
      price,
    });

    return NextResponse.json({
      ticketId: booking.ticketId,
      matchId: booking.matchId,
      seatBlockId: booking.seatBlockId,
      seatNumber: booking.seatNumber,
      user: booking.user,
      status: booking.status,
      createdAt: booking.createdAt,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to process booking' }, { status: 400 });
  }
}
