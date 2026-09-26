// lib/eventsData.js - Master Event Registry for Stadia Orchestration Mesh

export const MAHARASHTRA_VENUE_PRESETS = [
  {
    id: 'dy-patil-nerul',
    name: 'DY Patil Sports Stadium',
    city: 'Navi Mumbai',
    area: 'Nerul, Sector 7',
    lat: 19.033,
    lng: 73.0297,
    capacity: 55000,
    transitHubs: 'Nerul Suburban Rail, Belapur Metro Line 1, Palm Beach Road, Atal Setu Express',
    parkingLots: [
      { name: 'P1 Nerul Gymkhana Grounds', cap: 1800 },
      { name: 'P2 Sector 14 Multi-Level', cap: 2200 },
      { name: 'P3 DY Patil Medical Grounds', cap: 1500 },
      { name: 'P4 Palm Beach Road Mega-Lot', cap: 3500 },
    ],
    gates: [
      { id: 'gate-a', name: 'Gate A (North Express)', label: 'VIP, Hospitality & Media', capacity: 7500, throughput: 35, strainPct: 68, waitMins: 3, status: 'Optimal' },
      { id: 'gate-b', name: 'Gate B (East Concourse)', label: 'Nerul Suburban Rail Walkway', capacity: 20000, throughput: 65, strainPct: 84, waitMins: 6, status: 'Heavy' },
      { id: 'gate-c', name: 'Gate C (South Bus Bay)', label: 'NMMT & Outstation Shuttles', capacity: 15000, throughput: 42, strainPct: 62, waitMins: 3, status: 'Optimal' },
      { id: 'gate-d', name: 'Gate D (West Perimeter)', label: 'General Admission & Carpools', capacity: 12500, throughput: 28, strainPct: 74, waitMins: 4, status: 'Optimal' },
    ]
  },
  {
    id: 'wankhede-mumbai',
    name: 'Wankhede Stadium',
    city: 'Mumbai',
    area: 'Churchgate / Marine Drive',
    lat: 18.9389,
    lng: 72.8258,
    capacity: 33000,
    transitHubs: 'Churchgate Western Line, Marine Lines Station, CSMT, Coastal Road Link',
    parkingLots: [
      { name: 'P1 Nariman Point Central Garage', cap: 1200 },
      { name: 'P2 Fort Free Press House Lot', cap: 900 },
      { name: 'P3 Marine Lines Seaface Overflow', cap: 800 },
    ],
    gates: [
      { id: 'gate-w-a', name: 'Gate 1 · Vinoo Mankad Stand', label: 'VIP & Marine Drive Entrance', capacity: 6000, throughput: 25, strainPct: 70, waitMins: 4, status: 'Optimal' },
      { id: 'gate-w-b', name: 'Gate 2 · Sunil Gavaskar Stand', label: 'Churchgate Suburban Station Link', capacity: 14000, throughput: 60, strainPct: 88, waitMins: 7, status: 'Heavy' },
      { id: 'gate-w-c', name: 'Gate 3 · Sachin Tendulkar Stand', label: 'East Concourse Walkway', capacity: 8000, throughput: 32, strainPct: 65, waitMins: 3, status: 'Optimal' },
      { id: 'gate-w-d', name: 'Gate 4 · North Pavilion & Media', label: 'Media & Hospitality Boxes', capacity: 5000, throughput: 20, strainPct: 58, waitMins: 2, status: 'Optimal' },
    ]
  },
  {
    id: 'mca-gahunje-pune',
    name: 'Maharashtra Cricket Association (MCA) Stadium',
    city: 'Pune',
    area: 'Gahunje, Mumbai-Pune Expressway',
    lat: 18.6745,
    lng: 73.7064,
    capacity: 37000,
    transitHubs: 'Mumbai-Pune Expressway, Dehu Road Rail, Wakad/Hinjewadi Feeder Fleet',
    parkingLots: [
      { name: 'P1 South Expressway Grass Lot', cap: 2800 },
      { name: 'P2 Gahunje Village North Tier', cap: 2100 },
      { name: 'P3 Hinjewadi Transit Hub Staging', cap: 3200 },
    ],
    gates: [
      { id: 'gate-mca-a', name: 'Gate 1 · Main Expressway Pavilion', label: 'VIP & Corporate Suites', capacity: 6500, throughput: 26, strainPct: 62, waitMins: 3, status: 'Optimal' },
      { id: 'gate-mca-b', name: 'Gate 2 · West General Stand', label: 'Expressway Bus Drop Terminal', capacity: 15000, throughput: 55, strainPct: 85, waitMins: 6, status: 'Heavy' },
      { id: 'gate-mca-c', name: 'Gate 3 · East General Stand', label: 'Dehu Road Feeder Walkway', capacity: 10500, throughput: 38, strainPct: 64, waitMins: 3, status: 'Optimal' },
      { id: 'gate-mca-d', name: 'Gate 4 · North Hill Terrace', label: 'Car-pool & Two-Wheeler Ingress', capacity: 5000, throughput: 22, strainPct: 55, waitMins: 2, status: 'Optimal' },
    ]
  },
  {
    id: 'jio-world-bkc',
    name: 'Jio World Convention Centre & Garden',
    city: 'Mumbai',
    area: 'Bandra Kurla Complex (BKC)',
    lat: 19.0657,
    lng: 72.8687,
    capacity: 18000,
    transitHubs: 'Bandra / Kurla Suburban Stations, BKC Metro Line 3, BKC Connector Flyover',
    parkingLots: [
      { name: 'P1 Jio World Multi-Level Basement', cap: 2400 },
      { name: 'P2 MMRDA Grounds Overflow', cap: 3000 },
    ],
    gates: [
      { id: 'gate-jio-a', name: 'Pavilion Concourse North', label: 'VIP & International Delegates', capacity: 4000, throughput: 20, strainPct: 60, waitMins: 2, status: 'Optimal' },
      { id: 'gate-jio-b', name: 'Main Exhibition Hall Foyer', label: 'General Delegate Registration', capacity: 8000, throughput: 42, strainPct: 76, waitMins: 4, status: 'Optimal' },
      { id: 'gate-jio-c', name: 'Lotus Ballroom & Lawn', label: 'Evening Keynote & Gala Access', capacity: 6000, throughput: 30, strainPct: 68, waitMins: 3, status: 'Optimal' },
    ]
  },
  {
    id: 'cidco-centre-vashi',
    name: 'CIDCO Exhibition & Convention Centre',
    city: 'Navi Mumbai',
    area: 'Vashi, Sector 30A',
    lat: 19.0633,
    lng: 72.9978,
    capacity: 25000,
    transitHubs: 'Vashi Suburban Railway Station, Sion-Panvel Highway, Vashi Bus Terminal',
    parkingLots: [
      { name: 'P1 Inorbit / CIDCO Surface Lot', cap: 1800 },
      { name: 'P2 Vashi Railway Station Commercial Lot', cap: 1400 },
    ],
    gates: [
      { id: 'gate-cidco-a', name: 'Hall 1 & 2 Main Foyer', label: 'Primary Registration & Badging', capacity: 10000, throughput: 45, strainPct: 75, waitMins: 4, status: 'Optimal' },
      { id: 'gate-cidco-b', name: 'Station Skywalk Entrance', label: 'Direct Vashi Train Commuters', capacity: 10000, throughput: 50, strainPct: 82, waitMins: 5, status: 'Heavy' },
      { id: 'gate-cidco-c', name: 'VIP & Media Bay', label: 'Highway Ramp VIP Entrance', capacity: 5000, throughput: 20, strainPct: 52, waitMins: 2, status: 'Optimal' },
    ]
  },
];

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
    duration: '2.5 hrs',
    status: 'Live', // 'Draft' | 'Published' | 'Live' | 'Completed'
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
    description: 'High-density international fixture featuring dynamic walking path balancing, synchronized Harbour Line train schedules, and zoned hotel shuttle buses.',
    gates: [
      { id: 'gate-a', name: 'Gate A (North Express)', label: 'VIP, Hospitality & Media', capacity: 6000, throughput: 28, strainPct: 68, waitMins: 3, status: 'Optimal' },
      { id: 'gate-b', name: 'Gate B (East Concourse)', label: 'Transit, Nerul Suburban Rail', capacity: 22000, throughput: 65, strainPct: 88, waitMins: 7, status: 'Heavy' },
      { id: 'gate-c', name: 'Gate C (South Bus Bay)', label: 'Express Shuttles & Outstation', capacity: 15000, throughput: 32, strainPct: 64, waitMins: 3, status: 'Optimal' },
      { id: 'gate-d', name: 'Gate D (West Perimeter)', label: 'General Admission & Carpools', capacity: 12000, throughput: 17, strainPct: 72, waitMins: 4, status: 'Optimal' },
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
      primaryHotels: ['The Park Navi Mumbai', 'Courtyard by Marriott Nerul', 'Fortune Select Seawoods'],
    },
    safetyMetrics: {
      collisionRiskScore: 0.18,
      riskLevel: 'LOW',
      mitigatedDeconflictions: 14,
      activeMarshals: 180,
    },
    liveLogs: [
      { time: '17:42:10', type: 'info', msg: 'Gate B entry gates operating at nominal 65 fans/min cadence.' },
      { time: '17:38:05', type: 'alert', msg: 'Harbour Line train arriving Nerul: Diverted 420 fans from Gate B to Gate A.' },
      { time: '17:25:30', type: 'success', msg: 'South Express Shuttle wave 4 docked at Gate C. 850 passengers cleared.' },
    ],
  },
  {
    id: 'tata-ipl-derby-2026',
    title: 'Tata IPL 2026 — Maharashtra Clásico',
    subtitle: 'Mumbai Indians vs Pune Super Giants · Group Decider',
    category: 'ipl',
    categoryLabel: 'Tata IPL Cricket',
    sport: 'Cricket',
    venue: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    area: 'Nerul, Sector 7',
    lat: 19.033,
    lng: 73.0297,
    date: '2026-05-20',
    time: '19:30 IST',
    duration: '4.0 hrs',
    status: 'Published', // Visible to fans & open for booking
    capacity: 55000,
    sold: 52400,
    basePrice: 1800,
    vipPrice: 12000,
    currency: '₹',
    grossRevenue: 108500000,
    ingressRate: 180,
    totalTurnstiles: 64,
    organizer: 'BCCI & IPL Operations',
    badge: 'IPL PRIME FIXTURE',
    description: 'High-voltage Maharashtra rivalry featuring coordinated Mumbai-Pune Expressway fan convoys, Atal Setu rapid feeders, and synchronized Nerul train dispatching.',
    gates: [
      { id: 'gate-ipl-a', name: 'Gate A (North Pavilion)', label: 'Corporate & Garware Club', capacity: 7000, throughput: 30, strainPct: 70, waitMins: 3, status: 'Optimal' },
      { id: 'gate-ipl-b', name: 'Gate B (East Stand)', label: 'Nerul Station Main Walkway', capacity: 21000, throughput: 62, strainPct: 82, waitMins: 5, status: 'Heavy' },
      { id: 'gate-ipl-c', name: 'Gate C (South Stand)', label: 'Pune Expressway Shuttle Drop', capacity: 15000, throughput: 44, strainPct: 65, waitMins: 3, status: 'Optimal' },
      { id: 'gate-ipl-d', name: 'Gate D (West Stand)', label: 'General Fans & Carpools', capacity: 12000, throughput: 25, strainPct: 68, waitMins: 4, status: 'Optimal' },
    ],
    transitSplit: {
      railMetro: 46,
      shuttles: 30, // Pune & South Mumbai express shuttles
      parkRide: 16,
      rideshare: 8,
    },
    hotelAbsorption: {
      ratePct: 91.5,
      roomsBooked: 1850,
      totalRooms: 2020,
      revparUpliftPct: 24.8,
      primaryHotels: ['Four Points by Sheraton Vashi', 'Radisson Blu Belapur', 'Taj The Trees'],
    },
    safetyMetrics: {
      collisionRiskScore: 0.21,
      riskLevel: 'LOW',
      mitigatedDeconflictions: 18,
      activeMarshals: 240,
    },
    liveLogs: [
      { time: '16:30:00', type: 'info', msg: 'Expressway Shuttle Convoy 1 from Pune Wakad arrived at Kalamboli drop.' },
      { time: '16:15:00', type: 'info', msg: 'Nerul LP Junction traffic signal timing extended to 120s green for stadium inbound.' },
    ],
  },
  {
    id: 'coldplay-stadium-tour-2026',
    title: 'Coldplay: Music of the Spheres Stadium Tour',
    subtitle: 'Eco-Powered Mega Concert Live in Mumbai',
    category: 'concert',
    categoryLabel: 'Concerts & Live Music',
    sport: 'Live Entertainment',
    venue: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    area: 'Nerul, Sector 7',
    lat: 19.033,
    lng: 73.0297,
    date: '2026-07-18',
    time: '19:30 IST',
    duration: '3.5 hrs',
    status: 'Published',
    capacity: 55000,
    sold: 54900,
    basePrice: 2500,
    vipPrice: 15000,
    currency: '₹',
    grossRevenue: 152000000,
    ingressRate: 195,
    totalTurnstiles: 64,
    organizer: 'BookMyShow Live & Live Nation',
    badge: 'WORLD STADIUM TOUR',
    description: 'Kinetic flooring and eco-sustainable mega-stadium concert. Simultaneous entry surge balanced via staggered entry gates and dedicated Seawoods train bridges.',
    gates: [
      { id: 'gate-cp-a', name: 'Gate A (Standing Arena)', label: 'General Standing Pitch Floor', capacity: 20000, throughput: 88, strainPct: 92, waitMins: 8, status: 'Heavy' },
      { id: 'gate-cp-b', name: 'Gate B (Tier 1 & 2)', label: 'East Stand Seating', capacity: 15000, throughput: 48, strainPct: 86, waitMins: 6, status: 'Heavy' },
      { id: 'gate-cp-c', name: 'Gate C (West Stand)', label: 'West Stand & Hospitality Boxes', capacity: 12000, throughput: 36, strainPct: 75, waitMins: 4, status: 'Optimal' },
      { id: 'gate-cp-d', name: 'Gate D (North Concourse)', label: 'Express Wristband Exchange', capacity: 8000, throughput: 23, strainPct: 80, waitMins: 5, status: 'Optimal' },
    ],
    transitSplit: {
      railMetro: 52,
      shuttles: 25,
      parkRide: 15,
      rideshare: 8,
    },
    hotelAbsorption: {
      ratePct: 96.2,
      roomsBooked: 2200,
      totalRooms: 2280,
      revparUpliftPct: 32.5,
      primaryHotels: ['The Grand Vashi', 'Lemon Tree Nerul', 'Novotel Mumbai Belapur'],
    },
    safetyMetrics: {
      collisionRiskScore: 0.28,
      riskLevel: 'MODERATE',
      mitigatedDeconflictions: 19,
      activeMarshals: 260,
    },
    liveLogs: [
      { time: '18:50:12', type: 'alert', msg: 'Standing floor wristband queues rebalanced via secondary North walkway.' },
      { time: '18:41:00', type: 'info', msg: 'Local train special frequency activated at Nerul: trains every 3 minutes.' },
    ],
  },
];

