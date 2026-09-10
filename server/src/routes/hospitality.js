import { Router } from 'express';
import { db } from '../db.js';

export const hospitalityRouter = Router();

// GET /api/hospitality/zones — Detailed accommodation zones & partner hotels
hospitalityRouter.get('/zones', (req, res) => {
  const zones = db.prepare('SELECT * FROM accommodation_zones ORDER BY id').all();
  const hotels = db.prepare('SELECT * FROM hotels ORDER BY id').all();

  const zonesWithHotels = zones.map(z => {
    const zoneHotels = hotels.filter(h => h.zone.toLowerCase().includes(z.name.toLowerCase().split(' ')[0]) || z.name.toLowerCase().includes(h.zone.toLowerCase()));
    const occupancyPct = Math.round((z.booked_rooms / z.total_rooms) * 100);
    return {
      ...z,
      occupancy_pct: occupancyPct,
      available_rooms: z.total_rooms - z.booked_rooms,
      hotels: zoneHotels
    };
  });

  res.json({ zones: zonesWithHotels });
});

// GET /api/hospitality/merchants — Dining & entertainment crowd dispersal partners
hospitalityRouter.get('/merchants', (req, res) => {
  const merchants = db.prepare('SELECT * FROM hospitality_merchants ORDER BY id').all();
  res.json({ merchants });
});
