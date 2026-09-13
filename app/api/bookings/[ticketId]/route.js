import { NextResponse } from 'next/server';
import { MATCHES_DATA, BLOCKS_DATA, HOTELS_DATA } from '../../../../lib/stadiaData';
import { stadiaStore } from '../../../../lib/stadiaStore';

export async function GET(request, { params }) {
  const { ticketId } = await params;

  const booking = stadiaStore.getBooking(ticketId);
  const match = MATCHES_DATA.find((m) => m.id === booking.matchId) || MATCHES_DATA[0];
  const block = BLOCKS_DATA.find((b) => b.id === booking.seatBlockId) || BLOCKS_DATA[0];

  const isLocal = booking.visitor_type !== 'outstation';
  const isVehicle = isLocal && booking.travel_mode === 'vehicle';

  const ticket = {
    unique_ticket_id: booking.ticketId,
    seat_number: booking.seatNumber || 'C12',
    visitor_type: booking.visitor_type,
    travel_mode: booking.travel_mode,
    block_name: block.block_name,
    user_name: booking.user?.name || 'Fan Spectator',
    status: booking.status || 'confirmed',
  };

  const entryGate = isLocal
    ? {
        id: 1,
        name: 'Gate A · North Concourse',
        side: 'local',
        capacity: 7500,
        lat: 19.0601,
        lng: 73.0075,
      }
    : {
        id: 3,
        name: 'Gate C · East Concourse',
        side: 'outstation',
        capacity: 9000,
        lat: 19.0585,
        lng: 73.0090,
      };

  const exitGate = isLocal
    ? {
        id: 7,
        name: 'Gate G · West Concourse',
        side: 'local',
        capacity: 8000,
        lat: 19.0595,
        lng: 73.0068,
      }
    : {
        id: 4,
        name: 'Gate D · South Concourse',
        side: 'outstation',
        capacity: 9500,
        lat: 19.0575,
        lng: 73.0080,
      };

  const parkingZone = isVehicle
    ? {
        id: 1,
        name: 'P1 · Nerul West Grounds',
        lat: 19.0611,
        lng: 73.0063,
      }
    : null;

  const hotel = !isLocal
    ? (HOTELS_DATA.find((h) => String(h.id) === String(booking.hotelId)) || HOTELS_DATA[0])
    : null;

  const hotelBooking = !isLocal ? (booking.hotelBooking || {
    hotelId: hotel?.id || 1,
    hotelName: hotel?.name || 'The Grand Vashi',
    checkin: '2026-06-12',
    checkout: '2026-06-14',
    status: 'CONFIRMED',
  }) : null;

  const shuttle = !isLocal
    ? {
        zone: hotel?.zone ? `${hotel.zone} Hub` : 'Vashi Hub',
        departure_time: '17:30',
      }
    : null;

  const route = {
    markers: isLocal
      ? [
          {
            lat: 19.0611,
            lng: 73.0063,
            label: isVehicle ? 'Parking P1 · Nerul West Grounds' : 'Nerul Station West Spine',
            color: 'amber',
          },
          { lat: 19.0601, lng: 73.0075, label: 'Gate A · Entry Turnstiles', color: 'emerald' },
          { lat: 19.0595, lng: 73.0068, label: 'Gate G · Post-Match Exit', color: 'rose' },
          { lat: 19.0605, lng: 73.0078, label: `Seat ${ticket.seat_number} · Block ${block.block_name}`, color: 'sky' },
        ]
      : [
          {
            lat: 19.0757,
            lng: 72.9984,
            label: `${hotel?.name || 'Partner Hotel'} · Shuttle Departure Point`,
            color: 'amber',
          },
          { lat: 19.0585, lng: 73.0090, label: 'Gate C · Outstation Entry Turnstiles', color: 'emerald' },
          { lat: 19.0575, lng: 73.0080, label: 'Gate D · Post-Match Exit', color: 'rose' },
          { lat: 19.0605, lng: 73.0078, label: `Seat ${ticket.seat_number} · Block ${block.block_name}`, color: 'sky' },
        ],
    entry: isLocal
      ? [
          [19.0611, 73.0063],
          [19.0606, 73.0070],
          [19.0601, 73.0075],
          [19.0605, 73.0078],
        ]
      : [
          [19.0757, 72.9984],
          [19.0650, 73.0020],
          [19.0585, 73.0090],
          [19.0605, 73.0078],
        ],
    exit: isLocal
      ? [
          [19.0605, 73.0078],
          [19.0595, 73.0068],
          [19.0611, 73.0063],
        ]
      : [
          [19.0605, 73.0078],
          [19.0575, 73.0080],
          [19.0757, 72.9984],
        ],
  };

  const itinerary = isLocal
    ? [
        { time: '16:45', title: 'Board Suburban Rail / Metro', desc: 'Depart toward Nerul transit hub.' },
        { time: '17:15', title: 'Arrive at Nerul Transit Spine', desc: 'Proceed along marked West Spine pedestrian corridor.' },
        { time: '17:35', title: 'Concourse Turnstiles Gate A', desc: 'Scan biometric digital QR pass at optical express turnstiles.' },
        { time: '17:45', title: 'Take Pitchside Seat', desc: `Arrive at Block ${block.block_name}, Seat ${ticket.seat_number}.` },
      ]
    : [
        { time: '16:00', title: 'Hotel Express Shuttle Boarding', desc: `Board high-capacity coach at ${hotel?.name || 'Vashi Hub'}.` },
        { time: '16:45', title: 'Highway Dedicated Bus Lane Arrival', desc: 'Direct transit access via East Gate perimeter.' },
        { time: '17:15', title: 'Turnstiles Gate C (East Concourse)', desc: 'Priority outstation fan lane check-in.' },
        { time: '17:30', title: 'Concourse & Hospitality Lounge', desc: `Proceed to Block ${block.block_name}, Seat ${ticket.seat_number}.` },
      ];

  return NextResponse.json({
    ticket,
    match,
    block: {
      id: block.id,
      block_name: block.block_name,
      price: block.price,
      capacity: block.capacity,
      side: block.side,
    },
    entryGate,
    entry_gate: entryGate,
    exitGate,
    parkingZone,
    parking_zone: parkingZone,
    routingDecision: {
      reassigned: false,
      reason: isVehicle ? 'P1 is nearest parking zone (<300m walking)' : 'Public transit pedestrian corridor',
    },
    hotel,
    hotelBooking,
    shuttle,
    route,
    claims: booking.claims || [],
    itinerary,
  });
}
