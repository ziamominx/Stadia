import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApi, api } from '../api.js';
import LoadBar, { StatusPill } from '../components/LoadBar.jsx';
import { pct } from '../lib/format.js';

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

// Small SVG line chart of predicted load over the T-3h → kickoff window.
function ForecastSparkline({ slots, flagged }) {
  const W = 220;
  const H = 64;
  const PAD = 6;
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
        <text key={i} x={pts[i][0]} y={H - 1} fontSize="7" fill="#64748b" textAnchor={i === 0 ? 'start' : i === slots.length - 1 ? 'end' : 'middle'}>
          {slots[i].label}
        </text>
      ))}
    </svg>
  );
}

function GateMap({ gates, segments, mixingPoints, flowSide }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const flowLayerRef = useRef(null);

  // Base map + gate markers (built once per gate set).
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: true });
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    gates.forEach((g) => {
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
          `<b>${g.name}</b><br/>${g.assigned.toLocaleString('en-IN')} / ${g.capacity.toLocaleString('en-IN')} assigned<br/>Load ${pct(g.load)} · ${g.status.replace('_', ' ')}`,
        );
    });

    map.fitBounds(L.latLngBounds(gates.map((g) => [g.lat, g.lng])).pad(0.35));
    return () => {
      map.remove();
      mapRef.current = null;
      flowLayerRef.current = null;
    };
  }, [gates]);

  // Crowd-flow overlay: redrawn whenever the simulation state changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
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

    if (flowSide === 'both') {
      mixingPoints.forEach((m) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="transform:translate(-50%,-100%);text-align:center">
            <div style="width:26px;height:26px;border-radius:9999px;background:#f43f5e;border:3px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:13px">⚠️</div>
          </div>`,
          iconSize: [0, 0],
        });
        L.marker([m.lat, m.lng], { icon, zIndexOffset: 500 })
          .addTo(flowLayerRef.current)
          .bindPopup(`<b>⚠ Potential crowd mixing point</b><br/>${m.note}`, { maxWidth: 300 });
      });
    }
  }, [segments, mixingPoints, flowSide]);

  return <div ref={ref} className="h-[440px] w-full overflow-hidden rounded-2xl border border-slate-700/50" />;
}

export default function OrganizerGates() {
  const { data: gates, loading, error } = useApi(api.gates);
  const { data: forecast } = useApi(api.gateForecastSummary);
  const [flowSide, setFlowSide] = useState('both');
  const [simTime, setSimTime] = useState(60);
  const { data: flow } = useApi(() => api.crowdFlow(simTime), [simTime]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-72 animate-pulse rounded-2xl bg-navy-900" /></div>;
  if (error) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6"><p className="text-lg text-slate-300">{error.message}</p></div>;
  }

  const flaggedGates = (forecast?.gates ?? []).filter((g) => g.flagged);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/organizer" className="text-sm font-semibold text-slate-400 hover:text-white">← Overview</Link>
      <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Gate map — live load &amp; crowd flow</h1>
      <p className="mt-1 text-sm text-slate-400">
        Green = OK · amber = approaching capacity (≥80%) · red = critical. Tap a marker for details.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {/* Flow controls */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-navy-900/70 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Simulate</span>
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
                          : 'border-saffron-400 bg-saffron-500/15 text-saffron-300'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {s === 'both' ? 'Both flows' : s === 'local' ? 'Local flow' : 'Outstation flow'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Arrival time</span>
              <input
                type="range"
                min={0}
                max={180}
                step={15}
                value={simTime}
                onChange={(e) => setSimTime(Number(e.target.value))}
                className="w-36"
                style={{ accentColor: '#f59e0b' }}
              />
              <span className="w-16 text-xs font-bold text-white">{timeLabel(simTime)}</span>
            </div>
          </div>

          <GateMap gates={gates} segments={flow?.segments} mixingPoints={flow?.mixingPoints ?? []} flowSide={flowSide} />

          {flow && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span>
                Simulating <b className="text-white">{flow.match.home_team} vs {flow.match.away_team}</b> ·{' '}
                <b className="text-sky-300">sky</b> = local · <b className="text-rose-300">rose</b> = outstation · line width = people on path
              </span>
              {flow.mixingPoints.length > 0 && (
                <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-bold text-rose-300">
                  ⚠ {flow.mixingPoints.length} mixing point{flow.mixingPoints.length > 1 ? 's' : ''} flagged
                </span>
              )}
            </div>
          )}
          {flow && flow.mixingPoints.length > 0 && (
            <div className="mt-3 space-y-2">
              {flow.mixingPoints.map((m) => (
                <div key={m.id} className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
                  <p className="text-xs font-bold text-rose-300">⚠ Potential crowd mixing point — {m.localPath} ↔ {m.outstationPath}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{m.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          {[...gates].sort((a, b) => b.load - a.load).map((g) => (
            <div key={g.id} className="rounded-xl border border-slate-800 bg-navy-900/70 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: STATUS_COLOR[g.status] }}
                  />
                  <span className="text-sm font-bold text-white">{g.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${g.side === 'local' ? 'bg-sky-500/15 text-sky-300' : 'bg-rose-500/15 text-rose-300'}`}>
                    {g.side}
                  </span>
                </div>
                <span className="text-sm font-black text-white">{pct(g.load)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <LoadBar load={g.load} status={g.status} className="flex-1" />
                <span className="whitespace-nowrap text-[10px] text-slate-500">
                  {g.assigned.toLocaleString('en-IN')}/{g.capacity.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="mt-1.5"><StatusPill status={g.status} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrival forecast */}
      {forecast && (
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white">Arrival forecast</h2>
              <p className="mt-1 text-sm text-slate-400">
                Predicted gate load from T-3h to kickoff for{' '}
                <b className="text-white">{forecast.match.home_team} vs {forecast.match.away_team}</b> —
                modelled as tickets assigned × arrival curve (peak arrivals in the 90–30 min window).
                Dashed line = 90% capacity. Peaks above it are flagged.
              </p>
            </div>
            {flaggedGates.length > 0 && (
              <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">
                ⚠ {flaggedGates.length} gate{flaggedGates.length > 1 ? 's' : ''} predicted to exceed 90% at peak
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {forecast.gates.map((g) => (
              <div
                key={g.id}
                className={`rounded-2xl border bg-navy-900/70 p-4 ${g.flagged ? 'border-rose-500/50' : 'border-slate-800'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{g.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${g.side === 'local' ? 'bg-sky-500/15 text-sky-300' : 'bg-rose-500/15 text-rose-300'}`}>
                    {g.side}
                  </span>
                </div>
                <ForecastSparkline slots={g.slots} flagged={g.flagged} />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Peak {g.peakLabel}</span>
                  <span className={`font-black ${g.flagged ? 'text-rose-400' : 'text-amber-300'}`}>{g.peakPct}%</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{g.assigned.toLocaleString('en-IN')} tickets</span>
                  {g.flagged && <span className="font-bold text-rose-400">⚠ predicted peak &gt; 90%</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}