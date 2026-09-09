'use client';

import React from 'react';
import CapacityBar from './CapacityBar';
import { Clock, Users, ShieldAlert, ArrowRight } from './Icons';

export default function GateCard({ gate, onRerouteClick }) {
  if (!gate) return null;

  const load = gate.load !== undefined ? gate.load : (gate.current / gate.capacity);
  const percentage = Math.round(load * 100);

  let statusConfig = {
    badge: 'NORMAL FLOW',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    waitTime: gate.wait_minutes || Math.max(Math.round(load * 8), 2),
    cardBorder: 'border-[var(--border-subtle)] hover:border-emerald-500/50'
  };

  if (percentage >= 85) {
    statusConfig = {
      badge: 'SURGE CRITICAL',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/40 animate-pulse',
      waitTime: gate.wait_minutes || Math.round(load * 22),
      cardBorder: 'border-rose-500/50 bg-rose-500/5'
    };
  } else if (percentage >= 70) {
    statusConfig = {
      badge: 'HIGH DENSITY',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      waitTime: gate.wait_minutes || Math.round(load * 14),
      cardBorder: 'border-amber-500/40 bg-amber-500/5'
    };
  }

  return (
    <div className={`rounded-xl border ${statusConfig.cardBorder} bg-[var(--bg-surface)] p-4 shadow-soft transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-black font-mono text-[var(--terracotta-text)]">
            {gate.gate_id || gate.name?.replace('Gate ', '') || 'A'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono">
              {gate.name || `Gate ${gate.gate_id}`}
            </h4>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {gate.sector || 'Main Concourse'}
            </span>
          </div>
        </div>

        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold ${statusConfig.badgeClass}`}>
          {statusConfig.badge}
        </span>
      </div>

      {/* Capacity Bar */}
      <div className="my-3">
        <CapacityBar 
          value={percentage} 
          max={100}
          showPercentage={true}
          size="sm"
        />
        <div className="mt-1.5 flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
          <span>{gate.current?.toLocaleString() || Math.round(gate.capacity * (percentage / 100))} checked in</span>
          <span className="text-[var(--text-muted)]">Cap: {gate.capacity?.toLocaleString() || '5,000'} / hr</span>
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>Wait: <strong className="text-[var(--text-primary)]">{statusConfig.waitTime} min</strong></span>
        </div>

        {percentage >= 75 ? (
          <button
            onClick={() => onRerouteClick && onRerouteClick(gate)}
            className="flex items-center gap-1 rounded bg-rose-500/15 hover:bg-rose-500/25 px-2 py-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 transition"
          >
            <span>Auto-Reroute</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <span className="text-[10px] text-[var(--text-muted)]">
            {gate.turnstiles || '12/12'} Turnstiles
          </span>
        )}
      </div>
    </div>
  );
}
