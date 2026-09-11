// Vercel serverless entry: wraps the Express app so every /api request is
// handled by the same routes used in local development (npm run dev).
// The SQLite database lives in /tmp (the only writable directory on Vercel)
// and is seeded automatically on cold start via src/index.js.
import app from '../server/src/index.js';

export default async function handler(req, res) {
  if (req.originalUrl && req.url !== req.originalUrl) {
    req.url = req.originalUrl;
  }
  return app(req, res);
}
