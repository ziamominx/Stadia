import { NextResponse } from 'next/server';
import { MATCHES_DATA } from '../../../../lib/stadiaData';

export async function GET(request, { params }) {
  const { ticketId } = await params;

  const match = MATCHES_DATA[0];

  const ticket = {
    unique_ticket_id: ticketId,
    seat_number: 'C12',
    visitor_type: 'local',
    travel_mode: 'transit',
    block_name: 'A1',
    user_name: 'Fan Spectator',
    status: 'active',
  };

  const entry_gate = {
    name: 'Gate A · North Concourse',
    side: 'local',
    capacity: 7500,
    lat: 19.0601,
    lng: 73.0075,
  };

  const parking_zone = {
    name: 'P1 · Nerul West Grounds',
    lat: 19.0611,
    lng: 73.0063,
  };

  const itinerary = [
    { time: '16:45', title: 'Board Suburban Rail / Metro', desc: 'Depart from Harbour Line connection toward Nerul station.' },
    { time: '17:15', title: 'Arrive at Nerul Transit Hub', desc: 'Proceed along marked West Spine pedestrian corridor.' },
    { time: '17:35', title: 'Concourse Turnstiles Gate A', desc: 'Scan biometric digital QR pass at optical express turnstiles.' },
    { time: '17:45', title: 'Take Pitchside Seat', desc: 'Arrive at Block A1, Seat C12 ahead of national anthems.' },
  ];

  return NextResponse.json({
    ticket,
    match,
    entry_gate,
    parking_zone,
    itinerary,
  });
}