// Helper functions for Admin & Client sync
const STORAGE_KEY = 'stadia_mega_events_v2';

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
    window.dispatchEvent(new CustomEvent('stadia_events_updated', { detail: events }));
  } catch (err) {
    console.error('Error saving events to storage:', err);
  }
}

// Fans only see Published, Live, or Registration Open events
export function getPublicEvents() {
  const events = getStoredEvents();
  return events.filter(e => {
    const s = (e.status || '').toLowerCase();
    return s === 'published' || s === 'live' || s === 'registration open' || s === 'scheduled';
  });
}

// Executive organizers see all events including Drafts
export function getAllEventsForOrganizer() {
  return getStoredEvents();
}

export function getEventById(id) {
  const events = getStoredEvents();
  return events.find(e => e.id === id) || null;
}

export function updateEventStatus(id, newStatus) {
  const events = getStoredEvents();
  let updatedEvent = null;
  const updated = events.map(e => {
    if (e.id === id) {
      updatedEvent = {
        ...e,
        status: newStatus,
        liveLogs: [
          {
            time: new Date().toLocaleTimeString(),
            type: newStatus === 'Live' ? 'alert' : 'info',
            msg: `Event status updated to "${newStatus}" by Executive Organizer.`
          },
          ...(e.liveLogs || [])
        ]
      };
      return updatedEvent;
    }
    return e;
  });

  saveStoredEvents(updated);
  return updatedEvent;
}

