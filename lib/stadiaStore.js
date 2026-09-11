// lib/stadiaStore.js — Unified In-Memory Simulation & Data Store for Next.js
import { MATCHES_DATA, BLOCKS_DATA, GATES_DATA, PARKING_DATA, SHUTTLES_DATA, HOTELS_DATA, TOURISM_DATA } from './stadiaData.js';

// Initial state for mega-event multi-corridor orchestration
const INITIAL_ACCOMMODATION_ZONES = [
  {
    id: 1,
    name: 'Vashi Hospitality Zone',
    code: 'VASHI',
    lat: 19.0757,
    lng: 72.9984,
    total_rooms: 1800,
    booked_rooms: 1420,
    avg_rate: 12500,
    surge_multiplier: 1.0,
    is_overflow_recommended: 0,
    transit_link_desc: 'Direct Harbour Line link + Vashi Express Shuttles',
    shuttle_service_available: 1,
  },
  {
    id: 2,
    name: 'Belapur CBD Corridor',
    code: 'BELAPUR',
    lat: 19.0317,
    lng: 73.0364,
    total_rooms: 1200,
    booked_rooms: 980,
    avg_rate: 14000,
    surge_multiplier: 1.0,
    is_overflow_recommended: 0,
    transit_link_desc: 'Metro Line 1 + Sector 15 Park & Ride Feeder',
    shuttle_service_available: 1,
  },
  {
    id: 3,
    name: 'Seawoods Grand Central Area',
    code: 'SEAWOODS',
    lat: 19.04,
    lng: 73.01,
    total_rooms: 950,
    booked_rooms: 780,
    avg_rate: 11000,
    surge_multiplier: 1.0,
    is_overflow_recommended: 0,
    transit_link_desc: 'Walking distance (1.2 km) / 5-min electric shuttle',
    shuttle_service_available: 1,
  },
  {
    id: 4,
    name: 'Airport Belt & Western Suburbs',
    code: 'AIRPORT_BELT',
    lat: 19.0957,
    lng: 72.8711,
    total_rooms: 3500,
    booked_rooms: 2450,
    avg_rate: 19500,
    surge_multiplier: 1.0,
    is_overflow_recommended: 1,
    transit_link_desc: 'Dedicated Highway Express Convoy via Atal Setu (MTHL)',
    shuttle_service_available: 1,
  },
];

const INITIAL_TRANSIT_CORRIDORS = [
  {
    id: 1,
    name: 'Harbour Line Suburban Rail',
    mode: 'suburban_rail',
    capacity_per_hr: 24000,
    current_load_pct: 68,
    status: 'nominal',
    from_location: 'CSMT / Kurla Junction',
    to_location: 'Nerul / Belapur',
  },
  {
    id: 2,
    name: 'Navi Mumbai Metro Line 1',
    mode: 'metro',
    capacity_per_hr: 12000,
    current_load_pct: 54,
    status: 'nominal',
    from_location: 'Belapur Terminal',
    to_location: 'Pendhar via Central Park',
  },
  {
    id: 3,
    name: 'Sion-Panvel Expressway (Corridor A)',
    mode: 'highway',
    capacity_per_hr: 8500,
    current_load_pct: 79,
    status: 'heavy',
    from_location: 'Vashi Toll Plaza',
    to_location: 'Nerul Flyover',
  },
  {
    id: 4,
    name: 'Palm Beach Road Park & Ride Feeder',
    mode: 'park_ride_feeder',
    capacity_per_hr: 6000,
    current_load_pct: 42,
    status: 'optimal',
    from_location: 'Sanpada P&R Lot',
    to_location: 'DY Patil Stadium Gates A/B',
  },
];

const INITIAL_HOSPITALITY_MERCHANTS = [
  {
    id: 1,
    name: 'Brewmeister Navi Mumbai',
    zone: 'Nerul',
    category: 'dining',
    capacity: 250,
    discount_pct: 15,
    voucher_code: 'STADIA15BREW',
    egress_delay_mins: 45,
    description: 'Post-match craft beer & gastropub dining 800m from Gate A.',
  },
  {
    id: 2,
    name: 'Fan Zone Sector 15 Lawn',
    zone: 'Belapur',
    category: 'fan_park',
    capacity: 2000,
    discount_pct: 20,
    voucher_code: 'FANPARK20',
    egress_delay_mins: 90,
    description: 'Giant screens, live DJ, street food festival & shuttle lounge.',
  },
  {
    id: 3,
    name: 'Grand Central Food Atrium',
    zone: 'Seawoods',
    category: 'dining',
    capacity: 600,
    discount_pct: 10,
    voucher_code: 'GRANDSTADIA',
    egress_delay_mins: 60,
    description: '40+ restaurants with live acoustic performances and AC lounges.',
  },
];

