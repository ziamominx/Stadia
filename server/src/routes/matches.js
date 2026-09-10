import { Router } from 'express';
import { db } from '../db.js';

export const matchesRouter = Router();

// GET /api/matches — list matches + timeline
matchesRouter.get('/', (req, res) => {
  const matches = db
    .prepare(
      `SELECT m.*, COUNT(t.id) AS tickets_sold
       FROM matches m
       LEFT JOIN tickets t ON t.match_id = m.id
       GROUP BY m.id
       ORDER BY m.kickoff_time`,
    )
    .all();
  res.json(matches);
});

// GET /api/matches/:id — single match detail
matchesRouter.get('/:id', (req, res) => {
  const match = db
    .prepare(
      `SELECT m.*, COUNT(t.id) AS tickets_sold
       FROM matches m
       LEFT JOIN tickets t ON t.match_id = m.id
       WHERE m.id = ?
       GROUP BY m.id`,
    )
    .get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

// GET /api/matches/:id/seats — seat map + availability
matchesRouter.get('/:id/seats', (req, res) => {
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const blocks = db
    .prepare(
      `SELECT b.id, b.block_name, b.capacity, b.price, b.lat, b.lng, COUNT(t.id) AS sold
       FROM seat_blocks b
       LEFT JOIN tickets t ON t.seat_block_id = b.id
       WHERE b.match_id = ?
       GROUP BY b.id
       ORDER BY b.id`,
    )
    .all(req.params.id);

  const soldSeats = db
    .prepare(
      `SELECT seat_block_id, seat_number FROM tickets t
       JOIN seat_blocks b ON b.id = t.seat_block_id
       WHERE b.match_id = ?`,
    )
    .all(req.params.id);

  const soldByBlock = {};
  for (const s of soldSeats) {
    (soldByBlock[s.seat_block_id] ??= new Set()).add(s.seat_number);
  }

  res.json({
    match,
    blocks: blocks.map((b) => ({
      ...b,
      sold: b.sold,
      available: Math.max(0, b.capacity - b.sold),
      soldSeats: [...(soldByBlock[b.id] ?? [])],
    })),
  });
});