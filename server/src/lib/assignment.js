import { haversineKm, nearest } from './geo.js';

// Parking zones above this occupancy are treated as full for new assignments,
// forcing the route engine to fall through to the next-nearest zone.
export const PARKING_LOAD_LIMIT = 0.85;

// Shuttle drop/pickup points (outstation side of the stadium).
export const SHUTTLE_ZONES = [
  { zone: 'Zone 1 · East Gate C', lat: 19.0436, lng: 73.03 },
  { zone: 'Zone 2 · South Gate E', lat: 19.0391, lng: 73.02667 },
  { zone: 'Zone 3 · South-East Gate D', lat: 19.0398, lng: 73.0292 },
  { zone: 'Zone 4 · South-West Gate F', lat: 19.0398, lng: 73.0242 },
];

export const TRANSIT_STATIONS = [
  { name: 'Nerul Railway Station (Harbour Line)', lat: 19.0444, lng: 73.0277 },
  { name: 'CBD Belapur Railway Station', lat: 19.0329, lng: 73.0341 },
  { name: 'Vashi Railway Station', lat: 19.0766, lng: 72.9986 },
];

export function shuttleZoneCoords(zoneName) {
  return SHUTTLE_ZONES.find((z) => z.zone === zoneName) ?? SHUTTLE_ZONES[0];
}

/**
 * Explicit route assignment engine.
 *
 *   seat_block ──nearest─▶ gate (Haversine, within the visitor's side)
 *        └─ vehicle ──nearest-with-room─▶ parking zone
 *        └─ transit ──nearest─▶ gate + public transit point
 *
 * The nearest-gate step runs inside the visitor's designated side
 * (local = North/West gates, outstation = East/South gates): the physical
 * separation of the two crowds is a hard design constraint of the platform,
 * so "nearest" never crosses from one crowd's corridor into the other's.
 *
 * The parking step is load-aware: the closest zone to the gate is skipped
 * when it is over PARKING_LOAD_LIMIT, falling through to the next-nearest
 * zone with room. Every load-based fallthrough is logged and returned in the
 * `decision` payload so the UI can show *why* a zone was chosen.
 */
export function assignRoute({ gates, parkingZones, parkingLoads, block, travelMode, visitorType = 'local' }) {
  const side = visitorType === 'outstation' ? 'outstation' : 'local';
  const eligibleGates = gates.filter((g) => g.side === side);

  // Step 1 — nearest gate by physical distance from the seat block.
  const entry = nearest(eligibleGates, block).item;
  // Exit on the same side, farthest from the entry gate so arrival and exit
  // flows don't cross inside the stadium perimeter.
  const exit = eligibleGates.reduce(
    (best, g) => (haversineKm(entry, g) > haversineKm(entry, best) ? g : best),
    eligibleGates.find((g) => g.id !== entry.id) ?? entry,
  );

  const decision = { reassigned: false, reason: null };
  let parkingZone = null;
  let transitHint = null;

  if (travelMode === 'vehicle') {
    // Step 2 — rank ALL parking zones by distance to the gate, then take the
    // nearest one that still has spare capacity. This is the intelligent part:
    // under load, the engine visibly reassigns instead of always picking #1.
    const loadOf = (p) => (parkingLoads?.get(p.id) ?? 0) / Math.max(1, p.capacity);
    const byDistance = [...parkingZones].sort(
      (a, b) => haversineKm(entry, a) - haversineKm(entry, b),
    );
    parkingZone = byDistance.find((p) => loadOf(p) <= PARKING_LOAD_LIMIT) ?? byDistance[0];

    const nearestZone = byDistance[0];
    if (parkingZone && nearestZone && parkingZone.id !== nearestZone.id) {
      decision.reassigned = true;
      decision.reason = `${nearestZone.name} is ${Math.round(loadOf(nearestZone) * 100)}% full — reassigned to ${parkingZone.name} (${Math.round(loadOf(parkingZone) * 100)}% full)`;
      console.log(`🚗 assignRoute: ${decision.reason}`);
    }
  } else if (travelMode === 'transit') {
    // Nearest public transit point to the entry gate (static reference data).
    const st = nearest(TRANSIT_STATIONS, entry);
    transitHint = `${st.item.name} · ${st.distanceKm.toFixed(1)} km walk to ${entry.name}`;
  }

  return { entryGate: entry, exitGate: exit, parkingZone, transitHint, decision };
}

/**
 * Outstation visitor: hotel -> shuttle zone (nearest drop point to hotel) ->
 * shuttle time slot (least loaded, preferring the popular T-2h slot) ->
 * entry gate on the shuttle side, exit gate nearest the seat block.
 */
export function assignOutstation({ gates, block, shuttles, hotel, shuttleLoads }) {
  const outGates = gates.filter((g) => g.side === 'outstation');
  const zone = nearest(SHUTTLE_ZONES, hotel).item;
  const dropGate = nearest(outGates, zone).item;

  const blockGate = nearest(outGates, block).item;
  const entryGate = dropGate;
  const exitGate = blockGate.id === entryGate.id ? (outGates.find((g) => g.id !== entryGate.id) ?? entryGate) : blockGate;

  const zoneShuttles = shuttles.filter((s) => s.zone === zone.zone);
  // Prefer the 2h-before slot when it has room; otherwise least-loaded slot.
  const popular = zoneShuttles.filter((s) => s.departure_time.endsWith('2h'));
  let shuttle;
  if (popular.length) {
    const candidate = popular.sort((a, b) => (shuttleLoads.get(a.id) ?? 0) - (shuttleLoads.get(b.id) ?? 0))[0];
    shuttle = (shuttleLoads.get(candidate.id) ?? 0) < candidate.capacity ? candidate : null;
  }
  if (!shuttle) {
    shuttle = zoneShuttles.sort(
      (a, b) => (shuttleLoads.get(a.id) ?? 0) / a.capacity - (shuttleLoads.get(b.id) ?? 0) / b.capacity,
    )[0];
  }

  return { entryGate, exitGate, shuttle, zone };
}