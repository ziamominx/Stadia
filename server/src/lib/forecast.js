// Capacity forecasting for the organizer dashboard.
//
// Model (deliberately simple, no ML needed for the demo):
//   predicted_load(gate, t) = tickets_assigned_to_gate * arrival_curve(t)
// where arrival_curve is a fixed per-slot distribution of when visitors
// reach the gate before kickoff: ~10% arrive more than 2h early, the bulk
// (50%) arrive in the 90-30 minute window, and ~30% arrive in the last half
// hour.

// Per-15-minute-slot arrival fraction, from T-3h (index 0) to kickoff.
const SLOT_FRACTIONS = [
  0.025, 0.025, 0.025, 0.025, // T-180..-120  → 10% early
  0.05, 0.05,                 // T-120..-90   → 10% ramp up
  0.125, 0.125,               // T-90..-60    → 25%
  0.125, 0.125,               // T-60..-30    → 25%  (50% in the 90-30 window)
  0.15, 0.15,                 // T-30..0      → 30% final rush
];

// Load % above which a predicted peak is flagged for pre-emptive action.
export const FORECAST_FLAG_PCT = 90;

function slotLabel(minutesBefore) {
  const h = Math.floor(minutesBefore / 60);
  const m = minutesBefore % 60;
  return m === 0 ? `T-${h}h` : `T-${h}h${m}m`;
}

// Full arrival curve as 15-minute slots from T-3h to kickoff.
export function arrivalSlots(assigned, capacity) {
  let cumulative = 0;
  return SLOT_FRACTIONS.map((fraction, i) => {
    cumulative += fraction;
    const minutesBefore = 180 - i * 15;
    const cumulativeCount = Math.round(assigned * cumulative);
    return {
      minutesBefore,
      label: slotLabel(minutesBefore),
      arrivals: Math.round(assigned * fraction),
      cumulative: cumulativeCount,
      loadPct: capacity ? Number(((cumulativeCount / capacity) * 100).toFixed(1)) : 0,
    };
  });
}

// Predicted peak for a gate: highest load reached and when.
export function gateForecastSummary(assigned, capacity) {
  const slots = arrivalSlots(assigned, capacity);
  const peak = slots.reduce((best, s) => (s.loadPct > best.loadPct ? s : best), slots[0]);
  return {
    peakMinutesBefore: peak.minutesBefore,
    peakLabel: peak.label,
    peakPct: peak.loadPct,
    flagged: peak.loadPct > FORECAST_FLAG_PCT,
    slots,
  };
}

// Fraction of a gate's visitors already present at `minutesBefore` kickoff.
// Used by the crowd-flow simulation to animate who is on each path segment.
export function arrivalFractionAt(minutesBefore) {
  const t = Math.max(0, Math.min(180, minutesBefore));
  if (t >= 180) return 0;
  if (t <= 0) return 1;
  let cumulative = 0;
  for (let i = 0; i < SLOT_FRACTIONS.length; i++) {
    const start = 180 - i * 15;
    if (start > t) cumulative += SLOT_FRACTIONS[i];
    else break;
  }
  return Number(cumulative.toFixed(4));
}