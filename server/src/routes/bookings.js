import { Router } from 'express';
import { db } from '../db.js';
import { ticketId } from '../lib/ids.js';
import { assignRoute, assignOutstation } from '../lib/assignment.js';
import { getTicketDetail } from '../lib/ticket.js';
import { sendWhatsApp } from '../lib/whatsapp.js';

export const bookingsRouter = Router();

// POST /api/bookings — create ticket (seat, user info)
bookingsRouter.post('/', (req, res) => {
  const { matchId, seatBlockId, seatNumber, user } = req.body ?? {};
  if (!matchId || !seatBlockId || !seatNumber || !user?.name) {
    return res.status(400).json({ error: 'matchId, seatBlockId, seatNumber and user.name are required' });
  }

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const block = db
    .prepare('SELECT * FROM seat_blocks WHERE id = ? AND match_id = ?')
    .get(seatBlockId, matchId);
  if (!block) return res.status(404).json({ error: 'Seat block not found for this match' });

  const taken = db
    .prepare('SELECT id FROM tickets WHERE seat_block_id = ? AND seat_number = ?')
    .get(seatBlockId, seatNumber);
  if (taken) return res.status(409).json({ error: 'That seat was just taken — please pick another' });

  const insertUser = db.prepare(
    'INSERT INTO users (name, phone, email, home_location) VALUES (?, ?, ?, ?)',
  );
  const u = insertUser.run(
    user.name,
    user.phone ?? null,
    user.email ?? null,
    user.homeLocation ?? null,
  );

  const insertTicket = db.prepare(
    `INSERT INTO tickets (unique_ticket_id, match_id, seat_block_id, seat_number, user_id)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const uniqueId = ticketId(matchId, block.block_name);
  insertTicket.run(uniqueId, matchId, seatBlockId, seatNumber, u.lastInsertRowid);

  const detail = getTicketDetail(uniqueId);
  // Brief confirmation message; full travel plan is sent once assigned.
  sendWhatsApp(detail);
  res.status(201).json({ ticketId: uniqueId });
});

// POST /api/bookings/:ticketId/travel-info — visitor type + travel mode
bookingsRouter.post('/:ticketId/travel-info', (req, res) => {
  const { visitorType, travelMode } = req.body ?? {};
  const detail = getTicketDetail(req.params.ticketId);
  if (!detail) return res.status(404).json({ error: 'Ticket not found' });

  if (visitorType === 'local') {
    if (!['vehicle', 'transit'].includes(travelMode)) {
      return res.status(400).json({ error: 'travelMode must be vehicle or transit for local visitors' });
    }
    const gates = db.prepare('SELECT * FROM gates').all();
    const parkingZones = db.prepare('SELECT * FROM parking_zones').all();
    const parkingLoads = new Map(
      db
        .prepare(
          'SELECT parking_zone_id, COUNT(*) AS c FROM tickets WHERE parking_zone_id IS NOT NULL GROUP BY parking_zone_id',
        )
        .all()
        .map((r) => [r.parking_zone_id, r.c]),
    );
    const { entryGate, exitGate, parkingZone, transitHint, decision } = assignRoute({
      gates,
      parkingZones,
      parkingLoads,
      block: detail.block,
      travelMode,
      visitorType: 'local',
    });

    db.prepare(
      `UPDATE tickets SET visitor_type = ?, travel_mode = ?, entry_gate_id = ?, exit_gate_id = ?,
       parking_zone_id = ?, transit_hint = ?, routing_decision = ?
       WHERE id = ?`,
    ).run(
      'local',
      travelMode,
      entryGate.id,
      exitGate.id,
      parkingZone?.id ?? null,
      transitHint,
      JSON.stringify(decision),
      detail.ticket.id,
    );

    const updated = getTicketDetail(req.params.ticketId);
    sendWhatsApp(updated);
    return res.json(updated);
  }

  if (visitorType === 'outstation') {
    db.prepare('UPDATE tickets SET visitor_type = ? WHERE id = ?').run('outstation', detail.ticket.id);
    return res.json(getTicketDetail(req.params.ticketId));
  }

  return res.status(400).json({ error: 'visitorType must be local or outstation' });
});

// POST /api/bookings/:ticketId/hotel — select hotel (outstation flow)
bookingsRouter.post('/:ticketId/hotel', (req, res) => {
  const { hotelId } = req.body ?? {};
  const detail = getTicketDetail(req.params.ticketId);
  if (!detail) return res.status(404).json({ error: 'Ticket not found' });

  const hotel = db.prepare('SELECT * FROM hotels WHERE id = ?').get(hotelId);
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  const gates = db.prepare('SELECT * FROM gates').all();
  const shuttles = db.prepare('SELECT * FROM shuttles WHERE match_id = ?').all(detail.match.id);
  const shuttleLoads = new Map();
  for (const s of shuttles) {
    const { c } = db
      .prepare('SELECT COUNT(*) AS c FROM shuttle_assignments WHERE shuttle_id = ?')
      .get(s.id);
    shuttleLoads.set(s.id, c);
  }

  const { entryGate, exitGate, shuttle, zone } = assignOutstation({
    gates,
    block: detail.block,
    shuttles,
    hotel,
    shuttleLoads,
  });

  // Mock hotel booking: 2 nights around match day.
  const ko = new Date(detail.match.kickoff_time);
  const checkin = new Date(ko);
  checkin.setDate(checkin.getDate() - 1);
  const checkout = new Date(ko);
  checkout.setDate(checkout.getDate() + 1);

  const insertHotel = db.prepare(
    'INSERT INTO hotel_bookings (ticket_id, hotel_id, checkin, checkout, room_type) VALUES (?, ?, ?, ?, ?)',
  );
  insertHotel.run(detail.ticket.id, hotel.id, checkin.toISOString(), checkout.toISOString(), 'Double');

  const insertShuttle = db.prepare(
    'INSERT INTO shuttle_assignments (ticket_id, shuttle_id) VALUES (?, ?)',
  );
  insertShuttle.run(detail.ticket.id, shuttle.id);

  db.prepare(
    'UPDATE tickets SET visitor_type = ?, entry_gate_id = ?, exit_gate_id = ? WHERE id = ?',
  ).run('outstation', entryGate.id, exitGate.id, detail.ticket.id);

  const updated = getTicketDetail(req.params.ticketId);
  sendWhatsApp(updated);
  res.json(updated);
});

// GET /api/bookings/:ticketId — full ticket details
bookingsRouter.get('/:ticketId', (req, res) => {
  const detail = getTicketDetail(req.params.ticketId);
  if (!detail) return res.status(404).json({ error: 'Ticket not found' });
  res.json(detail);
});