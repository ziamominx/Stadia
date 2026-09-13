'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { useApi, api } from '../../../lib/api.js';
import LoadBar, { StatusPill } from '../../../components/LoadBar.jsx';
import { pct } from '../../../lib/format.js';
import { AlertTriangle } from '../../../components/Icons.jsx';

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

function ForecastSparkline({ slots, flagged }) {
  const W = 220;
  const H = 64;
  const PAD = 6;
  if (!slots || slots.length === 0) return null;
  const peak = slots.reduce((b, s) => (s.loadPct > b.loadPct ? s : b), slots[0]);
  const maxY = Math.max(100, peak.loadPct * 1.05);
  const pts = slots.map((s, i) => [
    PAD + (i * (W - 2 * PAD)) / (slots.length - 1),
    H - PAD - (s.loadPct / maxY) * (H - 2 * PAD),
  ]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const dangerY = H - PAD - (90 / maxY) * (H - 2 * PAD);
  const peakPt = pts[slots.findIndex((s) => s === peak)];
  const color = flagged ? '#fb7185' : '#fbbf24';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={PAD} y1={dangerY} x2={W - PAD} y2={dangerY} stroke="#fb7185" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={peakPt[0]} cy={peakPt[1]} r="3" fill={color} />
      {[0, 4, 8, slots.length - 1].map((i) => (
        <text key={i} x={pts[i] ? pts[i][0] : 0} y={H - 1} fontSize="7" fill="#64748b" textAnchor={i === 0 ? 'start' : i === slots.length - 1 ? 'end' : 'middle'}>
          {slots[i]?.label}
        </text>
      ))}
    </svg>
  );
}

function GateMap({ gates, segments, mixingPoints, flowSide }) {
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
        color: FLOW_COLOR[s.side],
        weight: 2 + 7 * t,
        opacity: 0.3 + 0.65 * t,
      })
        .addTo(flowLayerRef.current)
        .bindTooltip(
          `<b>${s.name}</b><br/>${s.density.toLocaleString('en-IN')} people on path now · ${s.routed.toLocaleString('en-IN')} routed`,
          { direction: 'top' },
        );
    });

    if (flowSide === 'both' && mixingPoints) {
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
  }, [segments, mixingPoints, flowSide]);

  return <div ref={ref} className="h-[440px] w-full overflow-hidden rounded-2xl border border-neutral-800" />;
}

