import { NextResponse } from 'next/server';
import { MATCHES_DATA, BLOCKS_DATA, HOTELS_DATA } from '../../../../lib/stadiaData';
import { stadiaStore } from '../../../../lib/stadiaStore';
import { DY_PATIL, STADIUM_GATES, STADIUM_HOTELS, STADIUM_PARKING } from '../../../../lib/operations/dy-patil.mjs';

export async function GET(request, { params }) {
  const { ticketId } = await params;

  const booking = stadiaStore.getBooking(ticketId);
  if (!booking) {
    return NextResponse.json({ error: 'Ticket not found. Check the pass ID or book a match first.' }, { status: 404 });
  }
  const match = booking.matchSnapshot || MATCHES_DATA.find((m) => m.id === booking.matchId) || MATCHES_DATA[0];
  const block = BLOCKS_DATA.find((b) => b.id === booking.seatBlockId) || BLOCKS_DATA[0];

  const isLocal = booking.visitor_type !== 'outstation';
  const isVehicle = isLocal && booking.travel_mode === 'vehicle';
  const gateA = STADIUM_GATES[0], gateC = STADIUM_GATES[2], gateD = STADIUM_GATES[3], gateG = STADIUM_GATES[6];
  const p1 = STADIUM_PARKING[0];

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
        lat: gateA.lat,
        lng: gateA.lng,
      }
    : {
        id: 3,
        name: 'Gate C · East',
        side: 'outstation',
        capacity: 9000,
        lat: gateC.lat,
        lng: gateC.lng,
      };

  const exitGate = isLocal
    ? {
        id: 7,
        name: 'Gate G · West Concourse',
        side: 'local',
        capacity: 8000,
        lat: gateG.lat,
        lng: gateG.lng,
      }
    : {
        id: 4,
        name: 'Gate D · South-East',
        side: 'outstation',
        capacity: 9500,
        lat: gateD.lat,
        lng: gateD.lng,
      };

  const parkingZone = isVehicle
    ? {
        id: 1,
        name: 'P1 · Nerul West Grounds',
        lat: p1.lat,
        lng: p1.lng,
      }
    : null;

  const hotel = !isLocal
    ? (HOTELS_DATA.find((h) => String(h.id) === String(booking.hotelId)) || HOTELS_DATA[0])
    : null;
  const hotelPoint = STADIUM_HOTELS.find((point) => point.name === hotel?.name) || STADIUM_HOTELS.find((point) => point.name === 'The Grand Vashi');

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
            lat: p1.lat,
            lng: p1.lng,
            label: isVehicle ? 'Parking P1 · Nerul West Grounds' : 'Nerul Station West Spine',
            color: 'amber',
          },
          { lat: gateA.lat, lng: gateA.lng, label: 'Gate A · Entry Turnstiles', color: 'emerald' },
          { lat: gateG.lat, lng: gateG.lng, label: 'Gate G · Post-Match Exit', color: 'rose' },
          { lat: DY_PATIL.lat, lng: DY_PATIL.lng, label: `Stadium bowl · Block ${block.block_name}, Seat ${ticket.seat_number}`, color: 'sky' },
        ]
      : [
          {
            lat: hotelPoint.lat,
            lng: hotelPoint.lng,
            label: `${hotel?.name || 'Partner Hotel'} · Shuttle Departure Point`,
            color: 'amber',
          },
          { lat: gateC.lat, lng: gateC.lng, label: 'Gate C · Outstation Entry Turnstiles', color: 'emerald' },
          { lat: gateD.lat, lng: gateD.lng, label: 'Gate D · Post-Match Exit', color: 'rose' },
          { lat: DY_PATIL.lat, lng: DY_PATIL.lng, label: `Stadium bowl · Block ${block.block_name}, Seat ${ticket.seat_number}`, color: 'sky' },
        ],
    entry: isLocal
      ? [
          [p1.lat, p1.lng],
          [gateA.lat, gateA.lng],
          [DY_PATIL.lat, DY_PATIL.lng],
        ]
      : [
          [hotelPoint.lat, hotelPoint.lng],
          [gateC.lat, gateC.lng],
          [DY_PATIL.lat, DY_PATIL.lng],
        ],
    exit: isLocal
      ? [
          [DY_PATIL.lat, DY_PATIL.lng],
          [gateG.lat, gateG.lng],
          [p1.lat, p1.lng],
        ]
      : [
          [DY_PATIL.lat, DY_PATIL.lng],
          [gateD.lat, gateD.lng],
          [hotelPoint.lat, hotelPoint.lng],
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
      price: booking.price ?? block.price,
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
