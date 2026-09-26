import test from "node:test";
import assert from "node:assert/strict";
import gsapPackage from "gsap/dist/gsap.js";
import { createStadiumTimeline, stageAt, chapterProgress, scrollDestination } from "../lib/landing/timeline.mjs";

const { gsap } = gsapPackage;
const target = () => ({ scale: 1, xPercent: 0, yPercent: 0, y: 0, autoAlpha: 1 });
const makeTargets = () => ({
  layers: Array.from({ length: 5 }, target),
  badges: Array.from({ length: 5 }, target), intro: target(),
});
const snapshot = targets => JSON.parse(JSON.stringify(targets, (key, value) => key === "_gsap" ? undefined : value));

for (const compact of [false, true]) {
  test(`five-stage timeline reverses without stale transforms (compact=${compact})`, () => {
    const targets = makeTargets();
    const tl = createStadiumTimeline(gsap, targets, compact);
    try {
      assert.equal(tl.duration(), 1);
      const checkpoints = [0, 0.04, 0.19, 0.3, 0.39, 0.5, 0.59, 0.7, 0.79, 0.9, 1];
      const forward = checkpoints.map(p => { tl.progress(p); return snapshot(targets); });
      for (let i = checkpoints.length - 1; i >= 0; i--) {
        tl.progress(checkpoints[i]);
        assert.deepEqual(snapshot(targets), forward[i]);
      }
      assert.equal(targets.intro.autoAlpha, 1);
      assert.equal(targets.layers[0].autoAlpha, 1);
      assert.ok(targets.layers.slice(1).every(layer => layer.autoAlpha === 0));
    } finally { tl.kill(); }
  });
}

test("fast jumps produce the same final scene as gradual scrolling", () => {
  const stepped = makeTargets(), jumped = makeTargets();
  const a = createStadiumTimeline(gsap, stepped), b = createStadiumTimeline(gsap, jumped);
  try {
    for (let i = 0; i <= 100; i++) a.progress(i / 100);
    b.progress(1);
    assert.deepEqual(snapshot(jumped), snapshot(stepped));
    assert.equal(jumped.layers[4].autoAlpha, 1);
    assert.ok(jumped.layers.slice(0, 4).every(layer => layer.autoAlpha === 0));
  } finally { a.kill(); b.kill(); }
});

test("crossfades retain scene coverage and chapter buttons reach readable holds", () => {
  const targets = makeTargets();
  const tl = createStadiumTimeline(gsap, targets);
  try {
    for (let i = 0; i <= 1000; i++) {
      tl.progress(i / 1000);
      const coverage = targets.layers.reduce((sum, layer) => sum + layer.autoAlpha, 0);
      assert.ok(coverage >= 0.999, `blank transition at ${i / 1000}`);
    }
    chapterProgress.forEach((p, i) => {
      tl.progress(p);
      assert.equal(stageAt(p), i + 1);
      assert.equal(targets.layers[i].autoAlpha, 1);
      assert.equal(targets.badges[i].autoAlpha, 1);
    });
  } finally { tl.kill(); }
});

test("chapter destinations account for viewport height and track offset", () => {
  for (const viewport of [640, 768, 1080]) {
    const height = viewport * 6;
    chapterProgress.forEach(p => {
      const destination = scrollDestination(150, height, viewport, p);
      assert.ok(Math.abs((destination - 150) / (height - viewport) - p) < 1e-12);
    });
    assert.equal(scrollDestination(150, height, viewport, 1), 150 + height - viewport);
  }
  assert.equal(scrollDestination(150, 400, 800, 0.9), 150);
});
