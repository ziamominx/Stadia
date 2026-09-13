// components/StadiumLayout.jsx — Themed schematic bowl of DY Patil Stadium (Nerul, Navi Mumbai)
// Gates A–H ring the stands, color-coded by visitor corridor: Local (North/West) vs Outstation (East/South).
'use client';

import React from 'react';

const CX = 280;
const CY = 280;

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

const DIVIDERS = Array.from({ length: 16 }, (_, i) => i * 22.5).map((deg) => ({
  a: polar(deg, 142),
  b: polar(deg, 205),
}));

export default function StadiumLayout() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-2xl backdrop-blur-md">
      {/* Panel header */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 font-mono">Stadium Layout Schematic</p>
          <p className="mt-0.5 text-xs font-bold text-white">DY Patil Stadium · Nerul, Navi Mumbai</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Gates A–H
        </span>
      </div>

      <svg viewBox="0 0 560 560" className="relative z-10 mt-3 w-full max-w-[480px] mx-auto" role="img" aria-label="DY Patil Stadium layout with eight gates split into local and outstation corridors">
        <defs>
          <path id="arc-local" d="M 52 280 A 228 228 0 0 1 508 280" fill="none" />
          <path id="arc-outstation" d="M 52 284 A 228 228 0 0 0 508 284" fill="none" />
          <radialGradient id="pitch-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </radialGradient>
        </defs>

        {/* Outer boundary */}
        <circle cx={CX} cy={CY} r="242" fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" strokeDasharray="6 6" />

        {/* Corridor Arcs */}
        <text fontSize="14" fontWeight="800" letterSpacing="3" fill="#38bdf8">
          <textPath href="#arc-local" startOffset="50%" textAnchor="middle">LOCAL CORRIDOR · NORTH / WEST</textPath>
        </text>
        <text fontSize="14" fontWeight="800" letterSpacing="3" fill="#fb7185">
          <textPath href="#arc-outstation" startOffset="50%" textAnchor="middle">OUTSTATION CORRIDOR · EAST / SOUTH</textPath>
        </text>

        {/* Stand Bowl */}
        <path d="M 75 280 A 205 205 0 0 1 485 280 L 422 280 A 142 142 0 0 0 142 280 Z" fill={COLORS.local.fill} stroke={COLORS.local.stroke} strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M 485 280 A 205 205 0 0 1 75 280 L 142 280 A 142 142 0 0 0 422 280 Z" fill={COLORS.outstation.fill} stroke={COLORS.outstation.stroke} strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Dividers */}
        {DIVIDERS.map((d, i) => (
          <line key={i} x1={d.a.x} y1={d.a.y} x2={d.b.x} y2={d.b.y} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
        ))}

        {/* Concourse */}
        <circle cx={CX} cy={CY} r="142" fill="#0b111e" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5" />

        {/* Football Pitch */}
        <circle cx={CX} cy={CY} r="120" fill="url(#pitch-glow)" />
        <rect x={CX - 75} y={CY - 58} width="150" height="116" rx="6" fill="rgba(16,185,129,0.2)" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" />
        <line x1={CX} y1={CY - 58} x2={CX} y2={CY + 58} stroke="rgba(52,211,153,0.5)" strokeWidth="1.2" />
        <circle cx={CX} cy={CY} r="22" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="1.2" />
        <rect x={CX - 75} y={CY - 26} width="26" height="52" fill="none" stroke="rgba(52,211,153,0.4)" strokeWidth="1.2" />
        <rect x={CX + 49} y={CY - 26} width="26" height="52" fill="none" stroke="rgba(52,211,153,0.4)" strokeWidth="1.2" />

        {/* Entry Approach Indicators */}
        <g stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 96 120 L 132 156" />
          <path d="M 132 156 L 120 154 M 132 156 L 130 144" />
        </g>
        <g stroke="#fb7185" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 464 440 L 428 404" />
          <path d="M 428 404 L 440 406 M 428 404 L 430 416" />
        </g>
        <text x="84" y="106" fontSize="11" fontWeight="700" fill="#38bdf8" textAnchor="end">Local Rail & Parking</text>
        <text x="476" y="458" fontSize="11" fontWeight="700" fill="#fb7185" textAnchor="start">Airport & Shuttles</text>

        {/* Gate Badges */}
        {GATES.map((g) => {
          const p = polar(g.deg, 172);
          const c = COLORS[g.side];
          const lbl = polar(g.deg, 258);
          return (
            <g key={g.key}>
              <circle cx={p.x} cy={p.y} r="14" fill="#0f172a" stroke={c.stroke} strokeWidth="2.5" />
              <text x={p.x} y={p.y + 4} fontSize="12" fontWeight="800" fill="#f8fafc" textAnchor="middle">{g.key}</text>
              {g.deg % 90 === 0 && (
                <text x={lbl.x} y={lbl.y + (g.deg === 180 ? 14 : -4)} fontSize="10" fontWeight="800" letterSpacing="1.5" fill="#94a3b8" textAnchor="middle">{g.compass}</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-sky-300">
          <span className="h-2 w-2 rounded-full bg-sky-400" /> Local: Gates A, B, G, H
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-rose-300">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Outstation: Gates C, D, E, F
        </span>
      </div>
    </div>
  );
}
