import { Router } from 'express';
import { db } from '../db.js';
import { haversineKm } from '../lib/geo.js';

export const hotelsRouter = Router();

// Real DY Patil Stadium coordinates (Nerul, Navi Mumbai).
const CENTER = { lat: 19.04194, lng: 73.02667 };

// GET /api/hotels — partner hotels with distance from stadium
hotelsRouter.get('/', (req, res) => {
  const hotels = db.prepare('SELECT * FROM hotels ORDER BY id').all();
  res.json(
    hotels.map((h) => ({
      ...h,
      distance_from_stadium_km: Number(haversineKm(CENTER, h).toFixed(1)),
    })),
  );
});