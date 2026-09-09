import { pathToFileURL } from 'node:url';
import { db, initSchema } from './db.js';
import { SHUTTLE_ZONES, TRANSIT_STATIONS, assignRoute, assignOutstation } from './lib/assignment.js';
import { nearest } from './lib/geo.js';
import { ticketId } from './lib/ids.js';
import { allSeatLabels } from './lib/seats.js';
import { hotelReferralAmount, AIRTEL_AMOUNT } from './lib/referrals.js';

const CENTER = { lat: 19.0583, lng: 73.0075 };

const GATES = [
  { name: 'Gate A · North', lat: 19.0601, lng: 73.0075, capacity: 0, side: 'local' },
  { name: 'Gate B · North-East', lat: 19.0599, lng: 73.0092, capacity: 0, side: 'local' },
  { name: 'Gate C · East', lat: 19.0583, lng: 73.0097, capacity: 0, side: 'outstation' },
  { name: 'Gate D · South-East', lat: 19.0567, lng: 73.0092, capacity: 0, side: 'outstation' },
  { name: 'Gate E · South', lat: 19.0565, lng: 73.0075, capacity: 0, side: 'outstation' },
  { name: 'Gate F · South-West', lat: 19.0567, lng: 73.0058, capacity: 0, side: 'outstation' },
  { name: 'Gate G · West', lat: 19.0583, lng: 73.0053, capacity: 0, side: 'local' },
  { name: 'Gate H · North-West', lat: 19.0599, lng: 73.0058, capacity: 0, side: 'local' },
];

const PARKING = [
  { name: 'P1 · Nerul West Grounds', lat: 19.0611, lng: 73.0063, capacity: 0, nearest_gate: 'Gate A · North' },
  { name: 'P2 · Sector 14 Multi-Level', lat: 19.0609, lng: 73.0099, capacity: 0, nearest_gate: 'Gate B · North-East' },
  { name: 'P3 · DY Patil College Grounds', lat: 19.0593, lng: 73.0047, capacity: 0, nearest_gate: 'Gate G · West' },
  { name: 'P4 · Palm Beach Road Lot', lat: 19.0607, lng: 73.0049, capacity: 0, nearest_gate: 'Gate H · North-West' },
  { name: 'P5 · Nerul Station Overflow', lat: 19.0618, lng: 73.0080, capacity: 0, nearest_gate: 'Gate A · North' },
];

const HOTELS = [
  { name: 'The Grand Vashi', zone: 'Vashi', tier: 'Luxury', lat: 19.0757, lng: 72.9984, commission: 12, rate: 18000 },
  { name: 'Hotel Orchid Vashi', zone: 'Vashi', tier: 'Premium', lat: 19.0793, lng: 72.9988, commission: 10, rate: 12000 },
  { name: 'OYO Flagship Vashi', zone: 'Vashi', tier: 'Budget', lat: 19.0777, lng: 73.0012, commission: 8, rate: 6000 },
  { name: 'Radisson Blu Belapur', zone: 'Belapur', tier: 'Luxury', lat: 19.0317, lng: 73.0364, commission: 12, rate: 20000 },
  { name: 'Fortune Select Seawoods', zone: 'Seawoods', tier: 'Premium', lat: 19.04, lng: 73.01, commission: 10, rate: 13000 },
  { name: 'Savoy Seawoods', zone: 'Seawoods', tier: 'Budget', lat: 19.042, lng: 73.006, commission: 8, rate: 6500 },
  { name: 'Novotel Mumbai (Nerul)', zone: 'Nerul', tier: 'Luxury', lat: 19.0349, lng: 73.0198, commission: 11, rate: 16500 },
  { name: 'Lemon Tree Nerul', zone: 'Nerul', tier: 'Premium', lat: 19.0439, lng: 73.0189, commission: 10, rate: 11500 },
  { name: 'Hotel Sea Breeze Nerul', zone: 'Nerul', tier: 'Budget', lat: 19.045, lng: 73.015, commission: 8, rate: 5500 },
  { name: 'Taj Santacruz (Airport)', zone: 'Airport-belt', tier: 'Luxury', lat: 19.0957, lng: 72.8711, commission: 13, rate: 22000 },
  { name: 'Holiday Inn Mumbai Airport', zone: 'Airport-belt', tier: 'Premium', lat: 19.093, lng: 72.867, commission: 10, rate: 12500 },
  { name: 'Zostel Airport Stay', zone: 'Airport-belt', tier: 'Budget', lat: 19.099, lng: 72.873, commission: 8, rate: 4500 },
];

