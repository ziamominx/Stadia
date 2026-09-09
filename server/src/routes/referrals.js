import { Router } from 'express';
import { db } from '../db.js';
import { hotelReferralAmount, AIRTEL_AMOUNT } from '../lib/referrals.js';

export const referralsRouter = Router();

// POST /api/referrals — track a referral claim (hotel or airtel_tv) per ticket
referralsRouter.post('/', (req, res) => {
  const { ticketId, type } = req.body ?? {};
  if (!ticketId || !['hotel', 'airtel_tv'].includes(type)) {
    return res.status(400).json({ error: 'ticketId and type (hotel|airtel_tv) are required' });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE unique_ticket_id = ?').get(ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  let amount;
  if (type === 'hotel') {
    const booking = db.prepare('SELECT * FROM hotel_bookings WHERE ticket_id = ?').get(ticket.id);
    if (!booking) return res.status(400).json({ error: 'No hotel booking on this ticket' });
    const hotel = db.prepare('SELECT * FROM hotels WHERE id = ?').get(booking.hotel_id);
    amount = hotelReferralAmount(hotel);
  } else {
    amount = AIRTEL_AMOUNT;
  }

  db.prepare(
    'INSERT OR IGNORE INTO referral_events (ticket_id, type, amount) VALUES (?, ?, ?)',
  ).run(ticket.id, type, amount);

  const event = db
    .prepare('SELECT * FROM referral_events WHERE ticket_id = ? AND type = ?')
    .get(ticket.id, type);
  res.status(201).json({ event });
});