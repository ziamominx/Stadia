'use client';

import React, { useState } from 'react';
import { Ticket, Users, CheckCircle2, Shield } from './Icons';

// Block visual configurations arranged circularly around DY Patil Stadium
const BLOCK_LAYOUT = [
  { name: 'A1', angle: -75, tier: 'VIP North', gate: 'Gate A', color: '#c25e3e' },
  { name: 'A2', angle: -45, tier: 'VIP North', gate: 'Gate B', color: '#c25e3e' },
  { name: 'B1', angle: -15, tier: 'East Grandstand', gate: 'Gate C', color: '#3b82f6' },
  { name: 'B2', angle: 15, tier: 'East Grandstand', gate: 'Gate C', color: '#3b82f6' },
  { name: 'C1', angle: 45, tier: 'South East', gate: 'Gate D', color: '#8b5cf6' },
  { name: 'C2', angle: 75, tier: 'South East', gate: 'Gate D', color: '#8b5cf6' },
  { name: 'D1', angle: 105, tier: 'South Stand', gate: 'Gate E', color: '#ec4899' },
  { name: 'D2', angle: 135, tier: 'South Stand', gate: 'Gate E', color: '#ec4899' },
  { name: 'F1', angle: 165, tier: 'West Lower', gate: 'Gate F', color: '#f59e0b' },
  { name: 'F2', angle: -165, tier: 'West Lower', gate: 'Gate F', color: '#f59e0b' },
  { name: 'E1', angle: -135, tier: 'West Upper', gate: 'Gate G', color: '#10b981' },
  { name: 'E2', angle: -105, tier: 'West Upper', gate: 'Gate H', color: '#10b981' },
];

