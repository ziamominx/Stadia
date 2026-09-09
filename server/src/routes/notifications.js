import { Router } from 'express';
import { getTicketDetail } from '../lib/ticket.js';
import { sendWhatsApp } from '../lib/whatsapp.js';

export const notificationsRouter = Router();

// POST /api/notifications/whatsapp/:ticketId — send/resend confirmation
notificationsRouter.post('/:ticketId', async (req, res) => {
  const detail = getTicketDetail(req.params.ticketId);
  if (!detail) return res.status(404).json({ error: 'Ticket not found' });
  const result = await sendWhatsApp(detail);
  res.json(result);
});