import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { matchId = 1, seatBlockId = 1, seatNumber = 'C12', user = {} } = body;
    
    // Generate unique cryptographically-styled FIFA ticket ID
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const ticketId = `FWC-${matchId}-A1-${randomHex}`;

    return NextResponse.json({
      ticketId,
      matchId,
      seatBlockId,
      seatNumber,
      user,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}
