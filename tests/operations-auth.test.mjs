import test from "node:test";
import assert from "node:assert/strict";
import { issueSession, readSession, canAccess, canCommand, isSameRequestOrigin } from "../lib/operations/auth.mjs";
import { createState, command } from "../lib/operations/engine.mjs";

const secret = "test-session-secret-is-at-least-32-characters";
test("origin check accepts the local preview alias without allowing foreign sites", () => {
  assert.equal(isSameRequestOrigin("http://127.0.0.1:3001", "http://localhost:3001/api/ops-session", "127.0.0.1:3001"), true);
  assert.equal(isSameRequestOrigin("http://localhost:3001", "http://127.0.0.1:3001/api/ops-session", "localhost:3001"), true);
  assert.equal(isSameRequestOrigin("https://stadia.example", "https://internal.example/api/ops-session", "stadia.example"), true);
  assert.equal(isSameRequestOrigin("https://stadia.example", "http://internal.example/api/ops-session", "stadia.example"), false);
  assert.equal(isSameRequestOrigin("http://evil.example", "http://localhost:3001/api/ops-session", "localhost:3001"), false);
  assert.equal(isSameRequestOrigin("http://localhost:4000", "http://localhost:3001/api/ops-session", "localhost:3001"), false);
});
test("sessions expire and cannot be changed to another role", async () => {
  const value = await issueSession("ground", secret, 1000);
  assert.equal(await readSession(value, secret, 1001), "ground");
  assert.equal(await readSession(value, secret, 1000 + 8 * 60 * 60 * 1000), null);
  assert.equal(await readSession(value.replace(/^./, value[0] === "a" ? "b" : "a"), secret, 1001), null);
});
test("roles cannot open executive pages or mutate another team", () => {
  assert.equal(canAccess("ground", "/analytics"), false);
  assert.equal(canAccess("transport", "/ground"), false);
  assert.equal(canAccess("hospitality", "/hospitality"), true);
  assert.equal(canAccess("executive", "/ground"), true);
  const state = createState();
  assert.equal(canCommand("ground", { type: "settings" }, state), false);
  assert.equal(canCommand("transport", { type: "reserve" }, state), true);
  assert.equal(canCommand("hospitality", { type: "broadcast" }, state), false);
});
test("event setup changes shared state and rejects invalid configuration atomically", () => {
  const initial = createState();
  const config = { name: "Final Match", venue: "DY Patil Stadium", date: "2026-10-01", startTime: "19:30", capacity: 60000, expected: 50000, lat: 19.033, lng: 73.0297, rules: { warningThreshold: 70, criticalThreshold: 90 }, staffing: { security: 100, police: 40, staff: 50, volunteers: 180, medical: 15 }, gates: { west: { capacity: 18000 }, north: { capacity: 12000 }, east: { capacity: 16000 }, south: { capacity: 8000 } }, transit: { shuttleBuses: 30 } };
  const updated = command(initial, { type: "setup", config });
  assert.equal(updated.event.name, "Final Match");
  assert.equal(updated.event.lat, 19.033);
  assert.equal(updated.personnel.find((person) => person.id === "volunteers").total, 180);
  assert.equal(updated.buses.length, 30);
  assert.equal(initial.event.name, "India vs Australia");
  assert.throws(() => command(initial, { type: "setup", config: { ...config, expected: 61000 } }));
  assert.equal(initial.event.capacity, 54000);
});
test("hospitality requests reach executive state and can be acknowledged", () => {
  const state = command(createState(), { type: "hospitality_request", message: "Queue support required at East food court" });
  const request = state.hospitalityRequests[0];
  assert.equal(request.status, "open");
  assert.equal(command(state, { type: "hospitality_ack", id: request.id }).hospitalityRequests[0].status, "acknowledged");
});