export function createNewEvent(formData) {
  const current = getStoredEvents();
  const id = (formData.title || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 32) + '-' + Math.floor(100 + Math.random() * 900);
  
  const capacity = Number(formData.capacity) || 50000;
  const basePrice = Number(formData.basePrice) || 1200;
  const vipPrice = Number(formData.vipPrice) || (basePrice * 4);
  const status = formData.status || 'Draft'; // Default to Draft unless explicitly published
  const duration = formData.duration || '3.5 hrs';

  // Find matching preset if selected
  const preset = MAHARASHTRA_VENUE_PRESETS.find(p => p.name === formData.venue || p.id === formData.venueId);

  const venue = formData.venue || preset?.name || 'DY Patil Sports Stadium';
  const city = formData.city || preset?.city || 'Navi Mumbai';
  const area = formData.area || preset?.area || 'Nerul, Sector 7';
  const lat = Number(formData.lat) || preset?.lat || 19.033;
  const lng = Number(formData.lng) || preset?.lng || 73.0297;

  const sold = status === 'Draft' ? 0 : Math.floor(capacity * (0.35 + Math.random() * 0.2));
  const grossRevenue = sold * basePrice;

  // Build gates from preset or default 4 gates
  const gates = preset?.gates?.map((g, idx) => ({
    id: `${id}-gate-${idx + 1}`,
    name: g.name,
    label: g.label,
    capacity: Math.round(capacity * (g.capacity / (preset.capacity || 50000))),
    throughput: g.throughput || 30,
    strainPct: status === 'Draft' ? 0 : g.strainPct || 65,
    waitMins: status === 'Draft' ? 0 : g.waitMins || 4,
    status: status === 'Draft' ? 'Optimal' : g.status || 'Optimal'
  })) || [
    { id: `${id}-gate-a`, name: 'Gate A (North Express)', label: 'VIP & Hospitality Access', capacity: Math.round(capacity * 0.15), throughput: 30, strainPct: 60, waitMins: 3, status: 'Optimal' },
    { id: `${id}-gate-b`, name: 'Gate B (East Concourse)', label: 'Transit & Suburban Rail Access', capacity: Math.round(capacity * 0.40), throughput: 65, strainPct: 78, waitMins: 5, status: 'Optimal' },
    { id: `${id}-gate-c`, name: 'Gate C (South Bus Bay)', label: 'Electric Shuttles & Highway Drop', capacity: Math.round(capacity * 0.25), throughput: 40, strainPct: 62, waitMins: 3, status: 'Optimal' },
    { id: `${id}-gate-d`, name: 'Gate D (West Perimeter)', label: 'General Admission & Carpools', capacity: Math.round(capacity * 0.20), throughput: 35, strainPct: 65, waitMins: 4, status: 'Optimal' },
  ];

  const newEvent = {
    id,
    title: formData.title,
    subtitle: formData.subtitle || `${formData.categoryLabel || 'Live Stadium Event'} in ${city}`,
    category: formData.category || 'cricket',
    categoryLabel: formData.categoryLabel || formData.category || 'Live Event',
    sport: formData.sport || formData.categoryLabel || 'Entertainment',
    venue,
    city,
    area,
    lat,
    lng,
    date: formData.date || new Date().toISOString().split('T')[0],
    time: formData.time || '19:00 IST',
    duration,
    status, // 'Draft' | 'Published' | 'Live' | 'Completed'
    capacity,
    sold,
    basePrice,
    vipPrice,
    currency: '₹',
    grossRevenue,
    ingressRate: Math.round(capacity / 400),
    totalTurnstiles: Math.max(32, Math.round(capacity / 1000)),
    organizer: formData.organizer || 'Executive Stadium Operations',
    badge: formData.badge || (status === 'Draft' ? 'INTERNAL STAGING' : 'VERIFIED STADIA EVENT'),
    description: formData.description || `Event orchestrated by Stadia for ${venue}, ${city}. Features dynamic gate balancing, multimodal transit coordination, and local accommodation synchronization.`,
    gates,
    transitSplit: {
      railMetro: Number(formData.railSplit) || 45,
      shuttles: Number(formData.shuttleSplit) || 28,
      parkRide: Number(formData.parkSplit) || 17,
      rideshare: Number(formData.rideshareSplit) || 10,
    },
    hotelAbsorption: {
      ratePct: status === 'Draft' ? 0 : 78.5,
      roomsBooked: status === 'Draft' ? 0 : Math.round(capacity * 0.028),
      totalRooms: Math.round(capacity * 0.035),
      revparUpliftPct: 22.0,
      primaryHotels: preset?.id?.includes('pune') 
        ? ['Sayaji Pune (Wakad)', 'Courtyard Hinjewadi', 'Vivanta Pune'] 
        : ['The Park Navi Mumbai', 'Four Points by Sheraton Vashi', 'Radisson Blu Belapur'],
    },
    safetyMetrics: {
      collisionRiskScore: 0.15,
      riskLevel: 'LOW',
      mitigatedDeconflictions: 0,
      activeMarshals: Math.round(capacity / 250),
    },
    liveLogs: [
      { 
        time: new Date().toLocaleTimeString(), 
        type: 'info', 
        msg: `Event created in [${status}] state by Executive Organizer.` 
      },
      { 
        time: new Date().toLocaleTimeString(), 
        type: 'success', 
        msg: `${gates.length} entry gates calibrated with ${capacity.toLocaleString('en-IN')} total capacity.` 
      },
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

