import test from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  command,
  tick,
  advance,
  TICK_MS,
  waitMinutes,
} from "../lib/operations/engine.mjs";

function surge() {
  const s = command(createState(0), { type: "spike" }, 0);
  tick(s);
  tick(s);
  return s;
}
function startTasks(s) {
  for (const t of s.tasks) {
    s = command(s, { type: "task", id: t.id });
    s = command(s, { type: "task", id: t.id });
  }
  return s;
}
test("crowd demo requires both teams, diverts buses, verifies stability and releases resources", () => {
  let s = surge();
  assert.equal(s.incidents.length, 1);
  assert.equal(s.zones[0].occupancy, 92);
  const id = s.incidents[0].id;
  s = command(s, { type: "dispatch", id });
  assert.equal(s.tasks.length, 2);
  assert.equal(s.personnel.find((p) => p.id === "volunteers").deployed, 124);
  const ground = s.tasks.find((t) => t.team === "ground");
  s = command(s, { type: "task", id: ground.id });
  s = command(s, { type: "task", id: ground.id });
  tick(s);
  assert.equal(s.zones[0].occupancy, 97);
  assert.equal(s.incidents[0].status, "responding");
  const transport = s.tasks.find((t) => t.team === "transport");
  s = command(s, { type: "task", id: transport.id });
  s = command(s, { type: "task", id: transport.id });
  assert.equal(s.buses.filter((b) => b.status === "diverted").length, 3);
  for (let n = 0; n < 5; n++) tick(s);
  assert.equal(s.zones[0].occupancy, 72);
  assert.equal(s.incidents[0].stable, 1);
  assert.notEqual(s.incidents[0].status, "resolved");
  tick(s);
  assert.notEqual(s.incidents[0].status, "resolved");
  tick(s);
  assert.equal(s.incidents[0].status, "resolved");
  assert.equal(s.spike, false);
  assert.equal(s.personnel.find((p) => p.id === "volunteers").deployed, 118);
  assert.ok(s.tasks.every((t) => t.status === "completed"));
});
test("duplicate dispatch and unsupported early resolution cannot mutate shared state", () => {
  let s = surge();
  const id = s.incidents[0].id;
  s = command(s, { type: "dispatch", id });
  const before = JSON.stringify(s);
  assert.throws(() => command(s, { type: "dispatch", id }), /already/);
  assert.throws(() => command(s, { type: "resolve", id }), /stability/);
  assert.equal(JSON.stringify(s), before);
});
test("fire requires completed field task, staff clearance, then explicit exit reopening", () => {
  let s = command(createState(), {
    type: "report",
    kind: "fire",
    zoneId: "east",
  });
  const id = s.incidents[0].id;
  assert.equal(s.exits.find((e) => e.zone === "east").status, "blocked");
  assert.throws(
    () => command(s, { type: "exit", id: "EX-E", status: "available" }),
    /Resolve/,
  );
  assert.throws(() => command(s, { type: "resolve", id }), /Complete/);
  s = command(s, { type: "dispatch", id });
  const t = s.tasks[0];
  for (let n = 0; n < 3; n++) s = command(s, { type: "task", id: t.id });
  tick(s);
  assert.notEqual(s.incidents[0].status, "resolved");
  s = command(s, { type: "resolve", id });
  assert.equal(s.zones.find((z) => z.id === "east").fire, false);
  assert.equal(s.exits.find((e) => e.zone === "east").status, "blocked");
  s = command(s, { type: "exit", id: "EX-E", status: "available" });
  assert.equal(s.exits.find((e) => e.zone === "east").status, "available");
  assert.equal(s.personnel.find((p) => p.id === "security").deployed, 84);
});
test("medical response reserves a team and returns it only after clearance", () => {
  let s = command(createState(), {
    type: "report",
    kind: "medical",
    zoneId: "north",
  });
  const id = s.incidents[0].id;
  s = command(s, { type: "dispatch", id });
  assert.equal(s.personnel.find((p) => p.id === "medical").deployed, 5);
  for (let n = 0; n < 3; n++)
    s = command(s, { type: "task", id: s.tasks[0].id });
  assert.equal(s.incidents[0].status, "responding");
  s = command(s, { type: "resolve", id });
  assert.equal(s.personnel.find((p) => p.id === "medical").deployed, 4);
});
test("flagged tasks halt progression and crowd stabilization", () => {
  let s = surge();
  s = command(s, { type: "dispatch", id: s.incidents[0].id });
  s = startTasks(s);
  s = command(s, { type: "flag", id: s.tasks[0].id });
  assert.throws(() => command(s, { type: "task", id: s.tasks[0].id }), /Clear/);
  for (let n = 0; n < 10; n++) tick(s);
  assert.equal(s.incidents[0].stable, 0);
  assert.notEqual(s.incidents[0].status, "resolved");
});
test("multiple observers do not advance the simulation twice; pause freezes time", () => {
  let s = createState(0);
  advance(s, TICK_MS);
  advance(s, TICK_MS);
  assert.equal(s.minute, 1);
  s = command(s, { type: "pause" }, TICK_MS);
  advance(s, TICK_MS * 10);
  assert.equal(s.minute, 1);
  s = command(s, { type: "pause" }, TICK_MS * 10);
  advance(s, TICK_MS * 11);
  assert.equal(s.minute, 2);
});
test("counts conserve attendance; closed gates and full parking reject additions", () => {
  let s = createState();
  s = command(s, { type: "entry", zoneId: "west", count: 25 });
  s = command(s, { type: "entry", zoneId: "west", count: -25 });
  assert.equal(s.event.inside, s.event.entered - s.event.exited);
  s = command(s, { type: "gate", zoneId: "west" });
  assert.throws(
    () => command(s, { type: "entry", zoneId: "west", count: 25 }),
    /unavailable/,
  );
  s.parking[0].used = s.parking[0].capacity;
  assert.throws(
    () => command(s, { type: "parking", id: "P1", delta: 10 }),
    /capacity/,
  );
  assert.equal(waitMinutes(120, 0), null);
  assert.equal(waitMinutes(120, 60, false), null);
  assert.equal(waitMinutes(121, 60), 3);
});
test("settings validate atomically and non-west crowd incidents can stabilize", () => {
  let s = createState();
  assert.throws(
    () =>
      command(s, {
        type: "settings",
        name: "Test",
        capacity: 54000,
        warning: 90,
        critical: 75,
      }),
    /Thresholds/,
  );
  assert.equal(s.rules.warning, 75);
  s.zones[1].occupancy = 94;
  tick(s);
  const id = s.incidents[0].id;
  s = command(s, { type: "dispatch", id });
  s = startTasks(s);
  for (let n = 0; n < 15; n++) tick(s);
  assert.equal(s.incidents.find((i) => i.id === id).status, "resolved");
});
test("staff route approval rejects blocked exits and invalidates a route when its exit is blocked", () => {
  let s = command(createState(), {
    type: "report",
    kind: "fire",
    zoneId: "west",
  });
  const id = s.incidents[0].id;
  assert.throws(
    () =>
      command(s, {
        type: "route",
        id,
        exitId: "EX-W",
        instructions: "Staff verified route",
        verified: true,
      }),
    /unavailable/,
  );
  assert.throws(
    () =>
      command(s, {
        type: "route",
        id,
        exitId: "EX-E",
        instructions: "Staff verified route",
        verified: false,
      }),
    /verification/,
  );
  s = command(s, {
    type: "route",
    id,
    exitId: "EX-E",
    instructions: "Staff verified east corridor.",
    verified: true,
  });
  assert.equal(s.approvedRoutes.length, 1);
  s = command(s, { type: "exit", id: "EX-E", status: "blocked" });
  assert.equal(s.approvedRoutes.length, 0);
});
test("personnel quota cannot undercut deployed resources; exhausted resources reject dispatch atomically", () => {
  let s = surge();
  s = command(s, { type: "resource", id: "volunteers", total: 118 });
  assert.throws(
    () => command(s, { type: "dispatch", id: s.incidents[0].id }),
    /Not enough/,
  );
  assert.equal(s.tasks.length, 0);
  assert.throws(
    () => command(s, { type: "resource", id: "volunteers", total: 100 }),
    /deployed/,
  );
});