const TOURIST_SPOTS = [
  { name: 'Lonavala', emoji: '⛰️', desc: 'Hill station famous for Tiger Point views, misty lakes and chikki. About a 90-minute drive from Navi Mumbai.', dist: 84, best: 'Monsoon & winter' },
  { name: 'Mahabaleshwar', emoji: '🌲', desc: 'Strawberry farms, viewpoints like Arthur\'s Seat and Elephant\'s Head, and Mapro Garden treats.', dist: 120, best: 'Oct – Jun' },
  { name: 'Matheran', emoji: '🚂', desc: 'Asia\'s only automobile-free hill station. Heritage toy train from Neral station.', dist: 80, best: 'Winter' },
  { name: 'Mumbai Darshan', emoji: '🌉', desc: 'Gateway of India, Marine Drive, CSMT heritage building, Juhu Beach and a Bollywood studio tour.', dist: 24, best: 'Evenings' },
  { name: 'Alibaug', emoji: '🏖️', desc: 'Quiet beaches (Varsoli, Awas, Kihim), Kolaba fort and the scenic ferry ride from the Gateway.', dist: 95, best: 'Nov – Feb' },
];

const MATCHES = [
  { home: 'India', away: 'Australia', dayOffset: 3, hour: 19, minute: 30, label: 'Opening Match' },
  { home: 'Brazil', away: 'Japan', dayOffset: 5, hour: 19, minute: 30, label: 'Group Stage' },
  { home: 'USA', away: 'England', dayOffset: 8, hour: 16, minute: 0, label: 'Group Stage' },
  { home: 'Spain', away: 'France', dayOffset: 10, hour: 19, minute: 30, label: 'Group Stage' },
  { home: 'India', away: 'Germany', dayOffset: 12, hour: 19, minute: 30, label: 'Group Stage' },
  { home: 'Nigeria', away: 'Canada', dayOffset: 15, hour: 16, minute: 0, label: 'Group Stage' },
  { home: 'Netherlands', away: 'Sweden', dayOffset: 17, hour: 19, minute: 30, label: 'Quarter-final' },
  { home: 'India', away: 'Brazil', dayOffset: 19, hour: 19, minute: 30, label: 'Semi-final' },
  { home: 'Winner SF1', away: 'Winner SF2', dayOffset: 22, hour: 19, minute: 30, label: 'Final' },
];

// Tickets seeded per match (index-aligned with MATCHES).
const TICKET_TARGETS = [5200, 3400, 4100, 3600, 5600, 2800, 3000, 5400, 6200];

const BLOCK_NAMES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'F1', 'F2', 'E1', 'E2'];
const PRICES = { A1: 1800, A2: 1800, B1: 1200, B2: 1200, C1: 2200, C2: 2200, D1: 2500, D2: 2500, E1: 3500, E2: 3500, F1: 4500, F2: 4500 };
const BLOCK_CAPACITY = { A1: 620, A2: 620, B1: 500, B2: 500, C1: 700, C2: 700, D1: 720, D2: 720, E1: 600, E2: 600, F1: 450, F2: 450 };

// Target load per gate id (gates are inserted in GATES order, ids 1..8).
const GATE_TARGET_LOAD = { 1: 0.72, 2: 0.56, 3: 0.88, 4: 0.62, 5: 0.76, 6: 0.92, 7: 0.5, 8: 0.66 };
const PARKING_TARGET_LOAD = [0.72, 0.55, 0.88, 0.6, 0.66];
const SHUTTLE_TARGET_LOAD = { '3h': 0.55, '2h': 0.9, '1h': 0.7 };

