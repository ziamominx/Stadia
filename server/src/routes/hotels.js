import { Router } from 'express';
import { db } from '../db.js';
import { haversineKm } from '../lib/geo.js';

export const hotelsRouter = Router();

const CENTER = { lat: 19.0583, lng: 73.0075 };

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