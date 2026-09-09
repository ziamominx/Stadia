import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--terracotta-primary)] text-white font-mono text-[10px] font-semibold">
            NX
          </div>
          <div>
            <span className="font-semibold text-[var(--text-primary)] tracking-tight">NEXUS COMMAND CENTER</span>
            <p className="text-[11px] text-[var(--text-muted)]">Cross-Agency Hospitality &amp; Capacity Orchestration Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-medium text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--text-primary)] transition">Command Center</Link>
          <Link href="/simulator" className="hover:text-[var(--text-primary)] transition">Stress Simulator</Link>
          <Link href="/integrations" className="hover:text-[var(--text-primary)] transition">Agency Connectors</Link>
          <Link href="/capacity" className="hover:text-[var(--text-primary)] transition">Zone Telemetry</Link>
        </div>

        <div className="text-right text-[11px] text-[var(--text-muted)] font-mono">
          <span>ALL TICKETING DELEGATED TO LICENSED AGENTS</span> · 2026
        </div>
      </div>
    </footer>
  );
}
