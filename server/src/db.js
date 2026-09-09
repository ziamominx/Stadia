import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(join(dataDir, 'fwwc.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  home_location TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  kickoff_time TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT 'DY Patil Stadium, Nerul',
  status TEXT NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS seat_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL REFERENCES matches(id),
  block_name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price REAL NOT NULL,
  lat REAL,
  lng REAL
);

CREATE TABLE IF NOT EXISTS gates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  capacity INTEGER NOT NULL,
  side TEXT NOT NULL DEFAULT 'local' CHECK (side IN ('local','outstation'))
);

CREATE TABLE IF NOT EXISTS parking_zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  capacity INTEGER NOT NULL,
  nearest_gate_id INTEGER REFERENCES gates(id)
);

CREATE TABLE IF NOT EXISTS hotels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  tier TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  partner_commission_pct REAL NOT NULL,
  nightly_rate REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS shuttles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zone TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  departure_time TEXT NOT NULL,
  match_id INTEGER NOT NULL REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unique_ticket_id TEXT NOT NULL UNIQUE,
  match_id INTEGER NOT NULL REFERENCES matches(id),
  seat_block_id INTEGER NOT NULL REFERENCES seat_blocks(id),
  seat_number TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  visitor_type TEXT CHECK (visitor_type IN ('local','outstation')),
  travel_mode TEXT CHECK (travel_mode IN ('vehicle','transit')),
  entry_gate_id INTEGER REFERENCES gates(id),
  exit_gate_id INTEGER REFERENCES gates(id),
  parking_zone_id INTEGER REFERENCES parking_zones(id),
  transit_hint TEXT,
  routing_decision TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hotel_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  hotel_id INTEGER NOT NULL REFERENCES hotels(id),
  checkin TEXT,
  checkout TEXT,
  room_type TEXT
);

CREATE TABLE IF NOT EXISTS shuttle_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  shuttle_id INTEGER NOT NULL REFERENCES shuttles(id)
);

CREATE TABLE IF NOT EXISTS referral_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  type TEXT NOT NULL CHECK (type IN ('hotel','airtel_tv')),
  amount REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (ticket_id, type)
);

CREATE TABLE IF NOT EXISTS path_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('local_parking','local_transit','outstation_shuttle')),
  visitor_side TEXT NOT NULL CHECK (visitor_side IN ('local','outstation')),
  from_lat REAL NOT NULL,
  from_lng REAL NOT NULL,
  to_lat REAL NOT NULL,
  to_lng REAL NOT NULL,
  gate_id INTEGER REFERENCES gates(id),
  origin_ref TEXT,
  capacity INTEGER NOT NULL DEFAULT 1000
);

CREATE TABLE IF NOT EXISTS tourist_spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  distance_from_mumbai_km REAL NOT NULL,
  best_time TEXT,
  image_emoji TEXT
);

CREATE TABLE IF NOT EXISTS mega_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sports_match','mega_concert','global_summit','cultural_festival')),
  venue TEXT NOT NULL,
  venue_city TEXT NOT NULL DEFAULT 'Navi Mumbai',
  date_time TEXT NOT NULL,
  expected_attendance INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS accommodation_zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  total_rooms INTEGER NOT NULL,
  booked_rooms INTEGER NOT NULL,
  avg_rate INTEGER NOT NULL,
  surge_multiplier REAL NOT NULL DEFAULT 1.0,
  is_overflow_recommended INTEGER NOT NULL DEFAULT 0,
  transit_link_desc TEXT NOT NULL,
  shuttle_service_available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transit_corridors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('metro','suburban_rail','highway','park_ride_feeder')),
  capacity_per_hr INTEGER NOT NULL,
  current_load_pct INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'nominal',
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hospitality_merchants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dining','fan_park','entertainment')),
  capacity INTEGER NOT NULL,
  discount_pct INTEGER NOT NULL,
  voucher_code TEXT NOT NULL,
  egress_delay_mins INTEGER NOT NULL DEFAULT 45,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS simulation_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS active_interventions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_metric TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tickets_match ON tickets(match_id);
CREATE INDEX IF NOT EXISTS idx_tickets_block ON tickets(seat_block_id);
CREATE INDEX IF NOT EXISTS idx_tickets_entry_gate ON tickets(entry_gate_id);
CREATE INDEX IF NOT EXISTS idx_tickets_parking ON tickets(parking_zone_id);
CREATE INDEX IF NOT EXISTS idx_shuttle_assignments_shuttle ON shuttle_assignments(shuttle_id);
`;

export function initSchema() {
  db.exec(SCHEMA);
  // Lightweight migration for databases created before routing_decision existed.
  const ticketCols = db.prepare('PRAGMA table_info(tickets)').all().map((c) => c.name);
  if (!ticketCols.includes('routing_decision')) {
    db.exec('ALTER TABLE tickets ADD COLUMN routing_decision TEXT');
  }
}