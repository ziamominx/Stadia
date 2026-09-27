import test from "node:test";
import assert from "node:assert/strict";
import { createState } from "../lib/operations/engine.mjs";
import { DY_PATIL, STADIUM_GATES, STADIUM_HOTELS, STADIUM_PARKING, STADIUM_SHUTTLES, STADIUM_TRANSIT, gateCoordinates, isDyPatilVenue } from "../lib/operations/dy-patil.mjs";
import { INITIAL_EVENTS, MAHARASHTRA_VENUE_PRESETS } from "../lib/eventsData.js";

test("DY Patil reference gates cover all eight entrances and map to shared sectors", () => {
  const state = createState();
  assert.equal(state.event.lat, DY_PATIL.lat);
  assert.equal(state.event.lng, DY_PATIL.lng);
  assert.deepEqual(STADIUM_GATES.map((gate) => gate.id), ["A", "B", "C", "D", "E", "F", "G", "H"]);
  assert.deepEqual(STADIUM_GATES.map((gate) => gate.zoneId), ["north", "north", "east", "east", "south", "south", "west", "west"]);
  assert.ok(STADIUM_GATES.every((gate) => state.zones.some((zone) => zone.id === gate.zoneId)));
  assert.ok(STADIUM_GATES.every((gate) => Math.abs(gate.lat - DY_PATIL.lat) < .002 && Math.abs(gate.lng - DY_PATIL.lng) < .002));
  const preset = MAHARASHTRA_VENUE_PRESETS.find((venue) => venue.id === "dy-patil-nerul");
  assert.equal(preset.gates.length, 8);
  assert.equal(preset.gates.reduce((sum, gate) => sum + gate.capacity, 0), preset.capacity);
  assert.ok(INITIAL_EVENTS.filter((event) => event.venue.includes("DY Patil")).every((event) => event.gates.length === 8));
});

test("reference layers stay with DY Patil and gates translate for custom venues", () => {
  assert.ok(isDyPatilVenue(DY_PATIL.lat, DY_PATIL.lng));
  assert.ok(!isDyPatilVenue(18.9389, 72.8258));
  assert.equal(STADIUM_PARKING.length, 5);
  assert.ok(STADIUM_HOTELS.length >= 4);
  assert.ok(STADIUM_TRANSIT.every((route) => route.points.length >= 2));
  assert.ok(STADIUM_SHUTTLES.every((route) => route.points.length >= 2));
  const shifted = gateCoordinates(STADIUM_GATES[0], 18.9389, 72.8258);
  assert.equal(shifted.lat - 18.9389, STADIUM_GATES[0].lat - DY_PATIL.lat);
});
