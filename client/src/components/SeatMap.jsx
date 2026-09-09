const CX = 320;
const CY = 270;
const R_OUT = 230;
const R_IN = 148;

const TIER_COLORS = [
  { min: 4000, fill: '#f59e0b', label: '₹4,000+ · Pitchside', chip: 'bg-amber-500' },
  { min: 3000, fill: '#10b981', label: '₹3,000+ · Premium', chip: 'bg-emerald-500' },
  { min: 2400, fill: '#0ea5e9', label: '₹2,400+ · Grandstand', chip: 'bg-sky-500' },
  { min: 2000, fill: '#6366f1', label: '₹2,000+ · Upper West', chip: 'bg-indigo-500' },
  { min: 0, fill: '#64748b', label: '₹1,200+ · Upper East', chip: 'bg-slate-500' },
];

function tierOf(price) {
  return TIER_COLORS.find((t) => price >= t.min) ?? TIER_COLORS[TIER_COLORS.length - 1];
}

// Gates match the real lat/lng layout: local on North/West, outstation on East/South.
const GATE_DOTS = [
  { letter: 'A', angle: -90, side: 'local' },
  { letter: 'B', angle: -45, side: 'local' },
  { letter: 'C', angle: 0, side: 'outstation' },
  { letter: 'D', angle: 45, side: 'outstation' },
  { letter: 'E', angle: 90, side: 'outstation' },
  { letter: 'F', angle: 135, side: 'outstation' },
  { letter: 'G', angle: 180, side: 'local' },
  { letter: 'H', angle: -135, side: 'local' },
];

function polar(r, deg) {
  const t = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(t), CY + r * Math.sin(t)];
}

function slicePath(deg0, deg1) {
  const [x0, y0] = polar(R_OUT, deg0);
  const [x1, y1] = polar(R_OUT, deg1);
  const [x2, y2] = polar(R_IN, deg1);
  const [x3, y3] = polar(R_IN, deg0);
  return `M ${x0} ${y0} A ${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L ${x2} ${y2} A ${R_IN} ${R_IN} 0 0 0 ${x3} ${y3} Z`;
}

export default function SeatMap({ blocks, selectedId, onSelect }) {
  const step = 360 / 12;

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-navy-900/60 p-4">
      <svg viewBox="0 0 640 540" className="w-full" role="img" aria-label="Stadium seat map">
        {/* pitch */}
        <ellipse cx={CX} cy={CY} rx={110} ry={62} fill="#17803c" stroke="#0b1424" strokeWidth={2} />
        <ellipse cx={CX} cy={CY} rx={110} ry={62} fill="none" stroke="#ffffff22" strokeWidth={1} />
        <line x1={CX - 110} y1={CY} x2={CX + 110} y2={CY} stroke="#ffffff22" strokeWidth={1} />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffffcc">
          DY PATIL STADIUM · NERUL
        </text>

        {/* seat blocks (12 slices) */}
        {blocks.map((b, i) => {
          const a0 = -90 + i * step;
          const a1 = a0 + step;
          const tier = tierOf(b.price);
          const soldOut = b.available <= 0;
          const selected = selectedId === b.id;
          const fill = soldOut ? '#334155' : tier.fill;
          const [lx, ly] = polar((R_IN + R_OUT) / 2, a0 + step / 2);
          return (
            <g
              key={b.id}
              onClick={() => !soldOut && onSelect(b)}
              className={soldOut ? 'cursor-not-allowed' : 'cursor-pointer'}
            >
              <path
                d={slicePath(a0, a1)}
                fill={fill}
                fillOpacity={soldOut ? 0.25 : 0.82}
                stroke={selected ? '#fbbf24' : '#0b1424'}
                strokeWidth={selected ? 3 : 1.5}
              />
              <g pointerEvents="none">
                <text
                  x={lx}
                  y={ly - 4}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="800"
                  fill="#ffffff"
                >
                  {b.block_name}
                </text>
                <text x={lx} y={ly + 10} textAnchor="middle" fontSize="9" fontWeight="600" fill="#ffffffcc">
                  {soldOut ? 'SOLD OUT' : `₹${b.price.toLocaleString('en-IN')}`}
                </text>
              </g>
            </g>
          );
        })}

        {/* gates */}
        {GATE_DOTS.map((g) => {
          const [x, y] = polar(R_OUT + 16, g.angle);
          const [lx, ly] = polar(R_OUT + 34, g.angle);
          const color = g.side === 'local' ? '#38bdf8' : '#fb7185';
          return (
            <g key={g.letter}>
              <circle cx={x} cy={y} r={6} fill={color} stroke="#0b1424" strokeWidth={2} />
              <text x={lx} y={ly + 3} textAnchor="middle" fontSize="10" fontWeight="800" fill={color}>
                {g.letter}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-800 pt-3">
        {TIER_COLORS.map((t) => (
          <span key={t.label} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className={`h-2.5 w-2.5 rounded-sm ${t.chip}`} /> {t.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Local gate (N/W)
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Outstation gate (E/S)
        </span>
      </div>
    </div>
  );
}