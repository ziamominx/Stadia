import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, ticketId, matchName = 'India vs Australia', gate = 'Gate A · North', seat = 'A1-42' } = body;

    const message = `*FWWC INDIA 2026 MATCHDAY PASS*\n` +
      `Match: ${matchName}\n` +
      `Ticket: ${ticketId}\n` +
      `Assigned Gate: ${gate}\n` +
      `Seat: ${seat}\n` +
      `Digital Pass: ${new URL(`/ticket/${ticketId}`, request.url).toString()}\n\n` +
      `Show QR at turnstile for express biometric/contactless boarding.`;

    return NextResponse.json({
      ok: true,
      status: 'preview_only',
      channel: 'local_preview',
      recipient: phone || null,
      messagePreview: message,
      mock: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
