import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ticketId, type } = body;
    if (!ticketId || !type) {
      return NextResponse.json({ error: 'ticketId and type are required' }, { status: 400 });
    }

    const referral = stadiaStore.claimReferral(ticketId, type);
    return NextResponse.json({
      ok: true,
      ticketId,
      type,
      referral,
      message: `Discount successfully applied to pass ${ticketId}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
