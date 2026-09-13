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
      `Digital Pass: https://stadia-platform.vercel.app/ticket/${ticketId}\n\n` +
      `Show QR at turnstile for express biometric/contactless boarding.`;

    return NextResponse.json({
      ok: true,
      status: 'dispatched',
      channel: 'whatsapp_business_api',
      recipient: phone || '+91 98200 12345',
      messagePreview: message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
