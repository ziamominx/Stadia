// Stadium-only layout graphic for the "Two corridors. One stadium." section.
// A themed, schematic bowl of DY Patil Stadium: eight gates (A–H) ring the
// stands, color-coded by visitor corridor — Local (North/West, cyan) vs
// Outstation (East/South, rose). Pure SVG, no map tiles: always crisp, always
// shows JUST the stadium.
const CX = 280;
const CY = 280;

// Gate positions on the stand ring (r=172), compass-named like the app data.
const polar = (deg, r) => {
  const t = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(t), y: CY - r * Math.cos(t) };
};

const GATES = [
  { key: 'A', side: 'local', deg: 0, compass: 'NORTH' },
  { key: 'B', side: 'local', deg: 45, compass: 'NORTH-EAST' },
  { key: 'C', side: 'outstation', deg: 90, compass: 'EAST' },
  { key: 'D', side: 'outstation', deg: 135, compass: 'SOUTH-EAST' },
  { key: 'E', side: 'outstation', deg: 180, compass: 'SOUTH' },
  { key: 'F', side: 'outstation', deg: 225, compass: 'SOUTH-WEST' },
  { key: 'G', side: 'local', deg: 270, compass: 'WEST' },
  { key: 'H', side: 'local', deg: 315, compass: 'NORTH-WEST' },
];

const COLORS = {
  local: { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.16)' },
  outstation: { stroke: '#fb7185', fill: 'rgba(251, 113, 133, 0.16)' },
};

// Stand divider ticks every 22.5° between inner (142) and outer (205) radius.
const DIVIDERS = Array.from({ length: 16 }, (_, i) => i * 22.5).map((deg) => ({
  a: polar(deg, 142),
  b: polar(deg, 205),
}));

export default function StadiumLayout() {
  return (
    <div className="panel bg-grid relative overflow-hidden rounded-2xl p-5 shadow-2xl shadow-black/40">
      {/* Panel header */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Stadium layout</p>
          <p className="mt-0.5 text-[11px] font-bold text-white">DY Patil Stadium · Nerul</p>
        </div>
        <span className="chip border-cyber-400/40 bg-cyber-400/10 text-cyber-300">
          <span className="live-dot" /> Gates A–H
        </span>
      </div>

      <svg viewBox="0 0 560 560" className="relative z-10 mt-2 w-full" role="img" aria-label="DY Patil Stadium layout with eight gates split into local and outstation corridors">
        <defs>
          {/* Corridor label arcs */}
          <path id="arc-local" d="M 52 280 A 228 228 0 0 1 508 280" fill="none" />
          <path id="arc-outstation" d="M 52 284 A 228 228 0 0 0 508 284" fill="none" />
          <radialGradient id="pitch-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.14)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </radialGradient>
        </defs>

        {/* Dashed stadium boundary */}
        <circle cx={CX} cy={CY} r="242" fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5" strokeDasharray="7 8" />

        {/* Corridor nameplates, curved like a real stadium map */}
        <text fontSize="15" fontWeight="800" letterSpacing="3.5" fill="#7dd3fc">
          <textPath href="#arc-local" startOffset="50%" textAnchor="middle">LOCAL · NORTH / WEST</textPath>
        </text>
        <text fontSize="15" fontWeight="800" letterSpacing="3.5" fill="#fda4af">
          <textPath href="#arc-outstation" startOffset="50%" textAnchor="middle">OUTSTATION · EAST / SOUTH</textPath>
        </text>

        {/* Stand bowl: top half = local corridor wash, bottom half = outstation */}
        <path d="M 75 280 A 205 205 0 0 1 485 280 L 422 280 A 142 142 0 0 0 142 280 Z" fill={COLORS.local.fill} stroke={COLORS.local.stroke} strokeWidth="1.5" strokeOpacity="0.55" />
        <path d="M 485 280 A 205 205 0 0 1 75 280 L 142 280 A 142 142 0 0 0 422 280 Z" fill={COLORS.outstation.fill} stroke={COLORS.outstation.stroke} strokeWidth="1.5" strokeOpacity="0.55" />

        {/* Stand dividers */}
        {DIVIDERS.map((d, i) => (
          <line key={i} x1={d.a.x} y1={d.a.y} x2={d.b.x} y2={d.b.y} stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
        ))}

        {/* Concourse ring */}
        <circle cx={CX} cy={CY} r="142" fill="#0a101d" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />

        {/* Pitch glow + grass */}
        <circle cx={CX} cy={CY} r="120" fill="url(#pitch-glow)" />
        <rect x={CX - 75} y={CY - 58} width="150" height="116" rx="8" fill="rgba(16,185,129,0.22)" stroke="rgba(52,211,153,0.65)" strokeWidth="1.5" />
        <line x1={CX} y1={CY - 58} x2={CX} y2={CY + 58} stroke="rgba(52,211,153,0.5)" strokeWidth="1.2" />
        <circle cx={CX} cy={CY} r="22" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="1.2" />
        {/* Penalty boxes */}
        <rect x={CX - 75} y={CY - 26} width="26" height="52" fill="none" stroke="rgba(52,211,153,0.45)" strokeWidth="1.2" />
        <rect x={CX + 49} y={CY - 26} width="26" height="52" fill="none" stroke="rgba(52,211,153,0.45)" strokeWidth="1.2" />

        {/* Approach arrows into the two corridors */}
        <g stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 96 120 L 132 156" />
          <path d="M 132 156 L 120 154 M 132 156 L 130 144" />
        </g>
        <g stroke="#fb7185" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 464 440 L 428 404" />
          <path d="M 428 404 L 440 406 M 428 404 L 430 416" />
        </g>
        <text x="84" y="106" fontSize="11" fontWeight="700" fill="#7dd3fc" textAnchor="end">Parking + Rail</text>
        <text x="476" y="458" fontSize="11" fontWeight="700" fill="#fda4af" textAnchor="start">Shuttle drop</text>

        {/* Gates */}
        {GATES.map((g) => {
          const p = polar(g.deg, 172);
          const c = COLORS[g.side];
          const lbl = polar(g.deg, 258);
          return (
            <g key={g.key}>
              <circle cx={p.x} cy={p.y} r="14" fill="#0d1424" stroke={c.stroke} strokeWidth="2.5" />
              <text x={p.x} y={p.y + 4} fontSize="12" fontWeight="800" fill="#f1f5fb" textAnchor="middle">{g.key}</text>
              {g.deg % 90 === 0 && (
                <text x={lbl.x} y={lbl.y + (g.deg === 180 ? 14 : -4)} fontSize="10" fontWeight="800" letterSpacing="2" fill="#94a3b8" textAnchor="middle">{g.compass}</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyber-400/40 bg-cyber-400/10 px-2.5 py-1 text-cyber-300">
          <span className="h-2 w-2 rounded-full bg-cyber-400" /> Local · A B G H
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-400/10 px-2.5 py-1 text-rose-300">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Outstation · C D E F
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-emerald-300">
          <span className="h-2 w-2 rounded-sm bg-emerald-400/70" /> Pitch
        </span>
      </div>
    </div>
  );
}
