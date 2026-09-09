import { Router } from 'express';
import { db } from '../db.js';

export const tourismRouter = Router();

// GET /api/tourism — static tourist spot recommendations
tourismRouter.get('/', (req, res) => {
  const spots = db.prepare('SELECT * FROM tourist_spots ORDER BY id').all();
  res.json(spots);
});