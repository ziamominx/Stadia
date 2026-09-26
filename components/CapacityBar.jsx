'use client';

import React from 'react';

export default function CapacityBar({ 
  value = 0, 
  max = 100, 
  label = '', 
  sublabel = '', 
  showPercentage = true,
  size = 'md', // 'sm' | 'md' | 'lg'
  criticalThreshold = 85,
  warningThreshold = 70
}) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  // Status color evaluation
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-400';
  let glowColor = 'shadow-emerald-500/20';

  if (percentage >= criticalThreshold) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-400';
    glowColor = 'shadow-rose-500/30';
  } else if (percentage >= warningThreshold) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-400';
    glowColor = 'shadow-amber-500/20';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-mono">
          {label && <span className="text-[var(--text-primary)] font-medium">{label}</span>}
          <div className="flex items-center gap-2 ml-auto">
            {sublabel && <span className="text-[var(--text-muted)] text-[11px]">{sublabel}</span>}
            {showPercentage && (
              <span className={`font-bold ${textColor}`}>
                {percentage}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className={`relative w-full rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} shadow-sm relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer light pass */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
