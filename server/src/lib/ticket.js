import { db } from '../db.js';
import { shuttleZoneCoords } from './assignment.js';

function buildRoute(d) {
  const markers = [];
  const entry = [];
  const exit = [];
  const t = d.ticket;

  if (t.visitor_type === 'local') {
    if (t.travel_mode === 'vehicle' && d.parkingZone) {
      entry.push(
        [d.parkingZone.lat, d.parkingZone.lng],
        [d.entryGate.lat, d.entryGate.lng],
        [d.block.lat, d.block.lng],
      );
      exit.push(
        [d.block.lat, d.block.lng],
        [d.exitGate.lat, d.exitGate.lng],
        [d.parkingZone.lat, d.parkingZone.lng],
      );
      markers.push({
        lat: d.parkingZone.lat,
        lng: d.parkingZone.lng,
        label: `Parking ${d.parkingZone.name}`,
        color: 'amber',
      });
    } else {
      entry.push([d.entryGate.lat, d.entryGate.lng], [d.block.lat, d.block.lng]);
      exit.push([d.block.lat, d.block.lng], [d.exitGate.lat, d.exitGate.lng]);
    }
    markers.push({
      lat: d.entryGate.lat,
      lng: d.entryGate.lng,
      label: `${d.entryGate.name} · entry`,
      color: 'emerald',
    });
    markers.push({
      lat: d.exitGate.lat,
      lng: d.exitGate.lng,
      label: `${d.exitGate.name} · exit`,
      color: 'rose',
    });
    markers.push({
      lat: d.block.lat,
      lng: d.block.lng,
      label: `Seat ${t.seat_number} · Block ${d.block.block_name}`,
      color: 'sky',
    });
  } else if (d.hotel && d.shuttle) {
    const zone = shuttleZoneCoords(d.shuttle.zone);
    entry.push(
      [d.hotel.lat, d.hotel.lng],
      [zone.lat, zone.lng],
      [d.entryGate.lat, d.entryGate.lng],
      [d.block.lat, d.block.lng],
    );
    exit.push([d.block.lat, d.block.lng], [d.exitGate.lat, d.exitGate.lng], [zone.lat, zone.lng]);
    markers.push({ lat: d.hotel.lat, lng: d.hotel.lng, label: d.hotel.name, color: 'violet' });
    markers.push({
      lat: zone.lat,
      lng: zone.lng,
      label: `Shuttle ${d.shuttle.zone} · ${d.shuttle.departure_time}`,
      color: 'emerald',
    });
    markers.push({
      lat: d.entryGate.lat,
      lng: d.entryGate.lng,
      label: `${d.entryGate.name} · entry`,
      color: 'sky',
    });
    markers.push({
      lat: d.exitGate.lat,
      lng: d.exitGate.lng,
      label: `${d.exitGate.name} · exit`,
      color: 'rose',
    });
    markers.push({
      lat: d.block.lat,
      lng: d.block.lng,
      label: `Seat ${t.seat_number} · Block ${d.block.block_name}`,
      color: 'amber',
    });
  }

  return { entry, exit, markers };
}

export function getTicketDetail(id) {
  let ticket = db.prepare('SELECT * FROM tickets WHERE unique_ticket_id = ?').get(id);
  if (!ticket && /^\d+$/.test(String(id))) {
    ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(Number(id));
  }
  if (!ticket) return null;

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(ticket.match_id);
  const block = db.prepare('SELECT * FROM seat_blocks WHERE id = ?').get(ticket.seat_block_id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(ticket.user_id);
  const entryGate = ticket.entry_gate_id
    ? db.prepare('SELECT * FROM gates WHERE id = ?').get(ticket.entry_gate_id)
    : null;
  const exitGate = ticket.exit_gate_id
    ? db.prepare('SELECT * FROM gates WHERE id = ?').get(ticket.exit_gate_id)
    : null;
  const parkingZone = ticket.parking_zone_id
    ? db.prepare('SELECT * FROM parking_zones WHERE id = ?').get(ticket.parking_zone_id)
    : null;
  const hotelBooking = db.prepare('SELECT * FROM hotel_bookings WHERE ticket_id = ?').get(ticket.id);
  const hotel = hotelBooking
    ? db.prepare('SELECT * FROM hotels WHERE id = ?').get(hotelBooking.hotel_id)
    : null;
  const shuttleAssignment = db
    .prepare('SELECT * FROM shuttle_assignments WHERE ticket_id = ?')
    .get(ticket.id);
  const shuttle = shuttleAssignment
    ? db.prepare('SELECT * FROM shuttles WHERE id = ?').get(shuttleAssignment.shuttle_id)
    : null;
  const claims = db
    .prepare('SELECT type FROM referral_events WHERE ticket_id = ?')
    .all(ticket.id)
    .map((r) => r.type);

  let routingDecision = null;
  if (ticket.routing_decision) {
    try {
      routingDecision = JSON.parse(ticket.routing_decision);
    } catch {
      routingDecision = null;
    }
  }

  const detail = {
    ticket,
    match,
    block,
    user,
    entryGate,
    exitGate,
    parkingZone,
    transitHint: ticket.transit_hint,
    hotel,
    hotelBooking,
    shuttle,
    claims,
    routingDecision,
  };
  detail.route = buildRoute(detail);
  return detail;
}