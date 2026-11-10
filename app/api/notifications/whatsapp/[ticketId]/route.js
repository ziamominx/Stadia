import { NextResponse } from 'next/server';
import { stadiaStore } from '../../../../../lib/stadiaStore';
import { MATCHES_DATA, BLOCKS_DATA } from '../../../../../lib/stadiaData';

export async function POST(request, { params }) {
  try {
    const { ticketId } = await params;
    const booking = stadiaStore.getBooking(ticketId);
    const match = MATCHES_DATA.find((m) => m.id === booking.matchId) || MATCHES_DATA[0];
    const block = BLOCKS_DATA.find((b) => b.id === booking.seatBlockId) || BLOCKS_DATA[0];

    const isLocal = booking.visitor_type !== 'outstation';
    const gate = isLocal ? 'Gate A · North Concourse' : 'Gate C · East Concourse';
    const seat = `Block ${block.block_name} · Seat ${booking.seatNumber || 'C12'}`;

    const message = `*FWWC INDIA 2026 MATCHDAY PASS*\n` +
      `Match: ${match.home_team} vs ${match.away_team}\n` +
      `Ticket: ${ticketId}\n` +
      `Gate: ${gate}\n` +
      `Seat: ${seat}\n` +
      `Digital Pass: ${new URL(`/ticket/${ticketId}/confirmation`, request.url).toString()}\n\n` +
      `Show QR code at optical express turnstiles for fast contactless entry.`;

    return NextResponse.json({
      ok: true,
      status: 'preview_only',
      channel: 'local_preview',
      recipient: booking.user?.phone || null,
      messagePreview: message,
      mock: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
