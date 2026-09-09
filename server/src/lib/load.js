// Predicted load = (tickets_assigned / capacity) plus a small deterministic
// "arrival wave" factor so the dashboard breathes during the demo without any
// real sensor data.
export function predictedLoad(tickets, capacity, seedId) {
  if (!capacity) return 0;
  const base = tickets / capacity;
  const t = Date.now() / 60000;
  const wave = 0.07 * Math.sin((t + seedId * 2.3) % (2 * Math.PI));
  return Math.min(1, Math.max(0, base + wave));
}

export function loadStatus(load) {
  if (load >= 0.95) return 'critical';
  if (load >= 0.8) return 'approaching_capacity';
  return 'ok';
}