import { useMemo } from 'react';

const LINE_COLORS = ['#38bdf8', '#a78bfa', '#fbbf24', '#fb7185', '#34d399'];

// Grafana-style time-series chart: predicted gate load from T-3h → kickoff,
// with a dashed 90% capacity threshold. Top N gates by predicted peak.
export default function ForecastChart({ gates, height = 260, top = 4 }) {
  const W = 760;
  const H = 240;
  const PAD = { l: 38, r: 14, t: 14, b: 26 };

  const { sorted, maxY, xFor, slots } = useMemo(() => {
    const sorted = [...gates].sort((a, b) => b.peakPct - a.peakPct).slice(0, top);
    const peaks = sorted.map((g) => Math.max(...(g.slots ?? []).map((s) => s.loadPct)) * 1.06);
    const maxY = Math.max(100, ...peaks);
    const slots = sorted[0]?.slots ?? [];
    const xFor = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, slots.length - 1);
    return { sorted, maxY, xFor, slots };
  }, [gates, top]);

  const yFor = (pct) => H - PAD.b - (pct / maxY) * (H - PAD.t - PAD.b);

  if (!slots.length) return null;

  const xLabels = [0, Math.floor((slots.length - 1) / 2), slots.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Predicted gate load chart">
      {/* grid */}
      {[0, 25, 50, 75, 90, 100].map((p) =>
        p <= maxY ? (
          <g key={p}>
            <line
              x1={PAD.l}
              y1={yFor(p)}
              x2={W - PAD.r}
              y2={yFor(p)}
              stroke={p === 90 ? 'rgba(251,113,133,0.6)' : 'rgba(148,163,184,0.09)'}
              strokeWidth={p === 90 ? 1.2 : 1}
              strokeDasharray={p === 90 ? '5 4' : undefined}
            />
            <text x={PAD.l - 8} y={yFor(p) + 3.5} fontSize="10" fill={p === 90 ? '#fb7185' : '#64748b'} textAnchor="end" className="tabular">
              {p}%
            </text>
          </g>
        ) : null,
      )}

      {/* area + line per gate */}
      {sorted.map((g, gi) => {
        const pts = g.slots.map((s, i) => `${xFor(i)},${yFor(Math.min(maxY, s.loadPct))}`).join(' ');
        const area = `${PAD.l},${yFor(0)} ${pts} ${xFor(g.slots.length - 1)},${yFor(0)}`;
        const color = LINE_COLORS[gi % LINE_COLORS.length];
        const id = `area-${gi}`;
        return (
          <g key={g.id}>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#${id})`} />
            <polyline
              points={pts}
              fill="none"
              stroke={color}
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="draw-line"
              style={{ animationDelay: `${gi * 0.15}s` }}
            />
            <circle
              cx={xFor(g.slots.length - 1)}
              cy={yFor(Math.min(maxY, g.slots[g.slots.length - 1].loadPct))}
              r="3"
              fill={color}
            />
          </g>
        );
      })}

      {/* x labels */}
      {xLabels.map((i) => (
        <text key={i} x={xFor(i)} y={H - 8} fontSize="10" fill="#64748b" textAnchor={i === 0 ? 'start' : i === slots.length - 1 ? 'end' : 'middle'}>
          {slots[i].label}
        </text>
      ))}
    </svg>
  );
}

export function ChartLegend({ gates }) {
  const sorted = [...gates].sort((a, b) => b.peakPct - a.peakPct).slice(0, 4);
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {sorted.map((g, i) => (
        <span key={g.id} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <span className="h-1 w-4 rounded-full" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
          {g.name}
          <span className={g.flagged ? 'text-rose-400' : 'text-slate-300'}>· {g.peakPct}%</span>
        </span>
      ))}
    </div>
  );
}