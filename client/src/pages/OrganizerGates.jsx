import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApi, api } from '../api.js';
import LoadBar from '../components/LoadBar.jsx';
import LiveBadge from '../components/LiveBadge.jsx';
import { pct, shortName } from '../lib/format.js';

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
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="draw-line" />
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
      detectRetina: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    gates.forEach((g) => {
      const color = STATUS_COLOR[g.status] ?? '#34d399';
      const icon = L.divIcon({
        className: '',
        html: `<div style="transform:translate(-50%,-100%);text-align:center">
          <div style="width:24px;height:24px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,.5),0 0 16px ${color}66;margin:0 auto"></div>
          <div style="background:rgba(6,10,19,.92);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;margin-top:3px;white-space:nowrap;border:1px solid rgba(148,163,184,.3)">${shortName(g.name)} · ${pct(g.load)}</div>
        </div>`,
        iconSize: [0, 0],
      });
      L.marker([g.lat, g.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<b>${g.name}</b> · ${g.side}<br/>${g.assigned.toLocaleString('en-IN')} / ${g.capacity.toLocaleString('en-IN')} assigned<br/>Load ${pct(g.load)} · ${g.status.replace('_', ' ')}`,
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
        dashArray: s.density > 0 ? '1 0' : undefined,
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
            <div style="width:30px;height:30px;border-radius:9999px;background:#f43f5e;border:3px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,.5),0 0 20px #f43f5eaa;display:flex;align-items:center;justify-content:center;font-size:14px">⚠️</div>
          </div>`,
          iconSize: [0, 0],
        });
        L.marker([m.lat, m.lng], { icon, zIndexOffset: 500 })
          .addTo(flowLayerRef.current)
          .bindPopup(`<b>⚠ Potential crowd mixing point</b><br/>${m.note}`, { maxWidth: 300 });
      });
    }
  }, [segments, mixingPoints, flowSide]);

  return <div ref={ref} className="map-dark-tiles h-[480px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40" />;
}