export default function SeatMap({ blocks = [], selectedBlock, onSelectBlock, selectedSeat, onSelectSeat }) {
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [viewMode, setViewMode] = useState('stadium'); // 'stadium' | 'seats'

  // Map API block objects to layout
  const blockDataMap = {};
  blocks.forEach(b => {
    blockDataMap[b.block_name] = b;
  });

  const activeBlockObj = selectedBlock ? blockDataMap[selectedBlock] : null;

  // Generate interactive seat grid for selected block (Rows A-H, Seats 1-12)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 12;

  const isSeatSold = (seatCode) => {
    if (!activeBlockObj?.soldSeats) return false;
    return activeBlockObj.soldSeats.includes(seatCode);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* Stadium Visual Canvas */}
      <div className="relative flex-1 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-soft flex flex-col items-center transition-colors">
        
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
            <span className="text-[var(--text-primary)] font-bold uppercase">DY Patil Arena · 360° Seating</span>
          </div>

          <div className="flex rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1">
            <button
              onClick={() => setViewMode('stadium')}
              className={`px-3 py-1 rounded text-xs transition ${
                viewMode === 'stadium' ? 'bg-[var(--terracotta-primary)] text-white font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Block Overview
            </button>
            <button
              onClick={() => {
                if (selectedBlock) setViewMode('seats');
              }}
              disabled={!selectedBlock}
              className={`px-3 py-1 rounded text-xs transition ${
                viewMode === 'seats'
                  ? 'bg-[var(--terracotta-primary)] text-white font-bold'
                  : !selectedBlock
                  ? 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Seat Grid
            </button>
          </div>
        </div>

        {viewMode === 'stadium' ? (
          /* SVG Stadium View */
          <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center my-4">
            <svg viewBox="-220 -220 440 440" className="w-full h-full filter drop-shadow-md">
              <defs>
                {/* Stadium pitch gradient */}
                <radialGradient id="pitchGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#15803d" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#14532d" stopOpacity="0.95" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer track ring */}
              <circle cx="0" cy="0" r="200" fill="var(--bg-elevated)" stroke="var(--border-subtle)" strokeWidth="2" />
              <circle cx="0" cy="0" r="130" fill="var(--bg-surface)" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Football Pitch (Center) */}
              <rect x="-65" y="-95" width="130" height="190" rx="8" fill="url(#pitchGlow)" stroke="#22c55e" strokeWidth="1.5" />
              <line x1="-65" y1="0" x2="65" y2="0" stroke="#86efac" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="28" fill="none" stroke="#86efac" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="2" fill="#86efac" />
              {/* Penalty boxes */}
              <rect x="-35" y="-95" width="70" height="35" fill="none" stroke="#86efac" strokeWidth="1" />
              <rect x="-35" y="60" width="70" height="35" fill="none" stroke="#86efac" strokeWidth="1" />

              {/* Pitch Label */}
              <text x="0" y="-3" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                FIFA PITCH
              </text>

              {/* Circular Stadium Blocks */}
              {BLOCK_LAYOUT.map((b) => {
                const apiBlock = blockDataMap[b.name];
                const isSelected = selectedBlock === b.name;
                const isHovered = hoveredBlock === b.name;
                const rad = (b.angle * Math.PI) / 180;
                
                // Position of block wedge center
                const distance = 165;
                const x = Math.sin(rad) * distance;
                const y = -Math.cos(rad) * distance;

                const price = apiBlock?.price || 2500;

                return (
                  <g
                    key={b.name}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      onSelectBlock(b.name, apiBlock);
                      setViewMode('seats');
                    }}
                    onMouseEnter={() => setHoveredBlock(b.name)}
                    onMouseLeave={() => setHoveredBlock(null)}
                  >
                    {/* Block Wedge node */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 26 : isHovered ? 24 : 22}
                      fill={isSelected ? 'var(--terracotta-primary)' : isHovered ? 'var(--bg-elevated)' : 'var(--bg-surface)'}
                      stroke={isSelected ? 'var(--terracotta-hover)' : isHovered ? 'var(--terracotta-primary)' : 'var(--border-subtle)'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      filter={isSelected ? 'url(#glow)' : undefined}
                    />

                    {/* Block Name text */}
                    <text
                      x={x}
                      y={y - 1}
                      fill={isSelected ? '#ffffff' : 'var(--text-primary)'}
                      fontSize="11"
                      fontWeight="900"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {b.name}
                    </text>

                    {/* Price tag underneath */}
                    <text
                      x={x}
                      y={y + 11}
                      fill={isSelected ? '#ffffff' : 'var(--text-muted)'}
                      fontSize="7"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      ₹{price >= 1000 ? `${price / 1000}k` : price}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          /* Detailed Seat Grid View */
          <div className="w-full flex flex-col items-center py-2 animate-fadeIn">
            <div className="text-center mb-4">
              <span className="inline-block rounded-full bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] px-3 py-0.5 text-xs font-mono font-bold text-[var(--terracotta-text)] mb-1">
                BLOCK {selectedBlock} · ROW SELECTION
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                Facing pitch · Click an open seat to reserve
              </p>
            </div>

            {/* Stadium Pitch Direction Indicator */}
            <div className="w-full max-w-sm h-7 rounded-t-lg bg-emerald-700/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 mb-4 tracking-wider">
              ▲ STADIUM PITCH / FIELD VIEW ▲
            </div>

            {/* Seat Matrix */}
            <div className="space-y-2 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] max-h-[320px] overflow-y-auto">
              {rows.map((row) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-4 text-[11px] font-mono font-bold text-[var(--text-muted)] text-center">{row}</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: seatsPerRow }).map((_, idx) => {
                      const seatNum = idx + 1;
                      const seatCode = `${row}${seatNum}`;
                      const isSold = isSeatSold(seatCode);
                      const isChosen = selectedSeat === seatCode;

                      return (
                        <button
                          key={seatCode}
                          disabled={isSold}
                          onClick={() => onSelectSeat(seatCode)}
                          title={`Seat ${seatCode} ${isSold ? '(Occupied)' : '(Available)'}`}
                          className={`h-6 w-6 rounded text-[9px] font-mono font-bold transition-all duration-150 flex items-center justify-center ${
                            isSold
                              ? 'bg-[var(--border-subtle)]/40 text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                              : isChosen
                              ? 'bg-[var(--terracotta-primary)] text-white border border-[var(--terracotta-hover)] shadow-soft scale-110 font-extrabold'
                              : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--terracotta-primary)] hover:text-[var(--terracotta-primary)]'
                          }`}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Seat Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-[11px] font-mono text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[var(--terracotta-primary)]" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[var(--border-subtle)] opacity-60" />
                <span>Sold Out</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Information & Selection Sidebar */}
      <div className="w-full lg:w-80 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-soft space-y-4 transition-colors">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono border-b border-[var(--border-subtle)] pb-2">
          Block Intelligence
        </h3>

        {activeBlockObj ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-[var(--text-primary)] font-mono">
                  BLOCK {activeBlockObj.block_name}
                </span>
                <span className="text-xs text-[var(--text-muted)] block font-mono">
                  {BLOCK_LAYOUT.find(b => b.name === activeBlockObj.block_name)?.tier || 'Standard Tier'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[var(--terracotta-text)] font-mono">
                  ₹{activeBlockObj.price?.toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block font-mono">per seat · incl. tax</span>
              </div>
            </div>

            {/* Gate Assignment Recommendation */}
            <div className="rounded-lg border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--terracotta-text)]">
                <Shield className="w-3.5 h-3.5" />
                <span>OPTIMIZED CONCOURSE ACCESS</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Direct entry via <strong>{BLOCK_LAYOUT.find(b => b.name === activeBlockObj.block_name)?.gate || 'Gate A'}</strong>. Minimum congestion path.
              </p>
            </div>

            {/* Availability stats */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2.5">
                <span className="text-[var(--text-muted)] text-[10px] block">AVAILABLE</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {activeBlockObj.available ?? 240} seats
                </span>
              </div>
              <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2.5">
                <span className="text-[var(--text-muted)] text-[10px] block">OCCUPANCY</span>
                <span className="text-base font-bold text-[var(--text-primary)] font-mono">
                  {activeBlockObj.capacity ? Math.round((activeBlockObj.sold / activeBlockObj.capacity) * 100) : 65}%
                </span>
              </div>
            </div>

            {/* Selected Seat status */}
            <div className="border-t border-[var(--border-subtle)] pt-3">
              <span className="text-xs font-mono text-[var(--text-muted)] block mb-1">Selected Seat:</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-[var(--text-primary)] font-mono">
                  {selectedSeat ? `Block ${activeBlockObj.block_name} · Seat ${selectedSeat}` : 'No seat picked yet'}
                </span>
                {selectedSeat && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-[var(--text-muted)] text-xs font-mono space-y-2">
            <Ticket className="w-8 h-8 opacity-40 mx-auto" />
            <p>Click on any of the 12 stadium blocks on the pitch map to inspect availability and pick your seat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
