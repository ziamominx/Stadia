'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApi, api } from '../../lib/api.js';
import LoadBar, { StatusPill } from '../../components/LoadBar.jsx';
import { pct, inr } from '../../lib/format.js';
import { Activity, Shield, Hotel, Sliders, ArrowRight, CheckCircle, AlertTriangle, Bus } from '../../components/Icons.jsx';

export default function ExecutiveOrganizerPage() {
  const { data, loading, error, reload } = useApi(api.dashboard);
  const { data: ecosystem } = useApi(api.ecosystem);
  const [showCommercial, setShowCommercial] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-72 animate-pulse rounded-2xl bg-[#0e0e12]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-red-400">{error?.message || 'Failed to load executive dashboard'}</p>
        <button onClick={reload} className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-bold text-black">
          Retry
        </button>
      </div>
    );
  }

  const flaggedGates = data.gates?.filter((g) => g.status !== 'ok').length || 0;
  const flaggedParking = data.parking?.filter((p) => p.status !== 'ok').length || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Executive Organizer Suite · Tournament Director Console
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Event Health & Multi-Agency Status
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Real-time strategic oversight: venue capacity, cross-domain risk indexing, and operational agency health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/simulator"
            className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-[#121217] px-4 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            Launch Stress Simulator
          </Link>
          <Link
            href="/command-center"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition"
          >
            Tactical Map
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Macro Event Health Scorecard (Section 20 of Brief) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <span className="text-xs font-medium text-neutral-400">Venue Attendance</span>
          <div className="text-3xl font-black text-white">44,214 <span className="text-xs font-normal text-neutral-500">/ 55,000</span></div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-500">Capacity Filled:</span>
            <span className="font-mono font-bold text-emerald-400">80.4%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80.4%' }} />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <span className="text-xs font-medium text-neutral-400">Safety & Risk Index</span>
          <div className="text-3xl font-black text-emerald-400">94% <span className="text-xs font-bold text-emerald-300">NOMINAL</span></div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-500">Crowd Mixing Risk:</span>
            <span className="font-bold text-emerald-400">LOW (Deconflicted)</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <span className="text-xs font-medium text-neutral-400">Ingress Velocity</span>
          <div className="text-3xl font-black text-white">1,420 <span className="text-xs font-normal text-neutral-500">pax/min</span></div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-500">Avg Turnstile Wait:</span>
            <span className="font-mono font-bold text-emerald-400">8.2 mins</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <span className="text-xs font-medium text-neutral-400">Transport Network</span>
          <div className="text-3xl font-black text-white">72% <span className="text-xs font-bold text-neutral-400">FLOW</span></div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-500">Shuttle Fleet:</span>
            <span className="font-mono font-bold text-emerald-400">On Schedule</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
          </div>
        </div>
      </div>

      {/* Top 3 Strategic Operational Risks (Section 20 of Brief) */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
        <div className="border-b border-neutral-800/80 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Top Strategic Risks & Active Mitigations
            </h2>
            <p className="text-xs text-neutral-400">
              Live anomaly detection across stadium turnstiles, parking hubs, and mass transit corridors.
            </p>
          </div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            All Addressed
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-amber-500/30 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">Risk 01 · Parking Surge</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">Active Reroute</span>
            </div>
            <h4 className="text-sm font-bold text-white">P2 Sector 14 Lot at 88%</h4>
            <p className="text-xs text-neutral-400">
              Automated load-balancing engine has diverted incoming vehicles to P4 Palm Beach Road (48% capacity).
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Risk 02 · Turnstile Congestion</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Balanced</span>
            </div>
            <h4 className="text-sm font-bold text-white">Gate B Ingress Chokepoint</h4>
            <p className="text-xs text-neutral-400">
              Stadium Ops authorized 1,200 attendee diversion to Gate A. Turnstile wait dropped from 14m to 8m.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-700 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">Risk 03 · Rail Wave</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">Monitoring</span>
            </div>
            <h4 className="text-sm font-bold text-white">Harbour Line Peak Ingress</h4>
            <p className="text-xs text-neutral-400">
              Expected arrival surge of 12,000 fans between 18:30 and 19:15. Concourse stewards deployed.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Agency Operational Command Status (Section 14 of Brief) */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
        <div className="border-b border-neutral-800/80 pb-4">
          <h2 className="text-lg font-bold text-white">Multi-Agency Operations Coordination</h2>
          <p className="text-xs text-neutral-400">
            Real-time readiness status across cross-functional agency stakeholders.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> Stadium Operations
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-neutral-400">8 Gates active · 68 turnstile lanes operating nominal.</p>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">All Gates Online</div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Bus className="h-3.5 w-3.5 text-sky-400" /> Mobility Operations
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-neutral-400">4 Shuttle corridors · 9,200 parking bays orchestrated.</p>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Active Auto-Reroute</div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Shield className="h-3.5 w-3.5 text-indigo-400" /> Safety & Security
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-neutral-400">Perimeter clear · 0 safety incidents or breaches.</p>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Perimeter Secure</div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Activity className="h-3.5 w-3.5 text-rose-400" /> Medical & Emergency
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-neutral-400">14 First-aid concourses · 4 dedicated ambulances on standby.</p>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Ready & Standby</div>
          </div>
        </div>
      </div>

      {/* Secondary Section: Commercial Partnerships & Referral Telemetry (Section 21 of Brief) */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl">
        <button
          onClick={() => setShowCommercial(!showCommercial)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div>
            <h2 className="text-base font-bold text-white">
              Commercial & Hospitality Referral Analytics
            </h2>
            <p className="text-xs text-neutral-400">
              Hotel commissions, Airtel partnership signups, and hospitality merchant redemptions.
            </p>
          </div>
          <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition">
            {showCommercial ? 'Hide Details ▲' : 'Expand Commercial Analytics ▼'}
          </span>
        </button>

        {showCommercial && (
          <div className="mt-6 pt-6 border-t border-neutral-800 space-y-6 fade-up">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                <span className="text-xs text-neutral-400 font-medium">Hotel Commissions Earned</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{inr(data.revenue?.hotelCommission || 342000)}</div>
                <p className="text-[10px] text-neutral-500 mt-1">10–12% commission per verified partner booking</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                <span className="text-xs text-neutral-400 font-medium">Telecom Sponsor Revenue</span>
                <div className="text-2xl font-black text-white mt-1">{inr(data.revenue?.telecomCommission || 184500)}</div>
                <p className="text-[10px] text-neutral-500 mt-1">₹149/signup flat referral on Airtel 5G passes</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                <span className="text-xs text-neutral-400 font-medium">Total Partnership Revenue</span>
                <div className="text-2xl font-black text-white mt-1">
                  {inr((data.revenue?.hotelCommission || 342000) + (data.revenue?.telecomCommission || 184500))}
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">Directly attributed to matchday attendee journey</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
