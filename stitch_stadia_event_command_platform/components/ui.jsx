'use client';

// components/ui.jsx — Warm Editorial primitives: metric stats, micro labels,
// status chips, section headers, flow gauges. Zero-radius, hairline discipline.

import React, { useEffect, useRef, useState } from 'react';

/* Motion helpers — editorial entrance wrappers ------------------------ */

export function Rise({ children, delay = 0, className = '', as: Tag = 'div' }) {
  return <Tag className={`ops-rise ${className}`} style={{ '--stagger': `${delay}ms` }}>{children}</Tag>;
}

/* CountUp — glides a number to its new value each poll instead of snapping */
export function CountUp({ value, decimals = 0, className = '', suffix = '' }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const from = Number(prevRef.current) || 0;
    const to = Number(value) || 0;
    prevRef.current = value;
    if (from === to) return undefined;
    const dur = 700;
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={`tnum ${className}`}>{Number(display).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

export function MicroLabel({ children, className = '' }) {
  return <span className={`uppercase tracking-widest text-[10px] font-semibold ${className}`}>{children}</span>;
}

export function Metric({ value, unit, tone = 'ink', className = '' }) {
  const toneCls = tone === 'critical' ? 'text-critical' : tone === 'caution' ? 'text-caution-deep' : tone === 'signal' ? 'text-signal-deep' : 'text-ink';
  return (
    <div className={`flex items-baseline gap-1.5 ${className}`}>
      <span className={`text-[44px] leading-[48px] tracking-[-0.04em] font-light tnum ${toneCls}`}>
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </span>
      {unit && <span className="font-mono text-[12px] text-outline-variant">{unit}</span>}
    </div>
  );
}

const CHIP = {
  NORMAL:    { border: 'var(--color-hairline)', text: 'text-signal-deep', dot: 'bg-signal', tint: 'var(--color-signal-tint)' },
  ATTENTION: { border: '#925b00', text: 'text-caution-deep', dot: 'bg-caution', tint: 'var(--color-caution-tint)' },
  CRITICAL:  { border: '#bc2029', text: 'text-critical-deep', dot: 'bg-critical', tint: 'var(--color-critical-tint)' },
};

export function StatusChip({ status, label }) {
  const c = CHIP[status] || CHIP.NORMAL;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5"
      style={{ border: `1px solid ${c.border}`, background: c.tint }}>
      <span className={`h-1 w-1 rounded-full ${c.dot}`} />
      <span className={`uppercase tracking-wider text-[10px] font-semibold ${c.text}`}>{label || status}</span>
    </span>
  );
}

export function SectionHead({ title, tag, right }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 hairline-b bg-sc-lowest">
      <div className="flex items-center gap-2">
        <MicroLabel className="text-ink">{title}</MicroLabel>
        {tag && <span className="font-mono text-[10px] text-ink-muted uppercase">{tag}</span>}
      </div>
      {right}
    </div>
  );
}

export function FlowBar({ pct, warn = 75, crit = 85 }) {
  const color = pct >= crit ? 'var(--color-critical)' : pct >= warn ? 'var(--color-caution)' : 'var(--color-signal)';
  return (
    <div className="w-full" style={{ height: 2, background: 'var(--color-hairline)' }}>
      <div style={{ height: 2, width: `${Math.min(100, pct)}%`, background: color, transition: 'width .6s ease' }} />
    </div>
  );
}

/* hc002 stability progress: 5px rail, currentColor fill */
export function StabilityProgress({ pct, tone = 'signal' }) {
  return (
    <div style={{ height: 5, background: 'var(--color-sc-high)', color: `var(--color-${tone})` }}>
      <div style={{ height: 5, width: `${Math.min(100, Math.max(0, pct))}%`, background: 'currentColor', transition: 'width .4s' }} />
    </div>
  );
}

/* hc002 empty state: oversized green glyph + reassurance copy */
export function EmptyState({ symbol = '✓', title, note }) {
  return (
    <div className="px-8 py-10 text-center">
      <span className="block text-[32px] text-signal leading-none mb-2.5" aria-hidden>{symbol}</span>
      <h3 className="text-[17px] font-semibold" style={{ letterSpacing: 0 }}>{title}</h3>
      {note && <p className="text-[12px] text-ink-muted mt-2.5 max-w-[440px] mx-auto leading-[1.6]">{note}</p>}
    </div>
  );
}

export function GhostButton({ children, onClick, className = '', disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`h-8 px-3 uppercase tracking-wider text-[10px] font-semibold bg-transparent text-ink transition-colors hover:bg-canvas-recessed disabled:opacity-40 ${className}`}
      style={{ border: '1px solid var(--color-hairline)' }}>
      {children}
    </button>
  );
}

/* hc002 toast: ink slab, green check, fixed bottom-right */
export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="ops-toast fixed bottom-6 right-6 z-100 flex items-center gap-3.5 px-5 py-3.5 text-[12px] text-white"
      style={{ background: 'var(--color-ink)', boxShadow: '0 4px 20px rgba(0,0,0,.15)' }} role="status">
      <span className="text-signal-deep" style={{ color: '#9eddac' }}>✓</span>
      <span>{message}</span>
      <button onClick={onClose} className="text-white text-[18px] leading-none px-1" aria-label="Dismiss">×</button>
    </div>
  );
}

export function SolidButton({ children, onClick, className = '', disabled, tone = 'ink' }) {
  const styles = tone === 'danger'
    ? { border: '1px solid var(--color-critical)', color: 'var(--color-critical-deep)', background: '#fff' }
    : {};
  return (
    <button onClick={onClick} disabled={disabled} style={styles}
      className={`h-8 px-3 uppercase tracking-wider text-[10px] font-semibold transition-colors disabled:opacity-40 ${
        tone === 'danger' ? 'hover:bg-critical hover:text-white' : 'bg-ink text-canvas hover:bg-action-hover'} ${className}`}>
      {children}
    </button>
  );
}
