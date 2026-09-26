import { NextResponse } from 'next/server';
import { stadiaStore } from '../../../lib/stadiaStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { matchId = 1, seatBlockId = 1, seatNumber = 'C12', user = {} } = body;

    const booking = stadiaStore.createBooking({
      matchId,
      seatBlockId,
      seatNumber,
      user,
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
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}
