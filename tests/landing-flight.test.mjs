import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sampleFlight, flightKeys, smoothScroll, sceneState } from "../lib/landing/flight.mjs";
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

test("stadium exit clears roof and upper seating before descending", () => {
  for (let i = 0; i <= 1000; i++) {
    const p = 0.64 + i / 1000 * 0.14;
    const [x,y,z] = sampleFlight(p).position;
    const insideRoof = (x / 56) ** 2 + (z / 42) ** 2 < 1;
    const outsideOpening = (x / 35) ** 2 + (z / 21) ** 2 > 1;
    assert.ok(!(Math.abs(y - 22.8) < 0.2 && insideRoof && outsideOpening),
      `camera intersects roof at progress ${p}`);
    const insideUpperSeating = (x / 52.5) ** 2 + (z / 38) ** 2 < 1;
    assert.ok(!(y < 21 && insideUpperSeating),
      `camera descends into upper stands at progress ${p}`);
  }
});

test("camera spring is frame-rate independent and smooth through reversals", () => {
  const values = [30, 60, 120].map(fps => {
    let progress = 0, velocity = 0;
    for (let i = 0; i < fps; i++) ({ progress, velocity } = smoothScroll(progress, 1, velocity, 1 / fps));
    return { progress, velocity };
  });
  assert.ok(values.every(v => Math.abs(v.progress - values[0].progress) < 1e-12));
  assert.ok(values[0].progress > 0.999);
  let progress = 0, velocity = 0;
  for (let i = 0; i < 8; i++) ({ progress, velocity } = smoothScroll(progress, 1, velocity, 1 / 60));
  const before = velocity;
  ({ progress, velocity } = smoothScroll(progress, 0, velocity, 1 / 60));
  assert.ok(velocity > 0 && velocity < before, "camera eases out before reversing");
  for (let i = 0; i < 120; i++) ({ progress, velocity } = smoothScroll(progress, 0, velocity, 1 / 60));
  assert.ok(progress >= 0 && progress < 0.001, "camera settles without overshoot");
});

test("seat, ticket, and shuttle restore their exact state when reversing", () => {
  const forward = Array.from({ length: 101 }, (_, i) => sceneState(i / 100));
  for (let i = 100; i >= 0; i--) assert.deepEqual(sceneState(i / 100), forward[i]);
  assert.equal(sceneState(0).seatScale, 1);
  assert.ok(forward.every(state => state.seatScale === 1), "focal chair must never shrink");
  assert.equal(sceneState(0.55).ticketScale, 1);
  assert.equal(sceneState(1).ticketOpacity, 0);
  assert.equal(sceneState(1).carProgress, 1);
});

test("physical ticket is framed at desktop and mobile widths; scene resources dispose", () => {
  // Exercise texture and QR creation with a tiny 2D context; no browser launches.
  const originalDocument = globalThis.document;
  const context = Object.fromEntries(["fillRect","strokeRect","fillText","beginPath","moveTo","lineTo","stroke","setLineDash"]
    .map(method => [method, () => {}]));
  globalThis.document = { createElement: () => ({ getContext: () => context }) };
    const world = createJourneyWorld();
  try {
    world.ticketGroup.scale.setScalar(1);
    world.ticketGroup.position.x = world.seatOrigin.x + sceneState(0.55).ticketOffset;
    world.ticketGroup.position.y = world.seatOrigin.y + 0.9;
    world.scene.updateMatrixWorld(true);
    for(let i=47;i<=62;i++) {
      const state=sceneState(i/100);
      world.ticketGroup.scale.setScalar(state.ticketScale);
      world.ticketGroup.position.x=world.seatOrigin.x+state.ticketOffset;
      world.ticketGroup.position.y=world.seatOrigin.y+0.9+0.45*(1-state.ticketOffset/2.1)+state.ticketLift;
      world.scene.updateMatrixWorld(true);
      const ticketBounds=new THREE.Box3().setFromObject(world.ticketGroup);
      for(const neighbor of world.neighbors) assert.equal(ticketBounds.intersectsBox(new THREE.Box3().setFromObject(neighbor)),false,
        `credential must clear adjacent seats at progress ${i/100}`);
    }
    world.ticketGroup.scale.setScalar(1);
    world.ticketGroup.position.set(world.seatOrigin.x+2.1,world.seatOrigin.y+0.9,world.seatOrigin.z);
    world.scene.updateMatrixWorld(true);
    const stop=world.roadCurve.getPointAt(1);
    const direction=world.roadCurve.getTangentAt(1);
    world.carGroup.position.copy(stop);
    world.carGroup.rotation.y=Math.atan2(direction.z,-direction.x);
    world.scene.updateMatrixWorld(true);
    assert.ok(new THREE.Box3().setFromObject(world.carGroup).min.z > -24.8,
      "sports car must stop outside the hotel's front canopy");
    assert.ok(world.stadium.userData.seatCount > 8000, "all tier rows must be populated");
    assert.equal(world.wheels.length, 4);
    let drawCalls = 0;
    world.scene.traverse(object => { if(object.isMesh || object.isLine) drawCalls++; });
    assert.ok(drawCalls < 220, `static model batching regressed: ${drawCalls} drawables`);
    const pose = sampleFlight(0.55);
    const ray = new THREE.Raycaster(new THREE.Vector3(...pose.position),
      new THREE.Vector3(...pose.target).sub(new THREE.Vector3(...pose.position)).normalize());
    const opaqueMeshes = [];
    world.scene.traverse(object => { if(object.isMesh) opaqueMeshes.push(object); });
    const hit = ray.intersectObjects(opaqueMeshes, false)[0];
    assert.equal(hit?.object, world.ticketPlane, "ticket face must not be occluded by geometry");
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
