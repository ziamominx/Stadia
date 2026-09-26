'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { useApi, api } from '../../../lib/api.js';
import LoadBar, { StatusPill } from '../../../components/LoadBar.jsx';
import { pct } from '../../../lib/format.js';
import {
  AlertTriangle,
  Zap,
  Shield,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  DoorClosed,
  Bus,
} from '../../../components/Icons.jsx';

const STATUS_COLOR = { ok: '#34d399', approaching_capacity: '#fbbf24', critical: '#fb7185' };
const FLOW_COLOR = { local: '#38bdf8', outstation: '#fb7185' };

function timeLabel(minutesBefore) {
  if (minutesBefore >= 60) {
    const h = Math.floor(minutesBefore / 60);
    const m = minutesBefore % 60;
    return m ? `T-${h}h ${m}m` : `T-${h}h`;
  }
  return `T-${minutesBefore}m`;
}

function ForecastSparkline({ slots, flagged, turnstileBoost = 0 }) {
  const W = 220;
  const H = 64;
  const PAD = 6;
  if (!slots || slots.length === 0) return null;

  // Apply turnstile boost simulation reduction
  const adjustedSlots = slots.map((s) => ({
    ...s,
    loadPct: Math.max(20, Math.round(s.loadPct * (1 - turnstileBoost * 0.06))),
  }));

  const peak = adjustedSlots.reduce((b, s) => (s.loadPct > b.loadPct ? s : b), adjustedSlots[0]);
  const isNowFlagged = peak.loadPct >= 90;
  const maxY = Math.max(100, peak.loadPct * 1.05);
  const pts = adjustedSlots.map((s, i) => [
    PAD + (i * (W - 2 * PAD)) / (adjustedSlots.length - 1),
    H - PAD - (s.loadPct / maxY) * (H - 2 * PAD),
  ]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const dangerY = H - PAD - (90 / maxY) * (H - 2 * PAD);
  const peakPt = pts[adjustedSlots.findIndex((s) => s === peak)];
  const color = isNowFlagged ? '#fb7185' : '#34d399';

  return (
    <div className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={PAD} y1={dangerY} x2={W - PAD} y2={dangerY} stroke="#fb7185" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={peakPt[0]} cy={peakPt[1]} r="3" fill={color} />
        {[0, 4, 8, adjustedSlots.length - 1].map((i) => (
          <text key={i} x={pts[i] ? pts[i][0] : 0} y={H - 1} fontSize="7" fill="#64748b" textAnchor={i === 0 ? 'start' : i === adjustedSlots.length - 1 ? 'end' : 'middle'}>
            {adjustedSlots[i]?.label}
          </text>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-neutral-500">Peak Load:</span>
        <span className={isNowFlagged ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
          {peak.loadPct}% ({isNowFlagged ? '⚠ Approaching Redline' : 'Nominal Safe Flow'})
        </span>
      </div>
    </div>
  );
}

function GateMap({ gates, segments, mixingPoints, flowSide, isEgress }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const flowLayerRef = useRef(null);
  const leafletRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    if (!ref.current || mapRef.current) return;

    import('leaflet').then((mod) => {
      if (!isMounted || !ref.current || mapRef.current) return;
      const L = mod.default || mod;
      leafletRef.current = L;

      const map = L.map(ref.current, { zoomControl: true });
      mapRef.current = map;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      gates?.forEach((g) => {
        const color = STATUS_COLOR[g.status] ?? '#34d399';
        const icon = L.divIcon({
          className: '',
          html: `<div style="transform:translate(-50%,-100%);text-align:center">
            <div style="width:22px;height:22px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,.4);margin:0 auto"></div>
            <div style="background:rgba(7,13,24,.9);color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;margin-top:3px;white-space:nowrap">${g.name} · ${pct(g.load)}</div>
          </div>`,
          iconSize: [0, 0],
        });
        L.marker([g.lat, g.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<b>${g.name}</b><br/>${g.assigned.toLocaleString('en-IN')} / ${g.capacity.toLocaleString('en-IN')} assigned<br/>Load ${pct(g.load)} · ${(g.status || 'nominal').replace('_', ' ')}`,
          );
      });

      if (gates && gates.length > 0) {
        map.fitBounds(L.latLngBounds(gates.map((g) => [g.lat, g.lng])).pad(0.35));
      }
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        flowLayerRef.current = null;
      }
    };
  }, [gates]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (!flowLayerRef.current) flowLayerRef.current = L.layerGroup().addTo(map);
    flowLayerRef.current.clearLayers();
    if (!segments) return;

    const shown = segments.filter((s) => flowSide === 'both' || s.side === flowSide);
    shown.forEach((s) => {
      const t = Math.min(1, s.density / 400);
      L.polyline([s.from, s.to], {
        color: isEgress ? '#f43f5e' : FLOW_COLOR[s.side],
        weight: 2 + 7 * t,
        opacity: 0.3 + 0.65 * t,
        dashArray: isEgress ? '8 8' : undefined,
      })
        .addTo(flowLayerRef.current)
        .bindTooltip(
          `<b>${s.name}</b><br/>${s.density.toLocaleString('en-IN')} people on path now · ${s.routed.toLocaleString('en-IN')} routed`,
          { direction: 'top' },
        );
    });

    if (flowSide === 'both' && mixingPoints && !isEgress) {
      mixingPoints.forEach((m) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="transform:translate(-50%,-100%);text-align:center">
            <div style="width:24px;height:24px;border-radius:9999px;background:#f43f5e;border:2px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>`,
          iconSize: [0, 0],
        });
        L.marker([m.lat, m.lng], { icon, zIndexOffset: 500 })
          .addTo(flowLayerRef.current)
          .bindPopup(`<b>Potential crowd mixing point</b><br/>${m.note}`, { maxWidth: 300 });
      });
    }
  }, [segments, mixingPoints, flowSide, isEgress]);

  return <div ref={ref} className="h-[440px] w-full overflow-hidden rounded-2xl border border-neutral-800" />;
}

export default function OrganizerGatesPage() {
  const { data: gates, loading, error, reload: reloadGates } = useApi(api.gates);
  const { data: forecast } = useApi(api.gateForecastSummary);
  const [flowSide, setFlowSide] = useState('both');
  const [simTime, setSimTime] = useState(60);
  const { data: flow, reload: reloadFlow } = useApi(() => api.crowdFlow(simTime), [simTime]);

  // Enhancements: Matchday Lifecycle Mode + Direct Tactical Actions + Capacity Simulator
  const [lifecycleMode, setLifecycleMode] = useState('ingress'); // 'ingress' or 'egress'
  const [dispatchAlert, setDispatchAlert] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [turnstilesBoost, setTurnstilesBoost] = useState(0); // 0 to 4 additional turnstiles

  // Staggered Wave departure states for Egress Mode
  const [waves, setWaves] = useState([
    { id: 1, name: 'Wave 1 · Upper Tier Blocks A/B', count: '14,200 fans', status: 'RELEASED', timer: '0m (Clearing)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 2, name: 'Wave 2 · Mid Tier Blocks C/D/H', count: '18,500 fans', status: 'HOLDING', timer: '4m 30s', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 3, name: 'Wave 3 · Lower Tier Pitchside', count: '15,500 fans', status: 'HOLDING', timer: '11m 00s', color: 'text-neutral-400 bg-neutral-800/80 border-neutral-700' },
  ]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-72 animate-pulse rounded-2xl bg-[#0e0e12]" />
      </div>
    );
  }
  if (error || !gates) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-neutral-300">{error?.message || 'Failed to load gates'}</p>
      </div>
    );
  }

  // 1-Click Tactical Interventions Execution
  const handleApplyAction = async (title, actionType, impactMetric) => {
    setDispatching(true);
    try {
      await api.applyIntervention({
        title,
        actionType,
        impactMetric,
        description: `Triggered directly from Gate Operations radar console.`,
      });
      setDispatchAlert(`Tactical Action Executed: ${title} (${impactMetric})`);
      reloadGates();
      reloadFlow();
      setTimeout(() => setDispatchAlert(null), 6000);
    } catch (err) {
      setDispatchAlert(`Action failed: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  const handleReleaseWaveEarly = (waveId) => {
    setWaves((prev) =>
      prev.map((w) => (w.id === waveId ? { ...w, status: 'RELEASED', timer: 'Released Now', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' } : w)),
    );
    setDispatchAlert(`Wave ${waveId} exit gates opened. Turnstile egress signals dispatched.`);
    setTimeout(() => setDispatchAlert(null), 5000);
  };

  const isGateBOverloaded = gates.some((g) => g.name.includes('Gate B') && g.load >= 0.8);
  const hasMixingPoints = (flow?.mixingPoints ?? []).length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6 fade-up">
      {/* Top Breadcrumb & Lifecycle Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <Link href="/organizer" className="text-xs font-semibold text-neutral-400 hover:text-white">
            ← Organizer Overview
          </Link>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            Gate Command &amp; Ingress/Egress Orchestrator
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-neutral-400">
            Real-time turnstile load telemetry, multi-stream crowd deconfliction, and live tactical intervention dispatch.
          </p>
        </div>

        {/* Stadium Lifecycle Phase Toggle */}
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-[#111114] p-1 shadow-lg">
          <button
            onClick={() => setLifecycleMode('ingress')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
              lifecycleMode === 'ingress'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${lifecycleMode === 'ingress' ? 'bg-black' : 'bg-emerald-400'}`} />
            <span>Ingress Arrivals (T-3h)</span>
          </button>
          <button
            onClick={() => setLifecycleMode('egress')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
              lifecycleMode === 'egress'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${lifecycleMode === 'egress' ? 'bg-white' : 'bg-rose-400'}`} />
            <span>Post-Match Egress (FT)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Flash Banner */}
      {dispatchAlert && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 shadow-xl flex items-center justify-between gap-3 text-xs text-emerald-300 fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{dispatchAlert}</span>
          </div>
          <button onClick={() => setDispatchAlert(null)} className="text-neutral-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* TACTICAL ACTION BAR (Zero Tab-Hopping Dispatch) */}
      {lifecycleMode === 'ingress' && (isGateBOverloaded || hasMixingPoints) && (
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-[#14120c] to-[#0e0e12] p-5 shadow-2xl space-y-3 fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-ping" />
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Tactical Anomaly Detected · Recommended Mitigations Ready
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Gate B turnstile congestion approaching 88% and Local/Outstation pedestrian path mixing within 220m.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[11px] font-mono font-bold text-amber-300">
              ACTIONABLE
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-800/80">
            <button
              onClick={() => handleApplyAction('Gate B Ingress Diversion to Gate A', 'reroute', '-65% Turnstile Delay')}
              disabled={dispatching}
              className="rounded-2xl border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 p-3 text-left transition space-y-1 group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>1. Divert 1,200 Passes to Gate A</span>
                <Zap className="h-3.5 w-3.5 group-hover:scale-110 transition" />
              </div>
              <p className="text-[11px] text-neutral-300">
                Pushes instant fast-track digital pass update to fans outside Gate B.
              </p>
            </button>

            <button
              onClick={() => handleApplyAction('Sector 14 Pedestrian Separation Barricades', 'barricade', '0 Mixing Points')}
              disabled={dispatching}
              className="rounded-2xl border border-sky-500/60 bg-sky-500/10 hover:bg-sky-500/20 p-3 text-left transition space-y-1 group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                <span>2. Deploy Sector 14 Barricades</span>
                <Shield className="h-3.5 w-3.5 group-hover:scale-110 transition" />
              </div>
              <p className="text-[11px] text-neutral-300">
                Physically separates parking arrivals from East shuttle coach drop-offs.
              </p>
            </button>

            <button
              onClick={() => {
                alert('SMS & Radio broadcast sent to all Gate B and A Turnstile Stewards.');
                setDispatchAlert('Broadcast dispatched to 48 ground stewards via radio mesh.');
                setTimeout(() => setDispatchAlert(null), 5000);
              }}
              className="rounded-2xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 p-3 text-left transition space-y-1 group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>3. Alert Ground Stewards</span>
                <Users className="h-3.5 w-3.5 group-hover:scale-110 transition" />
              </div>
              <p className="text-[11px] text-neutral-400">
                Dispatches radio alert to reposition 12 stewards to Gate A turnstiles.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* EGRESS MODE: STAGGERED WAVE SEQUENCER */}
      {lifecycleMode === 'egress' && (
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-[#140a0e] to-[#0e0e12] p-6 shadow-2xl space-y-5 fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
                  Full-Time Egress Protocol Active · 48,200 Spectators
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Staggered Block Departure Sequencer</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Releasing stadium tiers in 5-minute phased intervals prevents crowd crush at perimeter turnstiles and suburban rail station stairwells.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400">Exit Gates Active:</span>
              <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-0.5 text-xs font-mono font-bold text-rose-300">
                Gates G, D, E, F Online
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {waves.map((w) => (
              <div key={w.id} className="rounded-2xl border border-neutral-800 bg-[#121217] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{w.name}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${w.color}`}>
                    {w.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-neutral-400">{w.count}</span>
                  <span className="font-mono text-sm font-black text-white">{w.timer}</span>
                </div>
                {w.status === 'HOLDING' && (
                  <button
                    onClick={() => handleReleaseWaveEarly(w.id)}
                    className="w-full rounded-xl bg-white/10 hover:bg-white/20 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                  >
                    <span>Release Wave Early</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Map & Live Load Split Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {/* Map Controls */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-[#0e0e12] p-3 shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 font-mono">Filter Flow</span>
              {['both', 'local', 'outstation'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFlowSide(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                    flowSide === s
                      ? s === 'local'
                        ? 'border-sky-400 bg-sky-500/15 text-sky-300'
                        : s === 'outstation'
                          ? 'border-rose-400 bg-rose-500/15 text-rose-300'
                          : 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                      : 'border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  {s === 'both' ? 'Both Flows' : s === 'local' ? 'Local Flow' : 'Outstation Flow'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Ingress Time</span>
              <input
                type="range"
                min={0}
                max={180}
                step={15}
                value={simTime}
                onChange={(e) => setSimTime(Number(e.target.value))}
                className="w-32 sm:w-36"
                style={{ accentColor: '#10b981' }}
              />
              <span className="w-16 text-xs font-bold text-white font-mono">{timeLabel(simTime)}</span>
            </div>
          </div>

          <GateMap
            gates={gates}
            segments={flow?.segments}
            mixingPoints={flow?.mixingPoints ?? []}
            flowSide={flowSide}
            isEgress={lifecycleMode === 'egress'}
          />

          {flow && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-neutral-400">
              <span>
                Simulating <b className="text-white">{flow.match?.home_team} vs {flow.match?.away_team}</b> ·{' '}
                <b className="text-sky-300">sky</b> = local corridor · <b className="text-rose-300">rose</b> = outstation shuttle corridor
              </span>
              {flow.mixingPoints?.length > 0 && lifecycleMode === 'ingress' && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-bold text-rose-300">
                  <AlertTriangle className="h-3 w-3" />
                  {flow.mixingPoints.length} mixing point flagged (Sector 14 North-East)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Gate Saturation & Capacity Simulator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Live Turnstile Saturation &amp; Forecast
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {gates.length} Gates Synchronized
            </span>
          </div>

          {/* Gate Cards List */}
          {[...gates].sort((a, b) => b.load - a.load).map((g) => {
            const isGateB = g.name.includes('Gate B');
            const boost = isGateB ? turnstilesBoost : 0;
            const currentTurnstiles = 10 + boost;

            return (
              <div key={g.id} className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: STATUS_COLOR[g.status] }}
                    />
                    <span className="text-sm font-bold text-white">{g.name}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${g.side === 'local' ? 'bg-sky-500/15 text-sky-300' : 'bg-rose-500/15 text-rose-300'}`}>
                      {g.side}
                    </span>
                  </div>
                  <span className="text-sm font-black text-white font-mono">{pct(g.load)}</span>
                </div>

                {/* Turnstile Capacity Controls (Interactive Simulator) */}
                {isGateB && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">Active Turnstiles: {currentTurnstiles} / 14</span>
                      <span className="text-[10px] text-neutral-400">
                        {boost > 0 ? `+${boost * 450} pax/hr capacity added` : 'Test opening standby lanes'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setTurnstilesBoost((prev) => Math.max(0, prev - 1))}
                        disabled={turnstilesBoost === 0}
                        className="h-7 w-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold disabled:opacity-30"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setTurnstilesBoost((prev) => Math.min(4, prev + 1))}
                        disabled={turnstilesBoost === 4}
                        className="h-7 w-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Sparkline Forecast */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <ForecastSparkline
                    slots={forecast?.gates?.find((fg) => fg.id === g.id)?.slots}
                    flagged={g.load >= 0.8}
                    turnstileBoost={boost}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
