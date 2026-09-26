import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sampleFlight, flightKeys, damp, sceneState } from "../lib/landing/flight.mjs";
import { createJourneyWorld } from "../lib/landing/journey-world.mjs";

test("camera passes through every timed waypoint with continuous velocity", () => {
  for (const [time, position, target] of flightKeys) {
    const pose = sampleFlight(time);
    for (let axis = 0; axis < 3; axis++) {
      assert.ok(Math.abs(pose.position[axis] - position[axis]) < 1e-8);
      assert.ok(Math.abs(pose.target[axis] - target[axis]) < 1e-8);
      if (time > 0 && time < 1) {
        const h = 1e-7;
        const before = (pose.position[axis] - sampleFlight(time - h).position[axis]) / h;
        const after = (sampleFlight(time + h).position[axis] - pose.position[axis]) / h;
        assert.ok(Math.abs(after - before) < 0.02, `velocity jump at ${time}`);
      }
    }
  }
});

test("flight remains finite, above ground, and never loses its look direction", () => {
  for (let i = 0; i <= 2000; i++) {
    const pose = sampleFlight(i / 2000);
    assert.ok([...pose.position, ...pose.target].every(Number.isFinite));
    assert.ok(pose.position[1] > 4);
    assert.ok(new THREE.Vector3(...pose.position).distanceTo(new THREE.Vector3(...pose.target)) > 2);
  }
});

test("scroll damping has the same settling time at 30, 60, and 120 Hz", () => {
  const values = [30, 60, 120].map(fps => {
    let value = 0;
    for (let i = 0; i < fps; i++) value = damp(value, 1, 1 / fps);
    return value;
  });
  assert.ok(values.every(v => Math.abs(v - values[0]) < 1e-12));
  assert.ok(values[0] > 0.998);
});

test("seat, ticket, and shuttle restore their exact state when reversing", () => {
  const forward = Array.from({ length: 101 }, (_, i) => sceneState(i / 100));
  for (let i = 100; i >= 0; i--) assert.deepEqual(sceneState(i / 100), forward[i]);
  assert.equal(sceneState(0).seatScale, 1);
  assert.equal(sceneState(0.55).ticketScale, 1);
  assert.equal(sceneState(1).ticketOpacity, 0);
  assert.equal(sceneState(1).carProgress, 1);
});

test("physical ticket is framed at desktop and mobile widths; scene resources dispose", () => {
  // Geometry-only test: texture drawing is unnecessary, no browser is launched.
  const originalDocument = globalThis.document;
  globalThis.document = { createElement: () => ({ getContext: () => null }) };
  const world = createJourneyWorld();
  try {
    world.ticketGroup.scale.setScalar(1);
    world.scene.updateMatrixWorld(true);
    const pose = sampleFlight(0.55);
    for (const [width, height] of [[320, 700], [768, 1024], [1024, 768], [1440, 900]]) {
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.05, 650);
      const target = new THREE.Vector3(...pose.target);
      camera.position.fromArray(pose.position).sub(target)
        .multiplyScalar(Math.max(1, 1.2 / camera.aspect)).add(target);
      camera.lookAt(target);
      camera.updateMatrixWorld(true);
      for (const x of [-1.8, 1.8]) for (const y of [-1.05, 1.05]) {
        const projected = world.ticketGroup.localToWorld(new THREE.Vector3(x, y, 0)).project(camera);
        assert.ok(Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1,
          `ticket clipped at ${width}x${height}`);
      }
    }
    const resources = new Set();
    world.scene.traverse(object => {
      if (object.geometry) resources.add(object.geometry);
      [object.material].flat().filter(Boolean).forEach(material => {
        resources.add(material);
        if (material.map) resources.add(material.map);
      });
    });
    let disposed = 0;
    resources.forEach(resource => resource.addEventListener("dispose", () => disposed++));
    world.dispose();
    assert.equal(disposed, resources.size);
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
});