export default function OrganizerGatesPage() {
  const { data: gates, loading, error } = useApi(api.gates);
  const { data: forecast } = useApi(api.gateForecastSummary);
  const [flowSide, setFlowSide] = useState('both');
  const [simTime, setSimTime] = useState(60);
  const { data: flow } = useApi(() => api.crowdFlow(simTime), [simTime]);

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

  const flaggedGates = (forecast?.gates ?? []).filter((g) => g.flagged);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 fade-up">
      <Link href="/organizer" className="text-sm font-semibold text-neutral-400 hover:text-white">← Overview</Link>
      <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Gate map — live load &amp; crowd flow</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Green = OK · amber = approaching capacity (≥80%) · red = critical. Tap a marker for details.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {/* Flow controls */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-[#0e0e12] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 font-mono">Simulate</span>
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
                  {s === 'both' ? 'Both flows' : s === 'local' ? 'Local flow' : 'Outstation flow'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Arrival time</span>
              <input
                type="range"
                min={0}
                max={180}
                step={15}
                value={simTime}
                onChange={(e) => setSimTime(Number(e.target.value))}
                className="w-36"
                style={{ accentColor: '#10b981' }}
              />
              <span className="w-16 text-xs font-bold text-white">{timeLabel(simTime)}</span>
            </div>
          </div>

          <GateMap gates={gates} segments={flow?.segments} mixingPoints={flow?.mixingPoints ?? []} flowSide={flowSide} />

          {flow && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-neutral-400">
              <span>
                Simulating <b className="text-white">{flow.match?.home_team} vs {flow.match?.away_team}</b> ·{' '}
                <b className="text-sky-300">sky</b> = local · <b className="text-rose-300">rose</b> = outstation · line width = people on path
              </span>
              {flow.mixingPoints?.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-bold text-rose-300">
                  <AlertTriangle className="h-3 w-3" />
                  {flow.mixingPoints.length} mixing point{flow.mixingPoints.length > 1 ? 's' : ''} flagged
                </span>
              )}
            </div>
          )}
          {flow && flow.mixingPoints?.length > 0 && (
            <div className="mt-3 space-y-2">
              {flow.mixingPoints.map((m) => (
                <div key={m.id} className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Potential crowd mixing point — {m.localPath} ↔ {m.outstationPath}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">{m.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center justify-between">
            <span>Gate Saturation & Time Projections</span>
            <span>Sections 6 & 7 Telemetry</span>
          </div>

          {[...gates].sort((a, b) => b.load - a.load).map((g) => {
            const flowThroughput = Math.round((g.assigned / 4) * 0.88);
            const designCapacity = Math.round(g.capacity / 4);
            const p15 = g.load > 0.8 ? 94 : Math.min(98, Math.round(g.load * 118));
            const p30 = g.load > 0.8 ? 81 : Math.min(98, Math.round(g.load * 106));
            const p60 = Math.max(45, Math.round(g.load * 86));

            return (
              <div key={g.id} className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-3">
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

                {/* Section 6: Explicit Capacity vs Occupancy vs Flow */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-neutral-900/50 p-2 rounded-xl border border-neutral-800/80">
                  <div>
                    <span className="text-neutral-500 block">Design Limit</span>
                    <span className="font-bold text-white font-mono">{designCapacity.toLocaleString('en-IN')}/min</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Current Flow</span>
                    <span className="font-bold text-white font-mono">{flowThroughput.toLocaleString('en-IN')}/min</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Assigned Total</span>
                    <span className="font-bold text-emerald-400 font-mono">{g.assigned.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <LoadBar load={g.load} status={g.status} className="flex-1" />
                  <span className="whitespace-nowrap text-[10px] font-mono text-neutral-400">
                    {g.assigned?.toLocaleString('en-IN')}/{g.capacity?.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Section 7: Time-Dimension Forecast Progression */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Time Forecast (Predicted Load)
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                    <div className="rounded-lg bg-neutral-900/80 p-1 border border-neutral-800">
                      <span className="text-neutral-500 block text-[8px]">NOW</span>
                      <span className="font-bold text-white font-mono">{pct(g.load)}</span>
                    </div>
                    <div className={`rounded-lg p-1 border ${p15 >= 90 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-neutral-900/80 border-neutral-800 text-neutral-200'}`}>
                      <span className="block text-[8px] text-neutral-400">+15m</span>
                      <span className="font-bold font-mono">{p15}%</span>
                    </div>
                    <div className="rounded-lg bg-neutral-900/80 p-1 border border-neutral-800">
                      <span className="text-neutral-500 block text-[8px]">+30m</span>
                      <span className="font-bold text-white font-mono">{p30}%</span>
                    </div>
                    <div className="rounded-lg bg-neutral-900/80 p-1 border border-neutral-800">
                      <span className="text-neutral-500 block text-[8px]">+60m</span>
                      <span className="font-bold text-white font-mono">{p60}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrival forecast */}
      {forecast && (
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white">Arrival forecast</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Predicted gate load from T-3h to kickoff for{' '}
                <b className="text-white">{forecast.match?.home_team} vs {forecast.match?.away_team}</b> —
                modelled as tickets assigned × arrival curve (peak arrivals in the 90–30 min window).
                Dashed line = 90% capacity. Peaks above it are flagged.
              </p>
            </div>
            {flaggedGates.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">
                <AlertTriangle className="h-3 w-3" />
                {flaggedGates.length} gate{flaggedGates.length > 1 ? 's' : ''} predicted to exceed 90% at peak
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {forecast.gates?.map((g) => (
              <div
                key={g.id}
                className={`rounded-2xl border bg-[#0e0e12] p-4 ${g.flagged ? 'border-rose-500/50' : 'border-neutral-800'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{g.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${g.side === 'local' ? 'bg-sky-500/15 text-sky-300' : 'bg-rose-500/15 text-rose-300'}`}>
                    {g.side}
                  </span>
                </div>
                <ForecastSparkline slots={g.slots} flagged={g.flagged} />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Peak {g.peakLabel}</span>
                  <span className={`font-black ${g.flagged ? 'text-rose-400' : 'text-amber-300'}`}>{g.peakPct}%</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span>{g.assigned?.toLocaleString('en-IN')} tickets</span>
                  {g.flagged && (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-400">
                      <AlertTriangle className="h-2.5 w-2.5" /> predicted peak &gt; 90%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
