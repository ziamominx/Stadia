import { Router } from 'express';
import { db } from '../db.js';

export const itineraryRouter = Router();

// GET /api/itinerary/events — Available mega-events
itineraryRouter.get('/events', (req, res) => {
  const events = db.prepare('SELECT * FROM mega_events ORDER BY id').all();
  res.json({ events });
});

// POST /api/itinerary/plan — Intelligent End-to-End Attendee Trip Orchestration
itineraryRouter.post('/plan', (req, res) => {
  const {
    eventId,
    attendeeType, // 'local' or 'outstation'
    originCity,
    budgetPreference, // 'economy', 'balanced', 'luxury'
    travelMode, // 'public_transit' or 'personal_vehicle'
    earlyArrivalPreference // boolean
  } = req.body;

  const event = db.prepare('SELECT * FROM mega_events WHERE id = ?').get(eventId || 1) ||
    db.prepare('SELECT * FROM mega_events ORDER BY id LIMIT 1').get();

  const zones = db.prepare('SELECT * FROM accommodation_zones ORDER BY id').all();

  // Intelligent Accommodation Recommendation
  // Core Nerul is saturated (95%) -> Recommend Belapur or Kharghar with high savings & rapid transit pass
  let recommendedZone = null;
  let alternativeZone = null;

  if (attendeeType === 'outstation') {
    // Top alternative zone
    recommendedZone = zones.find(z => z.code === 'KHARGHAR_GREEN') || zones[3];
    alternativeZone = zones.find(z => z.code === 'BELAPUR_BIZ') || zones[2];
  } else {
    recommendedZone = zones.find(z => z.code === 'CORE_NERUL') || zones[0];
  }

  // Calculate savings compared to core zone
  const coreRate = zones.find(z => z.code === 'CORE_NERUL')?.avg_rate || 16500;
  const recommendedRate = recommendedZone?.avg_rate || 4800;
  const estimatedSavings = Math.max(0, coreRate - recommendedRate);

  // Dynamic Incentives
  const incentives = [];
  if (earlyArrivalPreference) {
    incentives.push({
      title: 'Early Ingress Stadium Voucher',
      reward: '₹250 F&B Credit + Fast-Track Turnstile Lane',
      window: 'Arrive between T-3h and T-2h (4:30 PM - 5:30 PM)',
      code: 'EARLYBIRD250'
    });
  }

  if (attendeeType === 'outstation') {
    incentives.push({
      title: 'Green Zone Rapid Transit Pass',
      reward: 'Complimentary Metro Line 1 + Feeder Shuttle Pass',
      savings: '₹0 vs ₹1,200 cab surge fare',
      code: 'METROPASS26'
    });
  }

  // Staggered Egress Reward
  const diningMerchant = db.prepare('SELECT * FROM hospitality_merchants ORDER BY id LIMIT 1').get();
  incentives.push({
    title: 'Post-Event Crowd Dispersal Perk',
    reward: `${diningMerchant.discount_pct}% Off at ${diningMerchant.name}`,
    benefit: 'Avoid the 40-minute stadium exit bottleneck while relaxing',
    code: diningMerchant.voucher_code
  });

  // Recommended Gates
  const gates = db.prepare('SELECT * FROM gates ORDER BY id').all();
  const assignedGate = attendeeType === 'outstation'
    ? (gates.find(g => g.side === 'outstation') || gates[2])
    : (gates.find(g => g.side === 'local') || gates[0]);

  // Turn-by-Turn Orchestration Plan
  const timeline = [
    {
      time: '14:00 - Check-in',
      step: 'Accommodation Arrival',
      location: `${recommendedZone.name} (Partner Hub)`,
      detail: attendeeType === 'outstation'
        ? `Check into hotel with guaranteed shuttle slot. Saved ₹${estimatedSavings.toLocaleString('en-IN')} vs core saturated zone.`
        : 'Local departure staging from home.',
      status: 'confirmed'
    },
    {
      time: '16:45 - Transit Dispatch',
      step: 'Congestion-Free Multimodal Transit',
      location: recommendedZone.transit_link_desc,
      detail: attendeeType === 'outstation'
        ? 'Board Dedicated Electric Feeder Shuttle (Slot A, 17:00 departure, 14 min run time).'
        : travelMode === 'personal_vehicle'
          ? 'Route directly to P4 Palm Beach Road Lot to avoid Sion-Panvel Expressway chokepoint.'
          : 'Board Harbour Line express to Nerul Station platform 2.',
      status: 'scheduled'
    },
    {
      time: '17:30 - Stadium Ingress',
      step: 'Fast-Track Gate Entry',
      location: `${assignedGate.name} (Exclusive Side)`,
      detail: `Scan digital pass for priority queue. ${earlyArrivalPreference ? 'Early-Bird ₹250 F&B voucher activated.' : 'Normal queue 6 mins.'}`,
      status: 'ready'
    },
    {
      time: '21:45 - Post-Event Egress',
      step: 'Staggered Dispersal & Hospitality',
      location: diningMerchant.name,
      detail: `Redeem ${diningMerchant.discount_pct}% dining voucher (${diningMerchant.voucher_code}). Return shuttles operate until 00:30.`,
      status: 'recommended'
    }
  ];

  res.json({
    event,
    attendeeType,
    travelMode,
    recommendedZone,
    alternativeZone,
    estimatedSavings,
    assignedGate,
    incentives,
    timeline,
    digitalPassId: `NEXUS-ORCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  });
});
