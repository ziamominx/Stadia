'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Activity, Shield, Building, Train, AlertCircle, RefreshCw, ArrowRight, Server, Layers } from '../components/Icons';
import TacticalConsole from '../components/TacticalConsole';
import CompetitorBenchmark from '../components/CompetitorBenchmark';

// Dynamically import OperationsMap with SSR disabled to prevent Leaflet window errors
const OperationsMap = dynamic(() => import('../components/OperationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] animate-pulse flex items-center justify-center text-xs font-mono text-[var(--text-muted)]">
      INITIALIZING GEOSPATIAL TELEMETRY ENGINE...
    </div>
  ),
});

export default function CommandCenterPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLayers, setActiveLayers] = useState({
    hotels: true,
    gates: true,
  });

  const fetchEcosystem = async () => {
    try {
      const res = await fetch('/api/ecosystem');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load ecosystem data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEcosystem();
    const interval = setInterval(fetchEcosystem, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 space-y-6">
        <div className="h-10 w-72 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[var(--bg-elevated)] animate-pulse" />
          ))}
        </div>
        <div className="h-[480px] rounded-2xl bg-[var(--bg-elevated)] animate-pulse" />
      </div>
    );
  }

  const { zones, transit, gates, agencyConnectors, metrics, activeScenario } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8 fade-in">
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
              Cross-Agency Orchestration Mesh · Live Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Operations Command Center
          </h1>
          <p className="text-xs text-[var(--text-secondary)] max-w-xl">
            Consolidated situational intelligence coordinating municipal transit, external ticketing channels, and regional hotel inventories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-right shadow-sm">
            <div className="text-[9px] font-mono uppercase text-[var(--text-muted)]">Active Scenario</div>
            <div className="text-xs font-mono font-semibold text-[var(--terracotta-primary)] capitalize">
              {activeScenario.replace('_', ' ')}
            </div>
          </div>
          <button
            onClick={fetchEcosystem}
            className="btn-press flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--terracotta-primary)] shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[var(--terracotta-primary)]" />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Hotel Saturation */}
        <div className="card-hover rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-medium">Hotel Saturation</span>
            <Building className="h-4 w-4 text-[var(--terracotta-primary)]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
            {metrics.avgHotelSaturation}%
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            {metrics.totalRoomsBooked.toLocaleString('en-IN')} / {metrics.totalRoomsTracked.toLocaleString('en-IN')} rooms
          </div>
          <div className="w-full bg-[var(--bg-elevated)] rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${metrics.avgHotelSaturation > 85 ? 'bg-[var(--terracotta-primary)]' : 'bg-neutral-400'}`}
              style={{ width: `${metrics.avgHotelSaturation}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Transit Network Load */}
        <div className="card-hover rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-medium">Transit Network Load</span>
            <Train className="h-4 w-4 text-[var(--terracotta-primary)]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
            {metrics.avgTransitLoad}%
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            5 corridors synchronized
          </div>
          <div className="w-full bg-[var(--bg-elevated)] rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${metrics.avgTransitLoad > 80 ? 'bg-[var(--terracotta-primary)]' : 'bg-neutral-400'}`}
              style={{ width: `${metrics.avgTransitLoad}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Perimeter Gate Status */}
        <div className="card-hover rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-medium">Perimeter Turnstiles</span>
            <Shield className="h-4 w-4 text-[var(--terracotta-primary)]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
            {metrics.flaggedGatesCount} / {gates.length}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            Gates at load threshold
          </div>
          <div className="flex gap-1 mt-1">
            {gates.map(g => (
              <span
                key={g.id}
                className={`h-1.5 flex-1 rounded-full ${
                  g.status === 'critical'
                    ? 'bg-rose-500'
                    : g.status === 'warning'
                      ? 'bg-[var(--terracotta-primary)]'
                      : 'bg-[var(--bg-elevated)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Metric 4: Orchestration Stability */}
        <div className="card-hover rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-medium">Orchestration Stability</span>
            <Activity className="h-4 w-4 text-[var(--terracotta-primary)]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
            {metrics.ecosystemHealthScore} / 100
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            Cross-agency sync nominal
          </div>
          <div className="w-full bg-[var(--bg-elevated)] rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="h-full bg-[var(--terracotta-primary)] rounded-full"
              style={{ width: `${metrics.ecosystemHealthScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Operations Split: Geospatial Twin + Tactical Dispatch */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Geospatial Digital Twin */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--terracotta-primary)]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Geospatial Operations Twin
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleLayer('hotels')}
                className={`btn-press rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeLayers.hotels
                    ? 'bg-[var(--terracotta-primary)] text-white shadow-sm'
                    : 'border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Accommodation Zones
              </button>
              <button
                onClick={() => toggleLayer('gates')}
                className={`btn-press rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeLayers.gates
                    ? 'bg-[var(--terracotta-primary)] text-white shadow-sm'
                    : 'border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Perimeter Turnstiles
              </button>
            </div>
          </div>

          <OperationsMap
            zones={zones}
            gates={gates}
            activeLayers={activeLayers}
          />
        </div>

        {/* Tactical Directive Console & Alerts */}
        <div className="space-y-6">
          <TacticalConsole onActionDispatched={fetchEcosystem} />

          {/* Saturated Sector Watch */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
              <AlertCircle className="h-3.5 w-3.5 text-[var(--terracotta-primary)]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Sector Saturation Watch
              </h3>
            </div>

            <div className="space-y-2">
              {zones.filter(z => z.occupancy_pct >= 85).map(z => (
                <div key={z.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-[var(--text-primary)]">
                    <span>{z.name}</span>
                    <span className="font-mono text-[var(--terracotta-primary)]">{z.occupancy_pct}% full</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">{z.transit_link_desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multimodal Arterial Corridors & Third-Party Agency Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Multimodal Transit Table */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Multimodal Transit Corridors</h3>
              <p className="text-xs text-[var(--text-muted)]">Live passenger throughput and operational strain indices.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider font-mono text-[10px]">
                  <th className="pb-2.5 pr-4">Corridor</th>
                  <th className="pb-2.5 pr-4">Mode</th>
                  <th className="pb-2.5 pr-4">Capacity / Hr</th>
                  <th className="pb-2.5 pr-4">Throughput Load</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {transit.map(t => (
                  <tr key={t.id} className="hover:bg-[var(--bg-elevated)]/60 transition">
                    <td className="py-2.5 pr-4 font-medium text-[var(--text-primary)]">{t.name}</td>
                    <td className="py-2.5 pr-4 font-mono text-[var(--text-muted)] capitalize">{t.mode.replace('_', ' ')}</td>
                    <td className="py-2.5 pr-4 text-[var(--text-muted)] font-mono">{t.capacity_per_hr.toLocaleString('en-IN')} pax</td>
                    <td className="py-2.5 pr-4 font-mono font-medium text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        <span>{t.current_load_pct}%</span>
                        <div className="w-20 bg-[var(--bg-elevated)] rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${t.current_load_pct > 80 ? 'bg-[var(--terracotta-primary)]' : 'bg-neutral-400'}`}
                            style={{ width: `${t.current_load_pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono uppercase text-[10px]">
                      <span className={`px-2 py-0.5 rounded border ${
                        t.status === 'chokepoint' || t.status === 'disrupted'
                          ? 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                          : t.status === 'heavy'
                            ? 'border-[var(--terracotta-primary)]/40 text-[var(--terracotta-primary)] bg-[var(--terracotta-soft)]'
                            : 'border-[var(--border-subtle)] text-[var(--text-secondary)] bg-[var(--bg-elevated)]'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Third-Party Connector Stream */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[var(--terracotta-primary)]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Agency Ingestion Bridge
              </h3>
            </div>
            <Link href="/integrations" className="text-[10px] font-mono text-[var(--terracotta-primary)] hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {agencyConnectors.map(conn => (
              <div key={conn.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)] tracking-tight">{conn.name}</span>
                  <span className="text-[10px] font-mono text-[var(--terracotta-primary)] uppercase">{conn.status}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono pt-1">
                  <span>Synced: {conn.lastIngestion}</span>
                  <span>Latency: {conn.latencyMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor Benchmark & Strategic Differentiation */}
      <CompetitorBenchmark />
    </div>
  );
}
