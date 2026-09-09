// lib/eventsData.js - Master Event Registry for Stadia Orchestration Mesh

export const INITIAL_EVENTS = [
  {
    id: 'fifa-wwc-2026-final',
    title: "FIFA Women's World Cup 2026 — Quarterfinal",
    subtitle: 'India vs Australia · Knockout Stage',
    category: 'fifa',
    categoryLabel: 'FIFA Football',
    sport: 'Football',
    venue: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    area: 'Nerul, Sector 7',
    lat: 19.033,
    lng: 73.0297,
    date: '2026-06-12',
    time: '18:00 IST',
    status: 'Live',
    capacity: 55000,
    sold: 48250,
    basePrice: 1500,
    vipPrice: 8500,
    currency: '₹',
    grossRevenue: 72375000,
    ingressRate: 142, // fans/min
    totalTurnstiles: 64,
    organizer: 'FIFA TMS & AIFF Ops',
    badge: 'FIFA TOURNAMENT TIER 1',
    description: 'High-density international fixture featuring dynamic concourse deconfliction, synchronized Harbour Line train schedules, and zoned hotel shuttle buses.',
    gates: [
      { id: 'gate-a', name: 'Gate A (North)', label: 'VIP, Hospitality & Media', capacity: 6000, throughput: 28, strainPct: 92, waitMins: 6, status: 'Strained' },
      { id: 'gate-b', name: 'Gate B (East)', label: 'Transit, Nerul Suburban Rail', capacity: 22000, throughput: 65, strainPct: 78, waitMins: 4, status: 'Optimal' },
      { id: 'gate-c', name: 'Gate C (South)', label: 'Express Shuttles & Outstation', capacity: 15000, throughput: 32, strainPct: 64, waitMins: 3, status: 'Optimal' },
      { id: 'gate-d', name: 'Gate D (West)', label: 'General Admission & Carpools', capacity: 12000, throughput: 17, strainPct: 89, waitMins: 7, status: 'Heavy' },
    ],
    transitSplit: {
      railMetro: 42,
      shuttles: 28,
      parkRide: 20,
      rideshare: 10,
    },
    hotelAbsorption: {
      ratePct: 88.4,
      roomsBooked: 1420,
      totalRooms: 1600,
      revparUpliftPct: 18.2,
      primaryHotels: ['The Park Navi Mumbai', 'Courtyard by Marriott', 'Fortune Select Excalibur'],
    },
    safetyMetrics: {
      collisionRiskScore: 0.18,
      riskLevel: 'LOW',
      mitigatedDeconflictions: 14,
      activeMarshals: 180,
    },
    liveLogs: [
      { time: '17:42:10', type: 'info', msg: 'Gate B turnstiles operating at nominal 65 pax/min cadence.' },
      { time: '17:38:05', type: 'alert', msg: 'Harbour Line train arriving Nerul: Diverted 420 fans from Gate D to Gate B.' },
      { time: '17:25:30', type: 'success', msg: 'South Express Shuttle wave 4 docked at Gate C. 850 passengers cleared.' },
    ],
  },
  {
    id: 'f1-indian-gp-2026',
    title: 'Formula 1 Indian Grand Prix 2026 — Main Race',
    subtitle: 'Round 18 of FIA Formula One World Championship',
    category: 'f1',
    categoryLabel: 'Formula 1',
    sport: 'Motorsport',
    venue: 'Buddh International Circuit',
    city: 'Greater Noida',
    area: 'Yamuna Expressway, Sector 25',
    lat: 28.3487,
    lng: 77.5331,
    date: '2026-10-25',
    time: '15:00 IST',
    status: 'Upcoming',
    capacity: 120000,
    sold: 104800,
    basePrice: 3500,
    vipPrice: 45000,
    currency: '₹',
    grossRevenue: 366800000,
    ingressRate: 260, // spectators/min
    totalTurnstiles: 110,
    organizer: 'FIA & Jaypee Sports International',
    badge: 'FIA GRADE 1 CIRCUIT',
    description: 'Premier motorsport championship spanning 5.125 km circuit. Massive inter-city traffic management linking Delhi-Noida-Agra corridors with high-capacity express bus corridors.',
    gates: [
      { id: 'gate-f1-main', name: 'Main Grandstand North', label: 'Main Straight & Start/Finish', capacity: 45000, throughput: 95, strainPct: 85, waitMins: 8, status: 'Heavy' },
      { id: 'gate-f1-paddock', name: 'Paddock Club & VIP Gate', label: 'Pit Lane, Teams & Hospitality', capacity: 15000, throughput: 42, strainPct: 94, waitMins: 5, status: 'Strained' },
      { id: 'gate-f1-hairpin', name: 'South Hairpin Gate', label: 'Turn 3 & Turn 4 Stands', capacity: 32000, throughput: 68, strainPct: 68, waitMins: 4, status: 'Optimal' },
      { id: 'gate-f1-east', name: 'East Concourse Gate', label: 'General Admission & Picnic Hill', capacity: 28000, throughput: 55, strainPct: 74, waitMins: 5, status: 'Optimal' },
    ],
    transitSplit: {
      railMetro: 15, // Noida Metro + feeder shuttles
      shuttles: 35, // Yamuna Expressway charter buses
      parkRide: 38, // Dedicated express circuit parking zones
      rideshare: 12, // Pre-authorized zone drop-offs
    },
    hotelAbsorption: {
      ratePct: 96.2,
      roomsBooked: 3850,
      totalRooms: 4000,
      revparUpliftPct: 34.5,
      primaryHotels: ['Radisson Blu Greater Noida', 'Crowne Plaza Mayur Vihar', 'The Leela Ambience'],
    },
    safetyMetrics: {
      collisionRiskScore: 0.22,
      riskLevel: 'LOW',
      mitigatedDeconflictions: 28,
      activeMarshals: 340,
    },
    liveLogs: [
      { time: '14:20:00', type: 'info', msg: 'Yamuna Expressway Corridor A flowing at 85 km/h with zero bottlenecking.' },
      { time: '14:12:15', type: 'info', msg: 'Paddock Club helicopter shuttle slot cleared. 60 VIP transfers completed.' },
      { time: '14:02:45', type: 'alert', msg: 'Parking Zone 3 at 90% capacity; dynamically rerouting inbound traffic to Zone 4.' },
    ],
  },
  {
    id: 'coldplay-stadium-tour-2026',
    title: 'Coldplay: Music of the Spheres Stadium Tour',
    subtitle: 'Eco-Powered Mega Concert Live in Mumbai',
    category: 'concert',
    categoryLabel: 'Concerts & Festivals',
    sport: 'Live Entertainment',
    venue: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    area: 'Nerul, Sector 7',
    lat: 19.033,
    lng: 73.0297,
    date: '2026-07-18',
    time: '19:30 IST',
    status: 'Registration Open',
    capacity: 55000,
    sold: 54900,
    basePrice: 2500,
    vipPrice: 12500,
    currency: '₹',
    grossRevenue: 137250000,
    ingressRate: 195,
    totalTurnstiles: 64,
    organizer: 'BookMyShow Live & Live Nation',
    badge: 'WORLD STADIUM TOUR',
    description: 'Kinetic flooring and eco-sustainable mega-stadium concert. Ultra-high simultaneous ingress spike requiring synchronized turnstile batching and pedestrian bridge balancing.',
    gates: [
      { id: 'gate-cp-a', name: 'Gate A (Standing Arena)', label: 'General Standing Pitch Floor', capacity: 20000, throughput: 88, strainPct: 96, waitMins: 9, status: 'Strained' },
      { id: 'gate-cp-b', name: 'Gate B (Tier 1 & 2)', label: 'East Stand Seating', capacity: 15000, throughput: 48, strainPct: 91, waitMins: 6, status: 'Strained' },
      { id: 'gate-cp-c', name: 'Gate C (West Stand)', label: 'West Stand & Hospitality Boxes', capacity: 12000, throughput: 36, strainPct: 88, waitMins: 5, status: 'Heavy' },
      { id: 'gate-cp-d', name: 'Gate D (North Concourse)', label: 'Express Wristband Exchange', capacity: 8000, throughput: 23, strainPct: 95, waitMins: 7, status: 'Strained' },
    ],
    transitSplit: {
      railMetro: 52, // Mega surge on suburban trains
      shuttles: 25, // Green electric bus fleet
      parkRide: 15,
      rideshare: 8,
    },
    hotelAbsorption: {
      ratePct: 94.7,
      roomsBooked: 2100,
      totalRooms: 2220,
      revparUpliftPct: 29.8,
      primaryHotels: ['Taj The Trees Vikhroli', 'Four Points by Sheraton Vashi', 'The Fern Residency'],
    },
    safetyMetrics: {
      collisionRiskScore: 0.29,
      riskLevel: 'MODERATE',
      mitigatedDeconflictions: 19,
      activeMarshals: 210,
    },
    liveLogs: [
      { time: '18:50:12', type: 'alert', msg: 'Standing floor wristband queues rebalanced via secondary North canopy.' },
      { time: '18:41:00', type: 'info', msg: 'Local train special frequency activated at Nerul: trains every 3 minutes.' },
    ],
  },
];