// Global in-memory singleton to persist across requests in the same Node/Vercel instance
class StadiaStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.matches = JSON.parse(JSON.stringify(MATCHES_DATA));
    this.blocks = JSON.parse(JSON.stringify(BLOCKS_DATA));
    this.gates = JSON.parse(JSON.stringify(GATES_DATA));
    this.parking = JSON.parse(JSON.stringify(PARKING_DATA));
    this.shuttles = JSON.parse(JSON.stringify(SHUTTLES_DATA));
    this.hotels = JSON.parse(JSON.stringify(HOTELS_DATA));
    this.tourism = JSON.parse(JSON.stringify(TOURISM_DATA));
    this.zones = JSON.parse(JSON.stringify(INITIAL_ACCOMMODATION_ZONES));
    this.transit = JSON.parse(JSON.stringify(INITIAL_TRANSIT_CORRIDORS));
    this.merchants = JSON.parse(JSON.stringify(INITIAL_HOSPITALITY_MERCHANTS));

    this.simState = {
      active_scenario: 'baseline',
      surge_pct: 0,
      rain_delay_hours: 0,
      gate_disruption_gate_id: 'none',
      transit_outage_corridor_id: 'none',
    };

    this.interventions = [];
    this.bookings = [];
    this.notifications = [];
    this.referrals = [
      { id: 1, ticket_id: 'FWC-IND-10492', type: 'hotel', amount: 1440, created_at: new Date().toISOString() },
      { id: 2, ticket_id: 'FWC-IND-10518', type: 'airtel_tv', amount: 199, created_at: new Date().toISOString() },
      { id: 3, ticket_id: 'FWC-IND-10531', type: 'hotel', amount: 1800, created_at: new Date().toISOString() },
    ];
  }

  getEcosystem() {
    const { active_scenario, surge_pct, rain_delay_hours, gate_disruption_gate_id, transit_outage_corridor_id } = this.simState;

    // Dynamically adjust zones based on scenario
    const zones = this.zones.map((z) => {
      let booked = z.booked_rooms;
      let surge = z.surge_multiplier;
      if (active_scenario === 'demand_spike') {
        booked = Math.min(z.total_rooms, Math.round(booked * (1 + surge_pct / 100)));
        surge = Number((surge * 1.25).toFixed(2));
      }
      const occupancy_pct = Math.round((booked / z.total_rooms) * 100);
      return {
        ...z,
        booked_rooms: booked,
        occupancy_pct,
        surge_multiplier: surge,
        status: occupancy_pct >= 90 ? 'critical' : occupancy_pct >= 75 ? 'warning' : 'optimal',
      };
    });

    // Dynamically adjust transit based on scenario
    const transit = this.transit.map((t) => {
      let load = t.current_load_pct;
      let status = t.status;
      if (active_scenario === 'demand_spike') {
        load = Math.min(100, Math.round(load * 1.2));
        status = load >= 90 ? 'chokepoint' : load >= 75 ? 'heavy' : 'nominal';
      } else if (active_scenario === 'transit_outage' && String(t.id) === String(transit_outage_corridor_id)) {
        load = 98;
        status = 'disrupted';
      }
      return { ...t, current_load_pct: load, status };
    });

    // Dynamically adjust gates based on scenario
    const gates = this.gates.map((g) => {
      let assigned = g.assigned;
      let status = g.status;
      if (active_scenario === 'demand_spike') {
        assigned = Math.round(assigned * (1 + surge_pct / 100));
      }
      if (active_scenario === 'gate_disruption' && String(g.id) === String(gate_disruption_gate_id)) {
        status = 'CRITICAL_JAM';
      }
      const load = Number((assigned / g.capacity).toFixed(2));
      return { ...g, assigned, load, status };
    });

    // Summary KPIs
    const totalCapacity = this.zones.reduce((s, z) => s + z.total_rooms, 0);
    const totalBooked = zones.reduce((s, z) => s + z.booked_rooms, 0);
    const avgOccupancy = Math.round((totalBooked / totalCapacity) * 100);
    const avgTransitLoad = Math.round(transit.reduce((s, t) => s + t.current_load_pct, 0) / transit.length);

    return {
      scenario: active_scenario,
      simulationState: this.simState,
      kpis: {
        totalAccommodationsCapacity: totalCapacity,
        totalRoomsBooked: totalBooked,
        avgOccupancyPct: avgOccupancy,
        avgTransitLoadPct: avgTransitLoad,
        activeInterventionsCount: this.interventions.length,
        rainDelayHours: rain_delay_hours,
      },
      zones,
      transit,
      gates,
      merchants: this.merchants,
      activeInterventions: this.interventions,
    };
  }

  setScenario(scenario, params = {}) {
    this.simState.active_scenario = scenario;
    if (params.surge_pct !== undefined) this.simState.surge_pct = Number(params.surge_pct);
    if (params.rain_delay_hours !== undefined) this.simState.rain_delay_hours = Number(params.rain_delay_hours);
    if (params.gate_disruption_gate_id !== undefined) this.simState.gate_disruption_gate_id = String(params.gate_disruption_gate_id);
    if (params.transit_outage_corridor_id !== undefined) this.simState.transit_outage_corridor_id = String(params.transit_outage_corridor_id);
    return this.getEcosystem();
  }

  applyIntervention({ scenario_id, action_type, title, description, impact_metric }) {
    const intervention = {
      id: Date.now(),
      scenario_id: scenario_id || this.simState.active_scenario,
      action_type,
      title,
      description,
      impact_metric,
      applied_at: new Date().toISOString(),
    };
    this.interventions.unshift(intervention);
    return intervention;
  }

  getReferralsSummary() {
    const totalReferrals = this.referrals.length;
    const totalCommission = this.referrals.reduce((sum, r) => sum + r.amount, 0);
    const hotelCommission = this.referrals.filter((r) => r.type === 'hotel').reduce((sum, r) => sum + r.amount, 0);
    const telecomCommission = this.referrals.filter((r) => r.type === 'airtel_tv').reduce((sum, r) => sum + r.amount, 0);

    return {
      totalReferrals,
      totalCommission,
      hotelCommission,
      telecomCommission,
      recentEvents: this.referrals.slice(0, 10),
    };
  }
}

// Global variable attached to globalThis to survive Next.js module reloads in dev
const globalStoreKey = Symbol.for('stadia.store');
if (!globalThis[globalStoreKey]) {
  globalThis[globalStoreKey] = new StadiaStore();
}

export const stadiaStore = globalThis[globalStoreKey];
