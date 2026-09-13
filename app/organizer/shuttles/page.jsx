'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApi, api } from '../../../lib/api.js';
import LoadBar, { StatusPill } from '../../../components/LoadBar.jsx';
import { kickoffDate, pct } from '../../../lib/format.js';
import { Bus, Train, MapPin, Activity, Shield, CheckCircle, AlertTriangle, ParkingSquare, Zap } from '../../../components/Icons.jsx';

const SLOTS = ['T-3h', 'T-2h', 'T-1h'];

export default function MobilityOpsPage() {
  const { data: shuttles, loading: loadingShuttles } = useApi(api.shuttles);
  const { data: parking, loading: loadingParking } = useApi(api.parking);
  const { data: matches } = useApi(api.matches);
  const { data: ecosystem } = useApi(api.ecosystem);
  const [matchId, setMatchId] = useState(null);

  if (loadingShuttles || loadingParking) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-72 animate-pulse rounded-2xl bg-[#0e0e12]" />
      </div>
    );
  }

  const activeMatch = matchId ?? matches?.[0]?.id;
  const filteredShuttles = (shuttles ?? []).filter((s) => s.match_id === activeMatch);
  const zones = [...new Set(filteredShuttles.map((s) => s.zone))];
  const byZone = {};
  for (const s of filteredShuttles) {
    const tag = `T-${s.departure_time.split('T-')[1]}`;
    (byZone[s.zone] ??= {})[tag] = s;
  }

  const parkingLots = parking ?? [];
  const transitCorridors = ecosystem?.transit ?? [
    { id: 1, name: 'Harbour Line Suburban Rail', mode: 'suburban_rail', capacity_per_hr: 24000, current_load_pct: 68, status: 'nominal', from_location: 'CSMT / Kurla', to_location: 'Nerul' },
    { id: 2, name: 'Navi Mumbai Metro Line 1', mode: 'metro', capacity_per_hr: 12000, current_load_pct: 54, status: 'nominal', from_location: 'Belapur Terminal', to_location: 'Pendhar' },
    { id: 3, name: 'Sion-Panvel Expressway (Corridor A)', mode: 'highway', capacity_per_hr: 8500, current_load_pct: 79, status: 'heavy', from_location: 'Vashi Toll', to_location: 'Nerul Flyover' },
    { id: 4, name: 'Palm Beach Road Park & Ride Feeder', mode: 'feeder', capacity_per_hr: 6000, current_load_pct: 42, status: 'optimal', from_location: 'Sanpada P&R', to_location: 'Gates A/B' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Mobility Operations Hub · External Arrival Network
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Transit & Fleet Dispatch
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Coordinating parking bay allocation, hotel-to-stadium express shuttles, and arterial corridor capacity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeMatch ?? ''}
            onChange={(e) => setMatchId(Number(e.target.value))}
            aria-label="Select match for mobility operations"
            className="rounded-xl border border-neutral-700 bg-[#121217] px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500"
          >
            {(matches ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {kickoffDate(m.kickoff_time)} · {m.home_team} vs {m.away_team}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cross-Domain Mobility Flow (Section 19 of Brief: People -> Transport -> Stadium) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5"><Train className="h-4 w-4 text-sky-400" /> Rail & Suburban Network</span>
            <span className="text-emerald-400 font-bold">Nominal Flow</span>
          </div>
          <div className="text-2xl font-black text-white">36,000 pax/hr</div>
          <p className="text-xs text-neutral-500">
            Harbour Line + Metro 1 feeding Nerul station concourse directly.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5"><ParkingSquare className="h-4 w-4 text-amber-400" /> Parking Ingress (P1–P5)</span>
            <span className="text-amber-400 font-bold">Auto-Diverting</span>
          </div>
          <div className="text-2xl font-black text-white">6,440 / 9,200 Bays</div>
          <p className="text-xs text-neutral-500">
            P2 saturated at 88% · Incoming vehicles auto-routed to P4 lot.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5"><Bus className="h-4 w-4 text-emerald-400" /> Outstation Shuttles</span>
            <span className="text-emerald-400 font-bold">Active Fleet</span>
          </div>
          <div className="text-2xl font-black text-white">8,190 Reserved</div>
          <p className="text-xs text-neutral-500">
            4 hubs operating with T-2h peak departure waves to East Gate C.
          </p>
        </div>
      </div>

      {/* Parking Zone Saturation Matrix & Auto-Reroute Engine */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Parking Zone Saturation Matrix (P1–P5)</h2>
            <p className="text-xs text-neutral-400">
              Live bay occupancy and automated load-balancing reroute logic for local drivers.
            </p>
          </div>
          <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            Auto-Diversion Engine Active
          </div>
        </div>

        {/* Dynamic Auto-Reroute Log */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-4 text-xs text-neutral-300 flex items-start gap-3">
          <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase text-[10px] tracking-wider">
              Automated Load-Aware Reroute Log
            </span>
            <p className="mt-0.5 text-neutral-300">
              <strong>P2 (Sector 14 Multi-Level)</strong> reached 88% capacity. System automatically bypassed P2 and reallocated incoming matchday passes to <strong>P4 (Palm Beach Road Lot — 48% full)</strong> with free express feeder shuttles to Gates A/B.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {parkingLots.map((p) => {
            const isCritical = p.load >= 0.85;
            const isWarning = p.load >= 0.75 && p.load < 0.85;
            return (
              <div key={p.id} className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{p.name.split('·')[0]}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isCritical ? 'SATURATED' : isWarning ? 'HEAVY' : 'OPTIMAL'}
                  </span>
                </div>
                <div>
                  <div className="text-xl font-black text-white font-mono">{pct(p.load)}</div>
                  <div className="text-[11px] text-neutral-500">{p.assigned} / {p.capacity} bays</div>
                </div>
                <LoadBar load={p.load} status={p.status} className="w-full" />
                <p className="text-[10px] text-neutral-400 truncate">{p.name.split('·')[1] || p.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outstation Shuttle Fleet Dispatch */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Outstation Hotel Express Shuttles</h2>
            <p className="text-xs text-neutral-400">
              Dedicated bus corridors connecting partner hotels to East Gate C without mixing with local traffic.
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-mono">T-2h Departure Slot Peak</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
                <th className="pb-3 pr-4 font-bold">Corridor Hub</th>
                {SLOTS.map((s) => (
                  <th key={s} className="pb-3 pr-4 font-bold">Departure Slot · {s}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70">
              {zones.map((zone) => (
                <tr key={zone} className="align-top hover:bg-neutral-900/30 transition">
                  <td className="py-4 pr-4">
                    <div className="font-bold text-white text-sm">{zone}</div>
                    <div className="text-[11px] text-neutral-500">Dedicated express route to Gate C</div>
                  </td>
                  {SLOTS.map((tag) => {
                    const s = byZone[zone]?.[tag];
                    if (!s) return <td key={tag} className="py-4 pr-4 text-neutral-600">—</td>;
                    return (
                      <td key={tag} className="py-4 pr-4">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="font-mono text-neutral-400">{s.departure_time}</span>
                          <span className="font-bold text-white font-mono">
                            {s.booked}/{s.capacity} · {pct(s.load)}
                          </span>
                        </div>
                        <LoadBar load={s.load} status={s.status} className="w-44" />
                        <div className="mt-1.5">
                          <StatusPill status={s.status} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arterial Road & Transit Corridor Health */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
        <div className="border-b border-neutral-800/80 pb-4">
          <h2 className="text-lg font-bold text-white">Arterial Highway & Transit Corridors</h2>
          <p className="text-xs text-neutral-400">
            Real-time telemetry across major highway approaches and suburban mass transit arteries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {transitCorridors.map((t) => (
            <div key={t.id} className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-300 capitalize">
                    {(t.mode || 'transit').replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t.from_location} → {t.to_location}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-bold text-white">{t.current_load_pct}% Load</div>
                <div className="text-[10px] text-neutral-500">{t.capacity_per_hr?.toLocaleString('en-IN')} pax/hr</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
