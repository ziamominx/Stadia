'use client';

import React, { useState, useEffect } from 'react';
import { Layers } from '../../components/Icons';

export default function CapacityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ecosystem')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 space-y-6">
        <div className="h-10 w-72 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-[var(--bg-elevated)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { zones, metrics } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8 fade-in">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--terracotta-primary)]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
            Regional Saturation &amp; Demand Absorption
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Capacity &amp; Zone Telemetry
        </h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
          Real-time room occupancy, dynamic surge pricing multipliers, and multimodal transit feeder connectivity across 5 destination zones.
        </p>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-muted)] font-medium">Total Regional Inventory</span>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
            {metrics.totalRoomsTracked.toLocaleString('en-IN')} rooms
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-mono">Across 5 monitored MMR districts</p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-muted)] font-medium">Core Stadium Saturation</span>
          <div className="text-2xl font-bold tracking-tight text-[var(--terracotta-primary)] font-mono">
            95% Booked
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-mono">Nerul stadium immediate perimeter</p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-muted)] font-medium">Peripheral Absorption Buffer</span>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
            11,700 Available
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-mono">Kharghar, Belapur, Panvel hubs</p>
        </div>
      </div>

      {/* Zone-by-Zone Detailed Telemetry Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {zones.map(z => {
          const isCritical = z.status === 'critical';
          const isRecommended = z.is_overflow_recommended === 1;

          return (
            <div
              key={z.id}
              className={`card-hover rounded-2xl border p-5 space-y-4 shadow-sm ${
                isCritical
                  ? 'border-rose-500/30 bg-[var(--bg-surface)]'
                  : isRecommended
                    ? 'border-[var(--terracotta-primary)]/50 bg-[var(--terracotta-soft)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">{z.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : isRecommended
                          ? 'bg-[var(--terracotta-primary)] text-white'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                    }`}>
                      {isCritical ? 'SATURATED CORE' : isRecommended ? 'TARGET OVERFLOW BUFFER' : 'BALANCED'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight mt-1">{z.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{z.transit_link_desc}</p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-[var(--text-primary)]">{z.occupancy_pct}%</div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">OCCUPANCY</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] mb-1">
                  <span>{z.booked_rooms.toLocaleString('en-IN')} booked</span>
                  <span>{(z.total_rooms - z.booked_rooms).toLocaleString('en-IN')} available</span>
                </div>
                <div className="w-full bg-[var(--bg-elevated)] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      z.occupancy_pct > 85 ? 'bg-[var(--terracotta-primary)]' : 'bg-neutral-400'
                    }`}
                    style={{ width: `${z.occupancy_pct}%` }}
                  />
                </div>
              </div>

              {/* Pricing & Surge Telemetry */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-subtle)] text-xs font-mono">
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">AVERAGE ROOM RATE</span>
                  <div className="font-semibold text-[var(--text-primary)] mt-0.5">₹{z.avg_rate.toLocaleString('en-IN')} / night</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">DYNAMIC SURGE MULTIPLIER</span>
                  <div className={`font-semibold mt-0.5 ${z.surge_multiplier > 1.3 ? 'text-[var(--terracotta-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {z.surge_multiplier}x
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