export default function OrganizerGates() {
  const { data: gates, loading, error } = useApi(api.gates);
  const { data: forecast } = useApi(api.gateForecastSummary);
  const { data: routing } = useApi(api.routingDecisions);
  const [flowSide, setFlowSide] = useState('both');
  const [simTime, setSimTime] = useState(60);
  const [playing, setPlaying] = useState(false);
  const { data: flow } = useApi(() => api.crowdFlow(simTime), [simTime]);

  // Auto-play: sweep the arrival window T-3h → kickoff.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setSimTime((t) => {
        const next = t - 15;
        if (next < 0) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 650);
    return () => clearInterval(id);
  }, [playing]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-ink-800" /></div>;
  if (error) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6"><p className="text-lg text-slate-300">{error.message}</p></div>;
  }

  const flaggedGates = (forecast?.gates ?? []).filter((g) => g.flagged);
  const decisions = routing?.decisions ?? [];

  const segmentByPath = (name) => flow?.segments?.find((s) => s.name === name);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyber-400">
              Crowd flow &amp; predictive routing
            </p>
            <LiveBadge label="Live simulation" />
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Two crowds. <span className="text-gradient">Zero collisions.</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            <b className="text-sky-300">Sky</b> = local (parking/rail → North/West) ·{' '}
            <b className="text-rose-300">Rose</b> = outstation (shuttle → East/South) · line width =
            people on path
          </p>
        </div>
        <Link to="/organizer" className="btn-ghost !px-4 !py-2.5 text-[13px]">← Command center</Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {/* Flow controls */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-ink-850/80 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Flow</span>
              {[
                { k: 'both', label: 'Both', cls: 'border-cyber-400 bg-cyber-400/15 text-cyber-300' },
                { k: 'local', label: 'Local only', cls: 'border-sky-400 bg-sky-500/15 text-sky-300' },
                { k: 'outstation', label: 'Outstation only', cls: 'border-rose-400 bg-rose-500/15 text-rose-300' },
              ].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setFlowSide(o.k)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    flowSide === o.k ? o.cls : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (playing) {
                    setPlaying(false);
                  } else {
                    setSimTime(180);
                    setPlaying(true);
                  }
                }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition ${
                  playing
                    ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                    : 'border-cyber-400 bg-cyber-400/15 text-cyber-300 hover:bg-cyber-400/25'
                }`}
              >
                {playing ? '❚❚ Pause' : '▶ Play arrival window'}
              </button>
              <span className="text-[11px] font-semibold text-slate-500">Time</span>
              <input
                type="range"
                min={0}
                max={180}
                step={15}
                value={simTime}
                onChange={(e) => setSimTime(Number(e.target.value))}
                className="slider w-32 sm:w-40"
                aria-label="Arrival time slider"
              />
              <span className="tabular w-14 text-xs font-black text-white">{timeLabel(simTime)}</span>
            </div>
          </div>

          <GateMap gates={gates} segments={flow?.segments} mixingPoints={flow?.mixingPoints ?? []} flowSide={flowSide} />

          {flow && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span>
                Simulating <b className="text-white">{flow.match.home_team} vs {flow.match.away_team}</b> ·{' '}
                <b className="tabular">{flow.segments.reduce((a, s) => a + s.density, 0).toLocaleString('en-IN')}</b> people on approach paths
              </span>
              {flow.mixingPoints.length > 0 && (
                <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2.5 py-1 font-bold text-rose-300">
                  ⚠ {flow.mixingPoints.length} mixing point{flow.mixingPoints.length > 1 ? 's' : ''} flagged
                </span>
              )}
            </div>
          )}

          {/* mixing point alerts */}
          {flow && flow.mixingPoints.length > 0 && (
            <div className="mt-4 space-y-3">
              {flow.mixingPoints.map((m, i) => {
                const localSeg = segmentByPath(m.localPath);
                const outSeg = segmentByPath(m.outstationPath);
                return (
                  <div
                    key={m.id}
                    className="fade-up relative overflow-hidden rounded-2xl border border-rose-400/30 bg-rose-400/[0.05] p-4"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <p className="text-sm font-black text-rose-300">Mixing point detected</p>
                        <span className="chip border-rose-400/40 bg-rose-400/10 text-rose-300">Risk · high</span>
                      </div>
                      <span className="tabular text-[11px] text-slate-400">corridor gap {m.distanceM} m</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      <b className="text-sky-300">{m.localPath}</b> (local,{' '}
                      <b className="tabular">{(localSeg?.density ?? 0).toLocaleString('en-IN')}</b> on path) and{' '}
                      <b className="text-rose-300">{m.outstationPath}</b> (outstation,{' '}
                      <b className="tabular">{(outSeg?.density ?? 0).toLocaleString('en-IN')}</b> on path)
                      approach within {m.distanceM} m of each other.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-rose-400/15 px-2.5 py-1 text-[11px] font-extrabold text-rose-200">
                        Recommended: marshalling barriers + steward at this point
                      </span>
                      <button
                        onClick={() => setFlowSide('local')}
                        className="rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-bold text-slate-300 transition hover:bg-white/5"
                      >
                        Inspect local flow
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* right rail */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.08] bg-ink-850/80 p-4">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Gate load · live</p>
            <div className="space-y-2.5">
              {[...gates].sort((a, b) => b.load - a.load).map((g) => (
                <div key={g.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[g.status] }} />
                      <span className="text-sm font-black text-white">Gate {shortName(g.name)}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${g.side === 'local' ? 'bg-cyber-400/15 text-cyber-300' : 'bg-rose-400/15 text-rose-300'}`}>
                        {g.side}
                      </span>
                    </div>
                    <span className="tabular font-mono text-base font-black text-white">{pct(g.load)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <LoadBar load={g.load} status={g.status} className="flex-1" />
                    <span className="tabular whitespace-nowrap text-[10px] text-slate-500">
                      {g.assigned.toLocaleString('en-IN')}/{g.capacity.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* routing intelligence */}
          <div className="rounded-2xl border border-cyber-400/25 bg-cyber-400/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyber-300">Routing intelligence</p>
              <span className="live-dot" />
            </div>
            {decisions.length ? (
              <div className="mt-3 space-y-2">
                {decisions.slice(0, 4).map((d) => (
                  <div key={d.ticketId} className="rounded-lg bg-ink-950/60 p-2.5">
                    <p className="text-[10px] leading-relaxed text-slate-300">{d.reason}</p>
                    <p className="mt-1 flex items-center justify-between text-[9px]">
                      <span className="font-mono text-cyber-300/80">{d.ticketId}</span>
                      <span className="font-extrabold uppercase tracking-widest text-emerald-300">✓ updated</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[11px] text-slate-400">
                No active reassignments — all zones have capacity right now.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Arrival forecast */}
      {forecast && (
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white">Arrival forecast</h2>
              <p className="mt-1 text-sm text-slate-400">
                Predicted gate load from T-3h to kickoff for{' '}
                <b className="text-white">{forecast.match.home_team} vs {forecast.match.away_team}</b> —
                tickets assigned × arrival curve. Dashed line = 90% capacity.
              </p>
            </div>
            {flaggedGates.length > 0 && (
              <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs font-bold text-rose-300">
                ⚠ {flaggedGates.length} gate{flaggedGates.length > 1 ? 's' : ''} predicted to exceed 90% at peak
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {forecast.gates.map((g, i) => (
              <div
                key={g.id}
                className={`fade-up rounded-2xl border bg-ink-850/80 p-4 transition hover:-translate-y-0.5 ${
                  g.flagged ? 'border-rose-400/50 shadow-[0_0_24px_rgba(251,113,133,0.15)]' : 'border-white/[0.08]'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-white">Gate {shortName(g.name)}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${g.side === 'local' ? 'bg-cyber-400/15 text-cyber-300' : 'bg-rose-400/15 text-rose-300'}`}>
                    {g.side}
                  </span>
                </div>
                <ForecastSparkline slots={g.slots} flagged={g.flagged} />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Peak {g.peakLabel}</span>
                  <span className={`tabular font-black ${g.flagged ? 'text-rose-400' : 'text-amber-300'}`}>{g.peakPct}%</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="tabular">{g.assigned.toLocaleString('en-IN')} tickets</span>
                  {g.flagged && <span className="font-bold text-rose-400">⚠ peak &gt; 90%</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}