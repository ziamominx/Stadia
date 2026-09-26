export const chapters = [
  { at: 0.10, name: "The venue", detail: "One city. Every arrival connected." },
  { at: 0.40, name: "Your seat", detail: "From the city skyline to row 18, seat 24." },
  { at: 0.55, name: "Your access", detail: "One credential for the complete journey." },
  { at: 0.80, name: "Your ride", detail: "Out of the stands. Onto the next connection." },
  { at: 1, name: "Your stay", detail: "The final arrival is part of the same journey." },
];

// Time, camera position, point of interest. All coordinates share the world
// used by the geometry; the stadium never rotates away from the camera.
export const flightKeys = [
  [0, [92, 66, 112], [0, 7, 0]],
  [0.10, [0, 58, 102], [0, 7, 0]],
  [0.18, [-60, 44, 57], [-5, 7, 0]],
  [0.26, [-14, 35, 10], [-23, 4.8, 0]],
  [0.33, [-18, 12, 5], [-27.5, 4.9, 0]],
  [0.40, [-24.8, 5.4, 0.9], [-27.5, 4.9, 0]],
  [0.47, [-24.8, 5.4, 0.9], [-27.5, 5.1, 0]],
  [0.54, [-21.2, 5.9, 0.9], [-25.4, 5.1, 0]],
  [0.56, [-21.2, 5.9, 0.9], [-25.4, 5.1, 0]],
  [0.61, [-19, 11, 3], [-28, 5, 0]],
  [0.65, [-19, 32, 6], [-42, 4, 0]],
  [0.68, [-48, 31, 35], [-55, 1.2, -2]],
  [0.70, [-56, 19, 28], [-56, 1.2, -2]],
  [0.75, [-54, 9, 16], [-60, 1, -5]],
  [0.80, [-76, 4.8, -5], [-84, 1, -13]],
  [0.85, [-101, 4.5, -14], [-111, 1, -22]],
  [0.89, [-119, 5, -17], [-131, 1, -25]],
  [1, [-108, 34, -3], [-150, 16, -45]],
];

export const clamp = value => Math.max(0, Math.min(1, value));
export const smoothstep = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
// Exact solution for a critically damped spring. Its velocity is carried
// between wheel events, so fast input and reversals do not snap the camera.
export function smoothScroll(current, target, velocity, dt) {
  const omega = 13;
  const step = Math.max(0, dt), difference = current - target;
  const decay = Math.exp(-omega * step);
  const next = target + (difference + (velocity + omega * difference) * step) * decay;
  const nextVelocity = (velocity - omega * (velocity + omega * difference) * step) * decay;
  if ((target - current) * (target - next) <= 0) return { progress: target, velocity: 0 };
  return { progress: next, velocity: nextVelocity };
}

// Cubic Hermite interpolation uses real key times. Tangents are zero at holds
// and endpoints, so close-ups stay still and the arrival eases to a stop.
export function sampleFlight(progress) {
  const p = clamp(progress);
  let i = 0;
  while (i < flightKeys.length - 2 && p > flightKeys[i + 1][0]) i++;
  const left = flightKeys[i], right = flightKeys[i + 1];
  const dt = right[0] - left[0], t = (p - left[0]) / dt;
  const tangent = (index, slot, axis) => {
    if (index === 0 || index === flightKeys.length - 1) return 0;
    const a = flightKeys[index - 1], b = flightKeys[index], c = flightKeys[index + 1];
    const before = b[slot][axis] - a[slot][axis];
    const after = c[slot][axis] - b[slot][axis];
    // Monotone tangents prevent overshoot into the roof or behind the seat.
    if (before * after <= 0) return 0;
    return 2 / ((b[0] - a[0]) / before + (c[0] - b[0]) / after);
  };
  const interpolate = slot => left[slot].map((value, axis) =>
    (2*t*t*t - 3*t*t + 1)*value + (t*t*t - 2*t*t + t)*dt*tangent(i, slot, axis)
    + (-2*t*t*t + 3*t*t)*right[slot][axis] + (t*t*t - t*t)*dt*tangent(i+1, slot, axis));
  return { position: interpolate(1), target: interpolate(2) };
}

export function sceneState(p) {
  const unfold = smoothstep((p - 0.47) / 0.06);
  const leave = smoothstep((p - 0.57) / 0.05);
  return {
    seatScale: Math.max(0.001, 1 - unfold),
    ticketScale: Math.max(0.001, unfold * (1 - leave)),
    ticketOpacity: unfold * (1 - leave),
    ticketOffset: unfold * 2.1,
    ticketLift: leave * 1.5,
    carProgress: smoothstep((p - 0.69) / 0.27),
  };
}
export function flightChapter(p) {
  return p < 0.33 ? 0 : p < 0.48 ? 1 : p < 0.64 ? 2 : p < 0.93 ? 3 : 4;
}
