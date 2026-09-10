import { inr } from '../lib/format.js';

const CX = 320;
const CY = 270;
const R_OUT = 230;
const R_IN = 148;

const TIER_COLORS = [
  { min: 4000, fill: '#fbbf24', label: '₹4,000+ · Pitchside', chip: 'bg-amber-400' },
  { min: 3000, fill: '#a78bfa', label: '₹3,000+ · Premium', chip: 'bg-violet-400' },
  { min: 2400, fill: '#22d3ee', label: '₹2,400+ · Grandstand', chip: 'bg-cyan-400' },
  { min: 2000, fill: '#38bdf8', label: '₹2,000+ · Upper West', chip: 'bg-sky-400' },
  { min: 0, fill: '#64748b', label: '₹1,200+ · Upper East', chip: 'bg-slate-400' },
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
    <div className="panel relative overflow-hidden rounded-2xl p-4 sm:p-6">
      <div className="absolute -top-24 left-1/2 h-64 w-[480px] -translate-x-1/2 rounded-full bg-cyber-500/10 blur-3xl" />
      <svg viewBox="0 0 640 540" className="relative w-full" role="img" aria-label="Stadium seat map">
        <defs>
          <radialGradient id="pitch-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#12b256" />
            <stop offset="85%" stopColor="#0a7a3a" />
            <stop offset="100%" stopColor="#07552a" />
          </radialGradient>
        </defs>

        {/* pitch */}
        <ellipse cx={CX} cy={CY} rx={112} ry={64} fill="url(#pitch-glow)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
        <line x1={CX - 112} y1={CY} x2={CX + 112} y2={CY} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r="3.5" fill="rgba(255,255,255,0.5)" />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize="11" fontWeight="800" fill="rgba(255,255,255,0.82)" letterSpacing="2.5">
          DY PATIL STADIUM · NERUL
        </text>

        {/* seat blocks (12 slices) */}
        {blocks.map((b, i) => {
          const a0 = -90 + i * step;
          const a1 = a0 + step;
          const tier = tierOf(b.price);
          const soldOut = b.available <= 0;
          const selected = selectedId === b.id;
          const fill = soldOut ? '#1b2436' : tier.fill;
          const [lx, ly] = polar((R_IN + R_OUT) / 2, a0 + step / 2);
          return (
            <g
              key={b.id}
              onClick={() => !soldOut && onSelect(b)}
              className={soldOut ? 'cursor-not-allowed' : 'cursor-pointer'}
              style={{ transition: 'transform 0.2s ease' }}
            >
              <title>
                {`Block ${b.block_name} · ${inr(b.price)} · ${b.available} seats left${soldOut ? ' · SOLD OUT' : ''}`}
              </title>
              <path
                d={slicePath(a0, a1)}
                fill={fill}
                fillOpacity={soldOut ? 0.18 : selected ? 0.95 : 0.62}
                stroke={selected ? '#7dd3fc' : '#030509'}
                strokeWidth={selected ? 3 : 1.4}
                style={selected ? { filter: 'drop-shadow(0 0 10px rgba(125,211,252,0.75))' } : undefined}
              />
              <g pointerEvents="none">
                <text x={lx} y={ly - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#ffffff">
                  {b.block_name}
                </text>
                <text x={lx} y={ly + 10} textAnchor="middle" fontSize="9" fontWeight="700" fill={soldOut ? '#64748b' : 'rgba(255,255,255,0.85)'}>
                  {soldOut ? 'SOLD OUT' : inr(b.price)}
                </text>
              </g>
            </g>
          );
        })}

        {/* gates */}
        {GATE_DOTS.map((g) => {
          const [x, y] = polar(R_OUT + 16, g.angle);
          const [lx, ly] = polar(R_OUT + 35, g.angle);
          const color = g.side === 'local' ? '#38bdf8' : '#fb7185';
          return (
            <g key={g.letter}>
              <circle cx={x} cy={y} r={6.5} fill={color} stroke="#030509" strokeWidth="2">
                <animate attributeName="opacity" values="1;0.6;1" dur="2.6s" repeatCount="indefinite" />
              </circle>
              <text x={lx} y={ly + 3} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={color}>
                {g.letter}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/[0.07] pt-3.5">
        {TIER_COLORS.map((t) => (
          <span key={t.label} className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400">
            <span className={`h-2.5 w-2.5 rounded-sm ${t.chip}`} /> {t.label}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Local gate · N/W
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Outstation gate · E/S
        </span>
      </div>
    </div>
  );
}