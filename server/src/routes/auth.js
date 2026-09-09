import { Router } from 'express';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

const SECRET = process.env.JWT_SECRET || 'fwc-demo-secret';
const otps = new Map(); // phone -> { otp, expires }

// POST /api/auth/request-otp — mock OTP (logged to console, returned for demo)
authRouter.post('/request-otp', (req, res) => {
  const { phone } = req.body ?? {};
  if (!phone) return res.status(400).json({ error: 'phone is required' });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otps.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });
  console.log(`[Auth MOCK] OTP for ${phone}: ${otp}`);
  res.json({ mock: true, otp, expires_in: 300 });
});

// POST /api/auth/verify-otp — returns a JWT on success
authRouter.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body ?? {};
  const entry = otps.get(phone);
  if (!entry || entry.expires < Date.now()) {
    return res.status(401).json({ error: 'OTP expired — request a new one' });
  }
  if (entry.otp !== String(otp)) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }
  otps.delete(phone);
  const token = jwt.sign({ phone }, SECRET, { expiresIn: '7d' });
  res.json({ token, phone });
});