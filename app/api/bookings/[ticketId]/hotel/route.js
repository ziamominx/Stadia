import { NextResponse } from 'next/server';
import { HOTELS_DATA } from '../../../../../lib/stadiaData';

export async function POST(request, { params }) {
  const { ticketId } = await params;
  try {
    const body = await request.json();
    const hotel = HOTELS_DATA.find((h) => String(h.id) === String(body.hotelId)) || HOTELS_DATA[0];
    return NextResponse.json({
      success: true,
      ticketId,
      hotelBooking: {
        hotelId: hotel.id,
        hotelName: hotel.name,
        checkin: body.checkin || '2026-06-12',
        checkout: body.checkout || '2026-06-13',
        status: 'CONFIRMED',
        confirmationCode: `STADIA-HTL-${Math.floor(100000 + Math.random() * 900000)}`
      }
    });
  } catch {
    return NextResponse.json({
      success: true,
      ticketId,
      status: 'CONFIRMED'
    });
  }
}
