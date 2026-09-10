'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp } from './Icons';

export default function KPICard({
  title,
  value,
  unit = '',
  format = 'number', // 'number' | 'percent' | 'currency' | 'text'
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  subtext,
  status = 'cyan', // 'cyan' | 'green' | 'amber' | 'rose'
  icon: Icon,
  className = ''
}) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);

  // Animated count-up for numbers
  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 900;
    const steps = 24;
    const stepDuration = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      // easeOutExpo
      const factor = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(value * factor);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  const formatNumber = (val) => {
    if (typeof val !== 'number') return val;
    if (format === 'percent') return `${val}%`;
    if (format === 'currency') return `₹${val.toLocaleString()}`;
    return val.toLocaleString();
  };

  const statusBorderClasses = {
    cyan: 'border-[var(--border-subtle)] hover:border-[var(--terracotta-primary)]',
    terracotta: 'border-[var(--terracotta-border)] hover:border-[var(--terracotta-primary)]',
    green: 'border-[var(--border-subtle)] hover:border-emerald-500',
    amber: 'border-[var(--border-subtle)] hover:border-amber-500',
    rose: 'border-[var(--border-subtle)] hover:border-rose-500',
  };

  const statusAccentGlow = {
    cyan: 'bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]',
    terracotta: 'bg-[var(--terracotta-tint)]',
    green: 'bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]',
    amber: 'bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]',
    rose: 'bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]',
  };

  const statusValueColor = {
    cyan: 'text-[var(--text-primary)] group-hover:text-[var(--terracotta-primary)]',
    terracotta: 'text-[var(--terracotta-text)]',
    green: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
  };

  return (
    <div className={`group relative rounded-xl border ${statusBorderClasses[status] || statusBorderClasses.cyan} bg-[var(--bg-surface)] p-4 sm:p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${statusAccentGlow[status] || ''} ${className}`}>
      
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
          {title}
        </span>
        {Icon && (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1.5 text-[var(--text-muted)] group-hover:text-[var(--terracotta-primary)] group-hover:border-[var(--terracotta-border)] transition-colors">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Main value display */}
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono transition-colors ${statusValueColor[status] || statusValueColor.cyan}`}>
          {formatNumber(displayValue)}
        </span>
        {unit && (
          <span className="text-xs font-mono text-[var(--text-muted)] font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Bottom metadata / trend */}
      {(trend || subtext) && (
        <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
          {trend && (
            <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${
              trendDirection === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trendDirection === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--text-muted)]'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trendDirection === 'down' ? 'rotate-180' : ''}`} />
              {trend}
            </span>
          )}
          {subtext && (
            <span className="text-[11px] text-[var(--text-muted)] font-mono ml-auto">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