// Helper functions for Admin & Client sync
const STORAGE_KEY = 'stadia_mega_events_v1';

export function getStoredEvents() {
  if (typeof window === 'undefined') return INITIAL_EVENTS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EVENTS;
  } catch (err) {
    console.error('Error reading events from storage:', err);
    return INITIAL_EVENTS;
  }
}

export function saveStoredEvents(events) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    // Dispatch custom event for cross-component re-renders
    window.dispatchEvent(new CustomEvent('stadia_events_updated', { detail: events }));
  } catch (err) {
    console.error('Error saving events to storage:', err);
  }
}

export function createNewEvent(formData) {
  const current = getStoredEvents();
  const id = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
  
  const capacity = Number(formData.capacity) || 50000;
  const basePrice = Number(formData.basePrice) || 1200;
  const sold = Math.floor(capacity * 0.45); // initial baseline sold
  const grossRevenue = sold * basePrice;

  const newEvent = {
    id,
    title: formData.title,
    subtitle: formData.subtitle || `${formData.categoryLabel || 'Event'} Live Stadium Experience`,
    category: formData.category || 'fifa',
    categoryLabel: formData.categoryLabel || 'FIFA Football',
    sport: formData.sport || 'Sports',
    venue: formData.venue || 'DY Patil Stadium',
    city: formData.city || 'Navi Mumbai',
    area: formData.area || 'Concourse Hub',
    lat: Number(formData.lat) || 19.033,
    lng: Number(formData.lng) || 73.0297,
    date: formData.date || new Date().toISOString().split('T')[0],
    time: formData.time || '18:00 IST',
    status: formData.status || 'Upcoming',
    capacity,
    sold,
    basePrice,
    vipPrice: basePrice * 4,
    currency: '₹',
    grossRevenue,
    ingressRate: Math.round(capacity / 400),
    totalTurnstiles: Math.max(32, Math.round(capacity / 1000)),
    organizer: formData.organizer || 'Stadia Operations Mesh',
    badge: formData.badge || 'VERIFIED EVENT',
    description: formData.description || 'Newly registered mega-event managed by the Stadia Predictive Crowd & Hospitality Mesh.',
    gates: [
      { id: `${id}-gate-a`, name: 'Gate A (North)', label: 'VIP & Premium Access', capacity: Math.round(capacity * 0.15), throughput: 30, strainPct: 75, waitMins: 4, status: 'Optimal' },
      { id: `${id}-gate-b`, name: 'Gate B (East)', label: 'Transit & Metro Access', capacity: Math.round(capacity * 0.40), throughput: 65, strainPct: 82, waitMins: 5, status: 'Heavy' },
      { id: `${id}-gate-c`, name: 'Gate C (South)', label: 'Shuttle Buses & Outstation', capacity: Math.round(capacity * 0.25), throughput: 40, strainPct: 60, waitMins: 3, status: 'Optimal' },
      { id: `${id}-gate-d`, name: 'Gate D (West)', label: 'General Admission', capacity: Math.round(capacity * 0.20), throughput: 35, strainPct: 70, waitMins: 4, status: 'Optimal' },
    ],
    transitSplit: {
      railMetro: 45,
      shuttles: 30,
      parkRide: 15,
      rideshare: 10,
    },
    hotelAbsorption: {
      ratePct: 82.5,
      roomsBooked: Math.round(capacity * 0.03),
      totalRooms: Math.round(capacity * 0.035),
      revparUpliftPct: 22.4,
      primaryHotels: ['City Grand Hotel', 'Courtyard Express', 'Metro Executive Suites'],
    },
    safetyMetrics: {
      collisionRiskScore: 0.19,
      riskLevel: 'LOW',
      mitigatedDeconflictions: 8,
      activeMarshals: Math.round(capacity / 300),
    },
    liveLogs: [
      { time: new Date().toLocaleTimeString(), type: 'info', msg: `Event ${formData.title} registered and provisioned in Stadia Mesh.` },
      { time: new Date().toLocaleTimeString(), type: 'success', msg: `4 Concourse gates calibrated with total capacity of ${capacity.toLocaleString()} seats.` },
    ],
  };

  const updated = [newEvent, ...current];
  saveStoredEvents(updated);
  return newEvent;
}

export function deleteStoredEvent(id) {
  const current = getStoredEvents();
  const updated = current.filter(e => e.id !== id);
  saveStoredEvents(updated);
  return updated;
}
