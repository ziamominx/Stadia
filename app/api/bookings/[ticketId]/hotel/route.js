import { NextResponse } from 'next/server';
import { stadiaStore } from '../../../../../lib/stadiaStore';

export async function POST(request, { params }) {
  const { ticketId } = await params;
  try {
    const body = await request.json();
    const booking = stadiaStore.selectHotel(
      ticketId,
      body.hotelId,
      body.checkin || '2026-06-12',
      body.checkout || '2026-06-14'
    );

    return NextResponse.json({
      success: true,
      ticketId,
      hotelBooking: booking.hotelBooking,
      status: 'CONFIRMED',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reserve hotel' }, { status: 500 });
  }
}