const LOCAL_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Ananya', 'Diya', 'Ishaan', 'Kavya', 'Rohan', 'Sneha', 'Arjun', 'Priya', 'Rahul', 'Meera', 'Karan', 'Nisha', 'Sameer', 'Pooja', 'Vikram', 'Tanvi', 'Rajat', 'Shreya', 'Nikhil', 'Aisha', 'Harsh', 'Ira', 'Dev', 'Riya', 'Om', 'Jhanvi', 'Farhan', 'Sana', 'Amit', 'Neha', 'Kunal', 'Pallavi', 'Siddharth', 'Maya', 'Gaurav', 'Ishita', 'Varun'];
const LOCAL_HOMES = ['Mumbai', 'Navi Mumbai', 'Thane', 'Kalyan', 'Panvel', 'Pune', 'Vashi', 'Belapur'];
const OUTSTATION_HOMES = ['Bengaluru', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Goa', 'Dubai', 'London', 'New York', 'Sydney', 'Singapore'];

function blockPos(i) {
  const theta = (i / BLOCK_NAMES.length) * 2 * Math.PI - Math.PI / 2;
  return {
    lat: CENTER.lat + 0.00155 * Math.cos(theta),
    lng: CENTER.lng + 0.00255 * Math.sin(theta),
  };
}

function pickWeighted(items, weights, rnd = Math.random) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rnd() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function seed() {
  const started = Date.now();
  initSchema();

  // ── Wipe ────────────────────────────────────────────────────────────────
  db.exec(`
    DELETE FROM referral_events; DELETE FROM shuttle_assignments;
    DELETE FROM hotel_bookings; DELETE FROM tickets;
    DELETE FROM path_segments; DELETE FROM tourist_spots;
    DELETE FROM hotels; DELETE FROM parking_zones; DELETE FROM gates;
    DELETE FROM shuttles; DELETE FROM seat_blocks;
    DELETE FROM matches; DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);

  // ── Static reference data ───────────────────────────────────────────────
  const insGate = db.prepare('INSERT INTO gates (name, lat, lng, capacity, side) VALUES (?, ?, ?, ?, ?)');
  for (const g of GATES) insGate.run(g.name, g.lat, g.lng, 10000, g.side);
  const gateIds = db.prepare('SELECT id, name FROM gates ORDER BY id').all();

  const insParking = db.prepare(
    'INSERT INTO parking_zones (name, lat, lng, capacity, nearest_gate_id) VALUES (?, ?, ?, ?, ?)',
  );
  for (const p of PARKING) {
    const gate = gateIds.find((g) => g.name === p.nearest_gate);
    insParking.run(p.name, p.lat, p.lng, 1000, gate.id);
  }

  const insHotel = db.prepare(
    'INSERT INTO hotels (name, zone, tier, lat, lng, partner_commission_pct, nightly_rate) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  for (const h of HOTELS) insHotel.run(h.name, h.zone, h.tier, h.lat, h.lng, h.commission, h.rate);
  const hotels = db.prepare('SELECT * FROM hotels ORDER BY id').all();

  const insSpot = db.prepare(
    'INSERT INTO tourist_spots (name, description, distance_from_mumbai_km, best_time, image_emoji) VALUES (?, ?, ?, ?, ?)',
  );
  for (const s of TOURIST_SPOTS) insSpot.run(s.name, s.desc, s.dist, s.best, s.emoji);

  // ── Path segments (crowd-flow reference geometry) ───────────────────────
  // Physical route each visitor type walks: local = parking/rail -> North/West
  // gate; outstation = shuttle drop -> East/South gate. Kept as real lat/lng
  // polylines so the flow simulation can prove the two crowds stay apart.
  const insSegment = db.prepare(
    `INSERT INTO path_segments (name, kind, visitor_side, from_lat, from_lng, to_lat, to_lng, gate_id, origin_ref, capacity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const allGates = db.prepare('SELECT * FROM gates ORDER BY id').all();
  for (const p of PARKING) {
    const gate = allGates.find((g) => g.name === p.nearest_gate);
    insSegment.run(
      `${p.name} → ${gate.name}`,
      'local_parking',
      'local',
      p.lat, p.lng, gate.lat, gate.lng, gate.id,
      `parking:${p.name}`,
      1000,
    );
  }
  const localGates = allGates.filter((g) => g.side === 'local');
  for (const st of TRANSIT_STATIONS) {
    const gate = nearest(localGates, st).item;
    insSegment.run(
      `${st.name} → ${gate.name}`,
      'local_transit',
      'local',
      st.lat, st.lng, gate.lat, gate.lng, gate.id,
      `transit:${st.name}`,
      2000,
    );
  }
  const outGates = allGates.filter((g) => g.side === 'outstation');
  for (const z of SHUTTLE_ZONES) {
    const gate = nearest(outGates, z).item;
    insSegment.run(
      `Shuttle ${z.zone} → ${gate.name}`,
      'outstation_shuttle',
      'outstation',
      z.lat, z.lng, gate.lat, gate.lng, gate.id,
      `shuttle:${z.zone}`,
      3000,
    );
  }

  // ── Matches + shuttles + seat blocks ────────────────────────────────────
  const insMatch = db.prepare(
    'INSERT INTO matches (home_team, away_team, kickoff_time, venue, status) VALUES (?, ?, ?, ?, ?)',
  );
  const matchIds = [];
  const now = new Date();
  for (const m of MATCHES) {
    const ko = new Date(now);
    ko.setDate(now.getDate() + m.dayOffset);
    ko.setHours(m.hour, m.minute, 0, 0);
    const id = insMatch.run(m.home, m.away, ko.toISOString(), 'DY Patil Stadium, Nerul', 'scheduled').lastInsertRowid;
    matchIds.push({ id, kickoff_time: ko.toISOString(), ...m });
  }

  const insShuttle = db.prepare(
    'INSERT INTO shuttles (zone, capacity, departure_time, match_id) VALUES (?, ?, ?, ?)',
  );
  for (const m of matchIds) {
    const ko = new Date(m.kickoff_time);
    for (const zone of SHUTTLE_ZONES) {
      for (const [offHours, tag] of [[3, '3h'], [2, '2h'], [1, '1h']]) {
        const dep = new Date(ko);
        dep.setHours(dep.getHours() - offHours);
        const hh = String(dep.getHours()).padStart(2, '0');
        const mm = String(dep.getMinutes()).padStart(2, '0');
        insShuttle.run(zone.zone, 60, `${hh}:${mm} · T-${tag}`, m.id);
      }
    }
  }

  const insBlock = db.prepare(
    'INSERT INTO seat_blocks (match_id, block_name, capacity, price, lat, lng) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const m of matchIds) {
    for (let i = 0; i < BLOCK_NAMES.length; i++) {
      const name = BLOCK_NAMES[i];
      const pos = blockPos(i);
      insBlock.run(m.id, name, BLOCK_CAPACITY[name], PRICES[name], pos.lat, pos.lng);
    }
  }

  // ── Sample tickets ──────────────────────────────────────────────────────
  const gates = db.prepare('SELECT * FROM gates ORDER BY id').all();
  const parkingZones = db.prepare('SELECT * FROM parking_zones ORDER BY id').all();
  const allSeats = allSeatLabels();
  const gateCounts = new Map(gates.map((g) => [g.id, 0]));
  const parkingCounts = new Map(parkingZones.map((p) => [p.id, 0]));
  const shuttleLoads = new Map();
  const shuttleIds = db.prepare('SELECT id FROM shuttles').all();
  for (const s of shuttleIds) shuttleLoads.set(s.id, 0);

  const insUser = db.prepare('INSERT INTO users (name, phone, email, home_location) VALUES (?, ?, ?, ?)');
  const insTicket = db.prepare(
    `INSERT INTO tickets (unique_ticket_id, match_id, seat_block_id, seat_number, user_id,
       visitor_type, travel_mode, entry_gate_id, exit_gate_id, parking_zone_id, transit_hint)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insHotelBooking = db.prepare(
    'INSERT INTO hotel_bookings (ticket_id, hotel_id, checkin, checkout, room_type) VALUES (?, ?, ?, ?, ?)',
  );
  const insShuttleAssign = db.prepare(
    'INSERT INTO shuttle_assignments (ticket_id, shuttle_id) VALUES (?, ?)',
  );
  const insReferral = db.prepare(
    'INSERT INTO referral_events (ticket_id, type, amount) VALUES (?, ?, ?)',
  );

  const run = db.transaction(() => {
    const usedSeats = new Map(); // blockId -> Set
    for (let mi = 0; mi < matchIds.length; mi++) {
      const m = matchIds[mi];
      const target = TICKET_TARGETS[mi];
      const blocks = db
        .prepare('SELECT * FROM seat_blocks WHERE match_id = ? ORDER BY id')
        .all(m.id);
      const shuttles = db.prepare('SELECT * FROM shuttles WHERE match_id = ?').all(m.id);
      const isIndiaMatch = m.home === 'India';
      const localRatio = isIndiaMatch ? 0.78 : 0.6;

      for (let n = 0; n < target; n++) {
        const block = pickWeighted(blocks, blocks.map((b) => b.capacity));
        let seatPool = usedSeats.get(block.id);
        if (!seatPool) {
          seatPool = new Set(allSeats);
          usedSeats.set(block.id, seatPool);
        }
        if (seatPool.size === 0) continue;
        const seat = [...seatPool][Math.floor(Math.random() * seatPool.size)];
        seatPool.delete(seat);

        const name = LOCAL_NAMES[Math.floor(Math.random() * LOCAL_NAMES.length)];
        const phone = '98' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
        const email = `${name.toLowerCase()}.${Math.floor(Math.random() * 9999)}@example.com`;
        const userId = insUser.run(
          name,
          phone,
          email,
          Math.random() < localRatio
            ? LOCAL_HOMES[Math.floor(Math.random() * LOCAL_HOMES.length)]
            : OUTSTATION_HOMES[Math.floor(Math.random() * OUTSTATION_HOMES.length)],
        ).lastInsertRowid;

        const isLocal = Math.random() < localRatio;
        const uid = ticketId(m.id, block.block_name);
        let entryGateId = null;
        let exitGateId = null;
        let parkingZoneId = null;
        let transitHint = null;

        if (isLocal) {
          const travelMode = Math.random() < 0.62 ? 'vehicle' : 'transit';
          const a = assignRoute({ gates, parkingZones, parkingLoads: parkingCounts, block, travelMode, visitorType: 'local' });
          entryGateId = a.entryGate.id;
          exitGateId = a.exitGate.id;
          parkingZoneId = a.parkingZone?.id ?? null;
          transitHint = a.transitHint;
          gateCounts.set(a.entryGate.id, gateCounts.get(a.entryGate.id) + 1);
          if (parkingZoneId) parkingCounts.set(parkingZoneId, parkingCounts.get(parkingZoneId) + 1);
          insTicket.run(
            uid, m.id, block.id, seat, userId,
            'local', travelMode, entryGateId, exitGateId, parkingZoneId, transitHint,
          );
        } else {
          const tierWeights = { Luxury: 0.2, Premium: 0.45, Budget: 0.35 };
          const hotel = pickWeighted(hotels, hotels.map((h) => tierWeights[h.tier]));
          const a = assignOutstation({ gates, block, shuttles, hotel, shuttleLoads });
          entryGateId = a.entryGate.id;
          exitGateId = a.exitGate.id;
          gateCounts.set(a.entryGate.id, gateCounts.get(a.entryGate.id) + 1);
          shuttleLoads.set(a.shuttle.id, shuttleLoads.get(a.shuttle.id) + 1);

          const ticketRow = insTicket.run(
            uid, m.id, block.id, seat, userId,
            'outstation', null, entryGateId, exitGateId, null, null,
          );
          const ko = new Date(m.kickoff_time);
          const checkin = new Date(ko);
          checkin.setDate(checkin.getDate() - 1);
          const checkout = new Date(ko);
          checkout.setDate(checkout.getDate() + 1);
          insHotelBooking.run(ticketRow.lastInsertRowid, hotel.id, checkin.toISOString(), checkout.toISOString(), 'Double');
          insShuttleAssign.run(ticketRow.lastInsertRowid, a.shuttle.id);

          if (Math.random() < 0.22) {
            insReferral.run(ticketRow.lastInsertRowid, 'hotel', hotelReferralAmount(hotel));
          }
        }

        if (Math.random() < 0.28) {
          const row = db.prepare('SELECT id FROM tickets WHERE unique_ticket_id = ?').get(uid);
          insReferral.run(row.id, 'airtel_tv', AIRTEL_AMOUNT);
        }
      }
    }
  });
  run();

  // ── Scale capacities so the dashboard shows a realistic live picture ────
  const updGate = db.prepare('UPDATE gates SET capacity = ? WHERE id = ?');
  for (const g of gates) {
    const count = gateCounts.get(g.id);
    const target = GATE_TARGET_LOAD[g.id] ?? 0.6;
    const cap = Math.max(100, Math.round((count / target) / 100) * 100);
    updGate.run(cap, g.id);
  }

  const updParking = db.prepare('UPDATE parking_zones SET capacity = ? WHERE id = ?');
  parkingZones.forEach((p, i) => {
    const count = parkingCounts.get(p.id);
    const target = PARKING_TARGET_LOAD[i] ?? 0.6;
    const cap = Math.max(50, Math.round((count / target) / 50) * 50);
    updParking.run(cap, p.id);
  });

  const updShuttle = db.prepare('UPDATE shuttles SET capacity = ? WHERE id = ?');
  const shuttleRows = db.prepare('SELECT * FROM shuttles').all();
  for (const s of shuttleRows) {
    const tag = s.departure_time.split('T-')[1];
    const target = SHUTTLE_TARGET_LOAD[tag] ?? 0.7;
    const booked = shuttleLoads.get(s.id);
    const cap = Math.max(20, Math.round(booked / target / 5) * 5);
    updShuttle.run(cap, s.id);
  }

  // ── Seed Mega-Events, Accommodation Zones, Transit Corridors, Hospitality ────
  db.exec(`
    INSERT OR IGNORE INTO mega_events (id, title, event_type, venue, venue_city, date_time, expected_attendance, status) VALUES
    (1, 'FIFA Women''s World Cup 2026: India vs Australia (Opening Match)', 'sports_match', 'DY Patil Stadium, Nerul', 'Navi Mumbai', '2026-10-12T19:30:00.000Z', 55000, 'scheduled'),
    (2, 'Coldplay: Music of the Spheres Mega Stadium Tour', 'mega_concert', 'DY Patil Stadium, Nerul', 'Navi Mumbai', '2026-10-18T18:00:00.000Z', 62000, 'scheduled'),
    (3, 'Global AI & Sustainable Urbanism Summit 2026', 'global_summit', 'CIDCO Exhibition & Convention Center', 'Vashi, Navi Mumbai', '2026-10-24T09:00:00.000Z', 38000, 'scheduled'),
    (4, 'Grand Cultural Festival & Global Heritage Expo', 'cultural_festival', 'Central Park Mega Grounds', 'Kharghar, Navi Mumbai', '2026-11-02T17:30:00.000Z', 75000, 'scheduled');

    INSERT OR IGNORE INTO accommodation_zones (id, name, code, lat, lng, total_rooms, booked_rooms, avg_rate, surge_multiplier, is_overflow_recommended, transit_link_desc, shuttle_service_available) VALUES
    (1, 'Core Nerul Stadium Zone', 'CORE_NERUL', 19.0439, 73.0189, 3200, 3040, 16500, 1.85, 0, 'Walking distance (< 1.2 km) to North & East gates', 1),
    (2, 'Vashi Luxury & Commercial Hub', 'VASHI_PREMIUM', 19.0757, 72.9984, 4800, 4220, 13500, 1.45, 0, 'Harbour Line direct rail (8 mins) + Dedicated Shuttle corridor', 1),
    (3, 'Belapur Business Corridor', 'BELAPUR_BIZ', 19.0317, 73.0364, 5500, 3410, 7200, 1.05, 1, 'Navi Mumbai Metro Line 1 & Express Shuttle Corridor (12 mins, Free Pass)', 1),
    (4, 'Kharghar Green Valley Hub', 'KHARGHAR_GREEN', 19.0470, 73.0690, 6200, 2790, 4800, 0.95, 1, 'Metro Line 1 direct feeder + Park & Ride Central Park Hub (₹3,000+ nightly savings)', 1),
    (5, 'Panvel Multimodal Transit Zone', 'PANVEL_HUB', 18.9894, 73.1175, 4000, 2100, 3900, 0.90, 1, 'Direct express rail link & Expressway fast-track transitway', 1);

    INSERT OR IGNORE INTO transit_corridors (id, name, mode, capacity_per_hr, current_load_pct, status, from_location, to_location) VALUES
    (1, 'Navi Mumbai Metro Line 1 (Belapur-Nerul Feeder)', 'metro', 18000, 68, 'nominal', 'Belapur Terminal', 'DY Patil South Concourse'),
    (2, 'Sion-Panvel Expressway Stadium Corridor', 'highway', 22000, 88, 'heavy', 'Vashi Bridge Toll', 'Nerul Interchange'),
    (3, 'Harbour Line Suburban Rail (CSMT-Nerul-Panvel)', 'suburban_rail', 35000, 76, 'nominal', 'Mankhurd Hub', 'Nerul Station Platform 2/3'),
    (4, 'Palm Beach Road Scenic Transit Corridor', 'highway', 14000, 54, 'nominal', 'Vashi Sector 17', 'Nerul West Parking P4'),
    (5, 'Dedicated Electric Feeder Shuttle Loop', 'park_ride_feeder', 8500, 72, 'nominal', 'Belapur CBD / Kharghar Valley', 'East Gates C & D Shuttle Drop');

    INSERT OR IGNORE INTO hospitality_merchants (id, name, zone, category, capacity, discount_pct, voucher_code, egress_delay_mins, description) VALUES
    (1, 'Sector 15 Fan District & Craft Gastropub Row', 'Nerul Sector 15', 'dining', 2400, 25, 'FANZONE25', 60, 'Live match screen replays, rooftop craft beers, artisanal snacks. 8-min walk from West Gate G.'),
    (2, 'DY Patil Sports Village Live Acoustic Lounge', 'Nerul Campus', 'entertainment', 1800, 20, 'AFTERMATCH20', 75, 'Post-event acoustic chillout sets, gourmet food trucks, and calm egress waiting area.'),
    (3, 'Vashi Inorbit Gastro & Night Market Fiesta', 'Vashi Hub', 'dining', 3500, 30, 'VASHIDINE30', 90, 'Global street food festival, DJ lounge, with free express night shuttles to Vashi hotels.'),
    (4, 'Belapur CBD Waterfront Promenade Cafes', 'Belapur Waterfront', 'dining', 2800, 25, 'BELAPUR25', 90, 'Breezy waterside dining with dedicated return shuttle stops to Belapur business hotels.');

    INSERT OR REPLACE INTO simulation_state (key, value) VALUES
    ('active_scenario', 'baseline'),
    ('surge_pct', '0'),
    ('rain_delay_hours', '0'),
    ('gate_disruption_gate_id', 'none'),
    ('transit_outage_corridor_id', 'none'),
    ('last_updated', datetime('now'));
  `);

  const summary = {
    matches: matchIds.length,
    megaEvents: db.prepare('SELECT COUNT(*) AS c FROM mega_events').get().c,
    accommodationZones: db.prepare('SELECT COUNT(*) AS c FROM accommodation_zones').get().c,
    transitCorridors: db.prepare('SELECT COUNT(*) AS c FROM transit_corridors').get().c,
    hospitalityMerchants: db.prepare('SELECT COUNT(*) AS c FROM hospitality_merchants').get().c,
    gates: gates.length,
    parking: parkingZones.length,
    hotels: hotels.length,
    tickets: db.prepare('SELECT COUNT(*) AS c FROM tickets').get().c,
    hotelBookings: db.prepare('SELECT COUNT(*) AS c FROM hotel_bookings').get().c,
    referralEvents: db.prepare('SELECT COUNT(*) AS c FROM referral_events').get().c,
    tookMs: Date.now() - started,
  };
  console.log('🌱 Seed complete:', summary);
  return summary;
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  seed();
}