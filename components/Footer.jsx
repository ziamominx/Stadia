'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--border-subtle)]">
          
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--terracotta-primary)] font-extrabold text-white text-xs">
                S
              </div>
              <span className="text-base font-black tracking-wider text-[var(--text-primary)] font-mono">
                STADIA
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Intelligent Hospitality &amp; Crowd Orchestration Mesh for major sporting tournaments. One ticket. Every journey. Zero chaos.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--terracotta-text)] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
              <span>TERRACOTTA MESH ONLINE · 38,214 VISITORS</span>
            </div>
          </div>

          {/* Col 2: Fan Experience */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">Fan Experience</h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)] font-medium">
              <li><Link href="/matches" className="hover:text-[var(--terracotta-primary)] transition">FIFA Match Schedule</Link></li>
              <li><Link href="/matches" className="hover:text-[var(--terracotta-primary)] transition">Interactive Stadium Seating</Link></li>
              <li><Link href="/hospitality" className="hover:text-[var(--terracotta-primary)] transition">Official Hotels &amp; Lodging</Link></li>
              <li><Link href="/tourism" className="hover:text-[var(--terracotta-primary)] transition">Navi Mumbai City Guide</Link></li>
            </ul>
          </div>

          {/* Col 3: Operations Command */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">Operations Command</h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)] font-medium">
              <li><Link href="/command-center" className="hover:text-[var(--terracotta-primary)] transition">Live Operational Overview</Link></li>
              <li><Link href="/crowd-flow" className="hover:text-[var(--terracotta-primary)] transition">Mixing-Point Deconfliction Map</Link></li>
              <li><Link href="/command-center" className="hover:text-[var(--terracotta-primary)] transition">Predictive Gate Surge Radar</Link></li>
              <li><Link href="/command-center" className="hover:text-[var(--terracotta-primary)] transition">Peripheral Lodging Absorption</Link></li>
            </ul>
          </div>

          {/* Col 4: Data & Agency Telemetry */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">Connected Telemetry</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2">
                <div className="text-[var(--text-muted)] font-semibold">TICKETING</div>
                <div className="text-[var(--text-primary)] font-bold mt-0.5">FIFA TMS · 99.8%</div>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2">
                <div className="text-[var(--text-muted)] font-semibold">TRANSIT</div>
                <div className="text-[var(--text-primary)] font-bold mt-0.5">MMRDA METRO · LIVE</div>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2">
                <div className="text-[var(--text-muted)] font-semibold">GATES</div>
                <div className="text-[var(--text-primary)] font-bold mt-0.5">8 MONITORED</div>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2">
                <div className="text-[var(--text-muted)] font-semibold">HOTELS</div>
                <div className="text-[var(--text-primary)] font-bold mt-0.5">12 INTEGRATED</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div>
            &copy; 2026 STADIA Technologies · FIFA Women&apos;s World Cup 2026 Official Orchestration Mesh.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-[var(--text-muted)]">
            <span>DY PATIL STADIUM</span>
            <span>·</span>
            <span>NAVI MUMBAI, INDIA</span>
            <span>·</span>
            <span className="text-[var(--terracotta-text)] font-bold">LAT 19.0330° N, 73.0297° E</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
