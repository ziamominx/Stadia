import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      eventId = 'fifa-wwc-2026-final',
      attendeeType = 'local',
      travelMode = 'public_transit',
      earlyArrivalPreference = true
    } = body;

    const timeline = [
      { time: '16:30', title: 'Depart Origin', desc: 'Take Navi Mumbai Metro line toward Nerul Station.', icon: 'train' },
      { time: '17:10', title: 'Transit Corridor Arrival', desc: 'Arrive at East Spine. Synchronized feeder bus clears queue.', icon: 'bus' },
      { time: '17:35', title: 'Gate Ingress & Digital Scan', desc: 'Fast-track through Gate B turnstiles with zero wait time.', icon: 'ticket' },
      { time: '17:50', title: 'Seat Arrival & F&B Voucher', desc: 'Collect early-bird credit at Concourse Lounge.', icon: 'check' },
    ];

    return NextResponse.json({
      success: true,
      eventId,
      attendeeType,
      travelMode,
      timeline,
      recommendedGate: 'Gate B (East)',
      estimatedTransitMinutes: 45,
      co2SavedKg: 4.8,
      voucherCode: earlyArrivalPreference ? 'EARLYBIRD250' : null,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate itinerary plan' }, { status: 500 });
  }
}
