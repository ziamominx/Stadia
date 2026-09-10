'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import KPICard from '../../components/KPICard';
import GateCard from '../../components/GateCard';
import ForecastChart from '../../components/ForecastChart';
import CapacityBar from '../../components/CapacityBar';
import { 
  Shield, 
  Activity, 
  Users, 
  Car, 
  Hotel, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  ChevronRight,
  Zap,
  ArrowRight,
  Layers,
  MapPin,
  Bus
} from '../../components/Icons';

export default function CommandOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [gateForecast, setGateForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeEgressWave, setActiveEgressWave] = useState(1);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [overRes, gateRes] = await Promise.all([
        fetch('/api/dashboard/overview').catch(() => null),
        fetch('/api/dashboard/gates/forecast-summary').catch(() => null)
      ]);

      if (overRes && overRes.ok) {
        const oData = await overRes.json();
        setOverview(oData);
      }
      if (gateRes && gateRes.ok) {
        const gData = await gateRes.json();
        setGateForecast(gData);
      }
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalTickets = overview?.tickets || 38214;
  const gates = overview?.gates || [];
  const parkingZones = overview?.parking || [
    { name: 'Zone P1 · North VIP', capacity: 600, occupied: 460, load: 0.76 },
    { name: 'Zone P2 · West Lot', capacity: 1200, occupied: 940, load: 0.78 },
    { name: 'Zone P3 · East Deck', capacity: 1600, occupied: 1408, load: 0.88, rerouted: true },
    { name: 'Zone P4 · South Lot', capacity: 1800, occupied: 1080, load: 0.60, absorbing: true },
    { name: 'Zone P5 · Seawoods Overflow', capacity: 1400, occupied: 560, load: 0.40 },
  ];

  const shuttles = overview?.shuttles || [];
  const revenue = overview?.revenue || {
    hotel: { count: 2743, total: 6257250 },
    airtel_tv: { count: 10739, total: 1600111 },
    grand_total: 7857361
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8 space-y-8 pb-20">
        
        {/* Top Command Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--terracotta-primary)] animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--terracotta-text)]">
                OPERATIONAL COMMAND MESH · DY PATIL ARENA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-mono tracking-tight">
              Real-Time Ingress &amp; Crowd Orchestration
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[var(--terracotta-primary)]' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Poll 10s'}</span>
            </button>

            <Link
              href="/crowd-flow"
              className="flex items-center gap-1.5 rounded-lg bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-4 py-2 text-xs font-mono font-bold text-white shadow-soft transition active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>Crowd Flow Map</span>
            </Link>
          </div>
        </div>

        {/* ─── EXECUTIVE KPI STRIP (Terracotta Count-Up) ─── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="TOTAL INGRESS"
            value={totalTickets}
            unit="fans"
            trend="+14.2%"
            trendDirection="up"
            status="terracotta"
            icon={Users}
          />
          <KPICard
            title="STADIUM LOAD"
            value={72}
            format="percent"
            subtext="Cap: 55,000"
            status="green"
            icon={Activity}
          />
          <KPICard
            title="SURGE RADAR"
            value="GATE F"
            format="text"
            trend="91.3% Peak"
            trendDirection="down"
            status="rose"
            icon={AlertCircle}
          />
          <KPICard
            title="PARKING LOAD"
            value={81}
            format="percent"
            subtext="5,600 / 6,600"
            status="amber"
            icon={Car}
          />
          <KPICard
            title="PARTNER REVENUE"
            value={revenue.grand_total}
            format="currency"
            trend="12 Hotels"
            trendDirection="up"
            status="green"
            icon={Hotel}
          />
          <KPICard
            title="SHUTTLE CONVOYS"
            value={108}
            unit="trips"
            subtext="Zero delays"
            status="cyan"
            icon={Bus}
          />
        </div>

        {/* ─── PREDICTIVE FORECAST & PERIPHERAL ABSORPTION ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 8 Cols: Predictive Surge Forecast */}
          <div className="lg:col-span-8">
            <ForecastChart />
          </div>

          {/* Right 4 Cols: Peripheral Lodging Absorption Feature */}
          <div className="lg:col-span-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-[var(--terracotta-primary)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
                    Peripheral Lodging Absorption
                  </h3>
                </div>
                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  ACTIVE
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans mb-4">
                Core Nerul stadium hotels hit <strong>94% occupancy</strong>. Automated incentive routing absorbed <strong>2,743 outstation spectators</strong> into Tier-2 peripheral hotels in Belapur &amp; Vashi.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--text-secondary)]">Core Zone Saturated (Nerul)</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">94% Max</span>
                  </div>
                  <CapacityBar value={94} max={100} showPercentage={false} size="sm" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--text-secondary)]">Vashi &amp; Belapur Peripheral Absorption</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">82% Healthy</span>
                  </div>
                  <CapacityBar value={82} max={100} showPercentage={false} size="sm" />
                </div>
              </div>
            </div>

            {/* Revenue Contribution */}
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Hotel Partner Referral Pool:</span>
                <span className="text-[var(--text-primary)] font-bold">₹{revenue.hotel.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Airtel Broadcast Subscriptions:</span>
                <span className="text-[var(--terracotta-text)] font-bold">₹{revenue.airtel_tv.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── GATE MONITORING & SURGE RADAR (8 GATES) ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)] font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--terracotta-primary)]" />
                <span>8 Stadium Ingress Gates &amp; Turnstile Throughput</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Real-time bottleneck detection with autonomous fast-track deconfliction
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)] font-semibold">
              1 FLAG DETECTED (GATE F)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(gateForecast?.gates || gates.slice(0, 8)).map((gate, i) => (
              <GateCard 
                key={gate.id || i} 
                gate={{
                  ...gate,
                  load: gate.peakPct ? gate.peakPct / 100 : (gate.load || 0.65),
                  current: gate.assigned || Math.round(gate.capacity * 0.65),
                  wait_minutes: gate.peakPct > 85 ? 18 : gate.peakPct > 70 ? 9 : 3,
                }} 
              />
            ))}
          </div>
        </div>

        {/* ─── PARKING ZONES & SHUTTLE MONITORS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Parking Zones (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[var(--terracotta-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
                  Parking Zone Allocations (P1–P5)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--terracotta-text)] font-bold">
                DYNAMIC VMS ACTIVE
              </span>
            </div>

            <div className="space-y-3.5">
              {parkingZones.map((pz, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--text-primary)] font-medium">{pz.name}</span>
                    <div className="flex items-center gap-2">
                      {pz.rerouted && (
                        <span className="rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 text-[9px] px-1.5 py-0.5 font-bold">
                          DIVERT TRIGGERED
                        </span>
                      )}
                      {pz.absorbing && (
                        <span className="rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 font-bold">
                          ABSORBING
                        </span>
                      )}
                      <span className="text-[var(--text-secondary)] font-bold">{Math.round((pz.occupied / pz.capacity) * 100)}%</span>
                    </div>
                  </div>
                  <CapacityBar 
                    value={pz.occupied} 
                    max={pz.capacity} 
                    showPercentage={false} 
                    size="sm" 
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                    <span>{pz.occupied} stalls</span>
                    <span>Cap: {pz.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outstation Shuttles (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-[var(--terracotta-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
                  Outstation Dedicated Fan Shuttles
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                100% DISPATCHED ON TIME
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px]">
                    <th className="pb-2">ZONE &amp; CONVOY</th>
                    <th className="pb-2">DEPARTURE</th>
                    <th className="pb-2">BOOKED / CAP</th>
                    <th className="pb-2">OCCUPANCY</th>
                    <th className="pb-2 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {shuttles.slice(0, 5).map((s) => {
                    const pct = Math.round(s.load * 100);
                    return (
                      <tr key={s.id} className="hover:bg-[var(--bg-elevated)] transition">
                        <td className="py-2.5 font-bold text-[var(--text-primary)]">{s.zone}</td>
                        <td className="py-2.5 text-[var(--text-secondary)]">{s.departure_time}</td>
                        <td className="py-2.5 text-[var(--text-secondary)]">{s.booked} / {s.capacity}</td>
                        <td className="py-2.5">
                          <span className={`font-bold ${pct > 85 ? 'text-rose-600 dark:text-rose-400' : pct > 70 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {pct}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            s.status === 'critical'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                              : s.status === 'approaching_capacity'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {s.status === 'critical' ? 'FULL' : s.status === 'approaching_capacity' ? 'CLOSING' : 'OPEN'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── POST-EVENT EGRESS WAVE TIMELINE FEATURE ─── */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--terracotta-text)]">
                  FEATURE: POST-EVENT EGRESS ORCHESTRATION
                </span>
              </div>
              <h3 className="text-base font-black text-[var(--text-primary)] font-mono">
                Phased Stadium Evacuation &amp; Transit Dispersal Waves
              </h3>
            </div>

            <div className="flex items-center rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1">
              {[
                { id: 1, label: 'Wave 1 (T+0m)' },
                { id: 2, label: 'Wave 2 (T+20m)' },
                { id: 3, label: 'Wave 3 (T+40m)' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setActiveEgressWave(w.id)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                    activeEgressWave === w.id ? 'bg-[var(--terracotta-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className={`rounded-xl border p-4 transition ${activeEgressWave === 1 ? 'border-[var(--terracotta-border)] bg-[var(--terracotta-tint)]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'}`}>
              <div className="text-[var(--text-muted)] text-[10px] mb-1">PHASE 01 · LOWER BOWL &amp; VIP</div>
              <div className="text-[var(--text-primary)] font-black text-sm mb-1">Lower Stand Priority Exit</div>
              <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                Direct evacuation via Gates A, B, G. Dedicated Metro feeder shuttles staged at South concourse.
              </p>
              <div className="mt-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">18,500 FANS DISPERSED</div>
            </div>

            <div className={`rounded-xl border p-4 transition ${activeEgressWave === 2 ? 'border-[var(--terracotta-border)] bg-[var(--terracotta-tint)]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'}`}>
              <div className="text-[var(--text-muted)] text-[10px] mb-1">PHASE 02 · MID TIER &amp; EAST STAND</div>
              <div className="text-[var(--text-primary)] font-black text-sm mb-1">East Concourse Dispersal</div>
              <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                Fans routed via Gates C &amp; D toward Parking P3 &amp; P4. Staggered exit eliminates Palm Beach choke point.
              </p>
              <div className="mt-2 text-[var(--terracotta-text)] text-[10px] font-bold">20,200 FANS DISPERSED</div>
            </div>

            <div className={`rounded-xl border p-4 transition ${activeEgressWave === 3 ? 'border-[var(--terracotta-border)] bg-[var(--terracotta-tint)]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'}`}>
              <div className="text-[var(--text-muted)] text-[10px] mb-1">PHASE 03 · UPPER TIERS &amp; OUTSTATION</div>
              <div className="text-[var(--text-primary)] font-black text-sm mb-1">Outstation Shuttle Convoys</div>
              <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                Final cohort guided to reserved shuttle bays for direct expressway transit to Belapur &amp; Vashi hotels.
              </p>
              <div className="mt-2 text-[var(--text-muted)] text-[10px] font-bold">16,300 FANS DISPERSED</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
