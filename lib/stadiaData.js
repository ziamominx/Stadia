// lib/stadiaData.js - Standalone In-Memory Tournament Engine for Vercel & Production

export const MATCHES_DATA = [
  { id: 1, home_team: 'India', away_team: 'Australia', kickoff_time: '2026-06-12T19:30:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'live', tickets_sold: 5200, capacity: 55000, label: 'Opening Match' },
  { id: 2, home_team: 'Brazil', away_team: 'Japan', kickoff_time: '2026-06-14T19:30:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'scheduled', tickets_sold: 3400, capacity: 55000, label: 'Group Stage' },
  { id: 3, home_team: 'USA', away_team: 'England', kickoff_time: '2026-06-17T16:00:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'scheduled', tickets_sold: 4100, capacity: 55000, label: 'Group Stage' },
  { id: 4, home_team: 'Spain', away_team: 'France', kickoff_time: '2026-06-19T19:30:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'scheduled', tickets_sold: 3600, capacity: 55000, label: 'Group Stage' },
  { id: 5, home_team: 'India', away_team: 'Germany', kickoff_time: '2026-06-21T19:30:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'scheduled', tickets_sold: 5600, capacity: 55000, label: 'Group Stage' },
  { id: 6, home_team: 'Nigeria', away_team: 'Canada', kickoff_time: '2026-06-24T16:00:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'scheduled', tickets_sold: 2800, capacity: 55000, label: 'Group Stage' },
  { id: 7, home_team: 'Netherlands', away_team: 'Sweden', kickoff_time: '2026-06-26T19:30:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'scheduled', tickets_sold: 3000, capacity: 55000, label: 'Quarter-final' },
  { id: 8, home_team: 'India', away_team: 'Brazil', kickoff_time: '2026-06-28T19:30:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'scheduled', tickets_sold: 5400, capacity: 55000, label: 'Semi-final' },
  { id: 9, home_team: 'Winner SF1', away_team: 'Winner SF2', kickoff_time: '2026-07-01T19:30:00.000Z', venue: 'DY Patil Stadium, Nerul', status: 'scheduled', tickets_sold: 6200, capacity: 55000, label: 'Grand Final' },
];

export const BLOCKS_DATA = [
  { id: 1, block_name: 'A1', capacity: 620, price: 1800, sold: 480 },
  { id: 2, block_name: 'A2', capacity: 620, price: 1800, sold: 410 },
  { id: 3, block_name: 'B1', capacity: 500, price: 1200, sold: 390 },
  { id: 4, block_name: 'B2', capacity: 500, price: 1200, sold: 350 },
  { id: 5, block_name: 'C1', capacity: 700, price: 2200, sold: 580 },
  { id: 6, block_name: 'C2', capacity: 700, price: 2200, sold: 520 },
  { id: 7, block_name: 'D1', capacity: 720, price: 2500, sold: 610 },
  { id: 8, block_name: 'D2', capacity: 720, price: 2500, sold: 590 },
  { id: 9, block_name: 'E1', capacity: 600, price: 3500, sold: 490 },
  { id: 10, block_name: 'E2', capacity: 600, price: 3500, sold: 470 },
  { id: 11, block_name: 'F1', capacity: 450, price: 4500, sold: 420 },
  { id: 12, block_name: 'F2', capacity: 450, price: 4500, sold: 390 },
];

export const GATES_DATA = [
  { id: 1, name: 'Gate A · North', capacity: 7500, assigned: 5800, side: 'local', load: 0.77, status: 'MODERATE' },
  { id: 2, name: 'Gate B · North-East', capacity: 7500, assigned: 6200, side: 'local', load: 0.82, status: 'HIGH' },
  { id: 3, name: 'Gate C · East', capacity: 6500, assigned: 4100, side: 'outstation', load: 0.63, status: 'OPTIMAL' },
  { id: 4, name: 'Gate D · South-East', capacity: 6500, assigned: 3900, side: 'outstation', load: 0.60, status: 'OPTIMAL' },
  { id: 5, name: 'Gate E · South', capacity: 6000, assigned: 4200, side: 'outstation', load: 0.70, status: 'MODERATE' },
  { id: 6, name: 'Gate F · South-West', capacity: 6000, assigned: 3800, side: 'outstation', load: 0.63, status: 'OPTIMAL' },
  { id: 7, name: 'Gate G · West', capacity: 7500, assigned: 5100, side: 'local', load: 0.68, status: 'MODERATE' },
  { id: 8, name: 'Gate H · North-West', capacity: 7500, assigned: 5114, side: 'local', load: 0.68, status: 'MODERATE' },
];

export const PARKING_DATA = [
  { id: 1, name: 'P1 · Nerul West Grounds', capacity: 1800, assigned: 1420, load: 0.78, status: 'MODERATE' },
  { id: 2, name: 'P2 · Sector 14 Multi-Level', capacity: 2200, assigned: 1950, load: 0.88, status: 'HIGH' },
  { id: 3, name: 'P3 · DY Patil College Grounds', capacity: 1500, assigned: 980, load: 0.65, status: 'OPTIMAL' },
  { id: 4, name: 'P4 · Palm Beach Road Lot', capacity: 2500, assigned: 1200, load: 0.48, status: 'LOW' },
  { id: 5, name: 'P5 · Nerul Station Overflow', capacity: 1200, assigned: 890, load: 0.74, status: 'MODERATE' },
];

export const SHUTTLES_DATA = [
  { id: 1, zone: 'Vashi Hub', capacity: 3500, booked: 2950, load: 0.84, status: 'HIGH', match_id: 1 },
  { id: 2, zone: 'Belapur Metro Corridor', capacity: 2800, booked: 2100, load: 0.75, status: 'MODERATE', match_id: 1 },
  { id: 3, zone: 'Seawoods Grand Central', capacity: 2400, booked: 1650, load: 0.68, status: 'OPTIMAL', match_id: 1 },
  { id: 4, zone: 'Airport Express Convoy', capacity: 1800, booked: 1490, load: 0.82, status: 'HIGH', match_id: 1 },
];

export const HOTELS_DATA = [
  { id: 1, name: 'The Grand Vashi', zone: 'Vashi', tier: 'Luxury', commission: 12, nightly_rate: 18000, rating: 4.8, distance: '6.2 km' },
  { id: 2, name: 'Hotel Orchid Vashi', zone: 'Vashi', tier: 'Premium', commission: 10, nightly_rate: 12000, rating: 4.6, distance: '5.8 km' },
  { id: 3, name: 'OYO Flagship Vashi', zone: 'Vashi', tier: 'Budget', commission: 8, nightly_rate: 6000, rating: 4.2, distance: '6.0 km' },
  { id: 4, name: 'Radisson Blu Belapur', zone: 'Belapur', tier: 'Luxury', commission: 12, nightly_rate: 20000, rating: 4.9, distance: '4.1 km' },
  { id: 5, name: 'Fortune Select Seawoods', zone: 'Seawoods', tier: 'Premium', commission: 10, nightly_rate: 13000, rating: 4.7, distance: '2.9 km' },
  { id: 6, name: 'Novotel Mumbai (Nerul)', zone: 'Nerul', tier: 'Luxury', commission: 11, nightly_rate: 16500, rating: 4.8, distance: '1.4 km' },
  { id: 7, name: 'Lemon Tree Nerul', zone: 'Nerul', tier: 'Premium', commission: 10, nightly_rate: 11500, rating: 4.5, distance: '1.8 km' },
  { id: 8, name: 'Taj Santacruz (Airport)', zone: 'Airport-belt', tier: 'Luxury', commission: 13, nightly_rate: 22000, rating: 4.9, distance: '24 km' },
];

export const TOURISM_DATA = [
  { id: 1, name: 'Lonavala Hill Station', emoji: '⛰️', desc: 'Tiger Point views and misty lake viewpoints. About 90 mins from venue.', dist: 84, best: 'Monsoon & winter' },
  { id: 2, name: 'Matheran Automobile-Free Ridge', emoji: '🚂', desc: 'Asia’s only vehicle-free zone with heritage toy train.', dist: 80, best: 'Winter' },
  { id: 3, name: 'Mumbai Darshan & Marine Drive', emoji: '🌉', desc: 'Gateway of India, Marine Drive, and CSMT heritage district.', dist: 24, best: 'Evenings' },
  { id: 4, name: 'Alibaug Scenic Coastline', emoji: '🏖️', desc: 'Beaches, historic sea forts, and ferry connections.', dist: 95, best: 'Nov – Feb' },
  { id: 5, name: 'Kharghar Valley Hills', emoji: '⛳', desc: 'Golf course, Central Park, and Pandavkada waterfalls.', dist: 8, best: 'All year' },
];

export const OVERVIEW_DATA = {
  gates: GATES_DATA,
  parking: PARKING_DATA,
  shuttles: SHUTTLES_DATA,
  revenue: {
    hotel: { count: 820, total: 3240000 },
    airtel_tv: { count: 1450, total: 725000 },
    grand_total: 3965000,
  },
  tickets: 38214,
  matches: 9,
};
