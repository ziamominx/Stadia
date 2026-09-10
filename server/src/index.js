import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, initSchema } from './db.js';
import { seed } from './seed.js';
import { matchesRouter } from './routes/matches.js';
import { hotelsRouter } from './routes/hotels.js';
import { bookingsRouter } from './routes/bookings.js';
import { notificationsRouter } from './routes/notifications.js';
import { dashboardRouter } from './routes/dashboard.js';
import { tourismRouter } from './routes/tourism.js';
import { referralsRouter } from './routes/referrals.js';
import { authRouter } from './routes/auth.js';
import { orchestrationRouter } from './routes/orchestration.js';
import { hospitalityRouter } from './routes/hospitality.js';
import { itineraryRouter } from './routes/itinerary.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

initSchema();
if (db.prepare('SELECT COUNT(*) AS c FROM matches').get().c === 0 || db.prepare('SELECT COUNT(*) AS c FROM mega_events').get().c === 0) {
  console.log('Seeding demo data & mega-event orchestration tables…');
  seed();
}

const app = express();
app.disable('x-powered-by');
app.use(cors());
// Vercel serverless functions run behind a proxy; trust it so req.protocol / IPs resolve.
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/orchestration', orchestrationRouter);
app.use('/api/hospitality', hospitalityRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/notifications/whatsapp', notificationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/tourism', tourismRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orchestration', orchestrationRouter);
app.use('/api/hospitality', hospitalityRouter);
app.use('/api/itinerary', itineraryRouter);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Serve the built client (npm run build) in production mode.
// Skipped in serverless (Vercel serves the static build itself).
const dist = process.env.VERCEL
  ? null
  : join(__dirname, '..', '..', 'client', 'dist');
if (dist && fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(join(dist, 'index.html')));
}

export default app;

// Local CLI entry: `node src/index.js` boots a real server.
// In serverless (VERCEL=1) we export the app without binding a port.
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 4000;
  app.listen(PORT, () => {
    console.log(`⚽ STADIA — FWC India 2026 platform API listening on http://localhost:${PORT}`);
  });
}