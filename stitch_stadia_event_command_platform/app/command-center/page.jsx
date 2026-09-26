'use client';

// app/command-center/page.jsx — the anchor screen (flow.md Steps 02–08).
// Telemetry strip → schematic canvas → alert rail → decision drawer.
// The map is the hero; decisions open beside it, never over it.

import React, { useEffect, useState } from 'react';
import { useEventState } from '../../lib/useEventState';
import { MicroLabel, Metric, StatusChip, SectionHead, FlowBar, GhostButton, SolidButton, StabilityProgress } from '../../components/ui';

/* ---------- SVG stadium schematic (warm editorial vector projection) ---------- */

function StadiumSchematic({ state, onZoneClick }) {
  const west = state.gates.find((g) => g.id === 'W');
  const criticalGates = state.gates.filter((g) => g.load >= g.critical);
  const spikeActive = state.demo.spikeTicksLeft > 0;

  const gateColor = (g) => (g.load >= g.critical ? '#EF4444' : g.load >= g.warning ? '#F59E0B' : '#10B981');

  return (
    <div className="relative flex-1 w-full flex items-center justify-center p-4 select-none bg-canvas-recessed">
      {/* architectural grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAEAE7" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect fill="url(#arch-grid)" width="100%" height="100%" />
      </svg>

      <div className="relative w-full max-w-[820px] aspect-[16/11]">
        <svg viewBox="0 0 900 620" className="w-full h-full" fill="none">
          {/* shuttle arterials */}
          <path d="M 120 480 C 180 480 230 400 280 320" stroke="#EF4444" strokeWidth="2.5"
            className={spikeActive ? 'flow-dash-red' : ''} opacity={spikeActive ? 1 : 0.35} />
          <path d="M 760 520 C 700 520 620 480 520 450" stroke="#006C49" strokeWidth="1.5"
            strokeDasharray="4 4" opacity="0.6" />

          {/* transit hubs */}
          <g className="cursor-pointer" onClick={() => onZoneClick({ title: 'Transit Hub P3', load: state.parking.find(p=>p.id==='P3')?.occupancy || 0, detail: spikeActive ? 'Surge: queue building toward West Gate' : 'P3 queue nominal' })}>
            <rect x="35" y="440" width="165" height="90" fill="#FFFFFF" stroke="#EAEAE7" />
            <rect x="35" y="440" width="4" height="90" fill={spikeActive ? '#EF4444' : '#10B981'} />
            <text x="50" y="462" className="fill-ink" fontSize="11" fontWeight="600" letterSpacing="1">TRANSIT HUB P3</text>
            <text x="50" y="480" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono" fill={spikeActive ? '#DC2626' : '#059669'}>
              {Math.round((state.parking.find(p=>p.id==='P3')?.occupancy || 0) * 16).toLocaleString()} QUEUED
            </text>
            <text x="50" y="498" fontSize="10" fontFamily="JetBrains Mono" fill="#444748">Headway: {spikeActive ? '+6m delayed' : 'on time'}</text>
            <text x="50" y="516" fontSize="9" letterSpacing="1" fill="#8E8E8E">Direct flow → West Gate</text>
            {spikeActive && <circle cx="180" cy="458" r="4" fill="#EF4444"><animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" /></circle>}
          </g>
          <g className="cursor-pointer" onClick={() => onZoneClick({ title: 'Transit Hub P4', load: state.parking.find(p=>p.id==='P4')?.occupancy || 0, detail: 'Nominal: buses queued, immediate capacity' })}>
            <rect x="710" y="470" width="155" height="75" fill="#FFFFFF" stroke="#EAEAE7" />
            <rect x="710" y="470" width="4" height="75" fill="#10B981" />
            <text x="725" y="492" fontSize="11" fontWeight="600" letterSpacing="1">TRANSIT HUB P4</text>
            <text x="725" y="510" fontSize="12" fontWeight="500" fontFamily="JetBrains Mono" fill="#059669">{state.transport.reserve} BUSES IDLE</text>
            <text x="725" y="528" fontSize="10" fontFamily="JetBrains Mono" fill="#444748">Available relief: 450 cap</text>
          </g>

          {/* perimeter + concourse */}
          <ellipse cx="450" cy="310" rx="310" ry="190" fill="#FFFFFF" stroke="#EAEAE7" strokeWidth="1.5" />
          <ellipse cx="450" cy="310" rx="260" ry="155" fill="#F3F4F3" stroke="#EAEAE7" />

          {/* grandstands */}
          <path d="M 270 210 Q 450 160 630 210 L 600 240 Q 450 205 300 240 Z" fill="#E8E8E7" className="cursor-pointer hover:fill-sc-highest" onClick={() => onZoneClick({ title: 'North Grandstand', load: state.crowd.zones[0].density, detail: 'Stand occupancy' })} />
          <text x="450" y="222" textAnchor="middle" fontSize="10" fill="#6E6E6E" fontWeight="600" letterSpacing="2">NORTH STAND</text>
          <path d="M 270 410 Q 450 460 630 410 L 600 380 Q 450 415 300 380 Z" fill="#E8E8E7" className="cursor-pointer hover:fill-sc-highest" onClick={() => onZoneClick({ title: 'South Grandstand', load: state.crowd.zones[3].density, detail: 'Stand occupancy' })} />
          <text x="450" y="402" textAnchor="middle" fontSize="10" fill="#6E6E6E" fontWeight="600" letterSpacing="2">SOUTH STAND</text>

          {/* interior stands E/W as arcs */}
          <text x="250" y="315" textAnchor="middle" fontSize="10" fill="#6E6E6E" fontWeight="600" letterSpacing="2">WEST</text>
          <text x="655" y="315" textAnchor="middle" fontSize="10" fill="#6E6E6E" fontWeight="600" letterSpacing="2">EAST</text>

          {/* pitch */}
          <rect x="395" y="275" width="110" height="70" fill="#FBFBFA" stroke="#EAEAE7" />
          <text x="450" y="313" textAnchor="middle" fontSize="8" fill="#8E8E8E" letterSpacing="2">PITCH</text>

          {/* live gate pins — hc002 circular dial pins with critical pulse */}
          {state.gates.map((g, i) => {
            const angle = (i / state.gates.length) * Math.PI * 2 - Math.PI / 2;
            const cx = 450 + Math.cos(angle) * 310;
            const cy = 310 + Math.sin(angle) * 190;
            const col = gateColor(g);
            return (
              <g key={g.id} className="cursor-pointer" onClick={() => onZoneClick({ title: g.name, load: Math.round(g.load), detail: `Throughput ${g.throughput}/min · trend ${g.trend > 0 ? '+' : ''}${g.trend}/5min` })}>
                <circle cx={cx} cy={cy} r="17" fill="#FFFFFF" stroke={col} strokeWidth="1.5"
                  style={g.load >= g.critical ? { animation: 'ops-pulse 2s ease-in-out infinite', transformOrigin: `${cx}px ${cy}px` } : {}} />
                <text x={cx} y={cy - 2} textAnchor="middle" fontSize="8" fontWeight="700" fontFamily="JetBrains Mono" fill="#56645a">{g.id === 'W' ? 'WEST' : g.id}</text>
                <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="JetBrains Mono" fill={col}>{Math.round(g.load)}</text>
              </g>
            );
          })}

          {/* west surge annotation */}
          {west && west.load >= west.critical && (
            <g>
              <line x1="200" y1="485" x2="285" y2="395" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" />
              <text x="140" y="560" fontSize="10" fontFamily="JetBrains Mono" fill="#DC2626">SURGE TRACE → WEST GATE</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

/* ---------- decision drawer ---------- */

function DecisionDrawer({ incident, act, onClose }) {
  const [dispatching, setDispatching] = useState(false);
  if (!incident) return null;
  const r = incident.recommendation;
  return (
    <div className="ops-drawer absolute inset-y-0 right-0 w-[380px] bg-sc-lowest hairline-l z-30 overflow-y-auto" style={{ borderLeft: '1px solid var(--color-hairline)' }}>
      <div className="px-4 py-3 hairline-b flex items-center justify-between">
        <div>
          <MicroLabel className="text-critical-deep">{incident.id} · {incident.priority}</MicroLabel>
          <div className="text-[18px] font-medium mt-0.5">{incident.zone}</div>
        </div>
        <button onClick={onClose} className="text-ink-muted hover:text-ink text-[18px] leading-none px-1">×</button>
      </div>

      <div className="px-4 py-3 hairline-b grid grid-cols-3 gap-2">
        <div><MicroLabel className="text-ink-muted">Density</MicroLabel><div className="font-mono text-[13px] tnum mt-1">{incident.prediction.current}%</div></div>
        <div><MicroLabel className="text-ink-muted">Trend</MicroLabel><div className={`font-mono text-[13px] tnum mt-1 ${incident.prediction.trendPer5 >= 0 ? 'text-critical-deep' : 'text-signal-deep'}`}>{incident.prediction.trendPer5 >= 0 ? '↑' : '↓'}{Math.abs(incident.prediction.trendPer5)}/5m</div></div>
        <div><MicroLabel className="text-ink-muted">Critical in</MicroLabel><div className="font-mono text-[13px] tnum mt-1 text-critical-deep">{incident.prediction.timeToCritical}</div></div>
      </div>

      <div className="px-4 py-3 hairline-b">
        <MicroLabel className="text-ink-muted">Cause detected</MicroLabel>
        <div className="text-[13px] font-medium mt-1">{incident.cause.summary}</div>
        <div className="text-[12px] text-on-surface-variant mt-1">{incident.cause.detail}</div>
      </div>

      {/* prediction strip — hc002 tinted outcome panel */}
      <div className="px-4 py-3 hairline-b" style={{ background: 'var(--color-signal-tint)', color: '#376044' }}>
        <MicroLabel>Predicted outcome if you act now</MicroLabel>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-mono text-[13px]">{incident.prediction.current}%</span>
          <span>→</span>
          <span className="text-[17px] font-medium">{r.outcome}</span>
          <span className="font-mono text-[11px]">in {r.eta}</span>
        </div>
        <div className="font-mono text-[11px] mt-0.5">Confidence {r.confidence}%</div>
      </div>

      <div className="px-4 py-3 hairline-b">
        <MicroLabel className="text-ink-muted">Recommended response</MicroLabel>
        <ol className="mt-2 space-y-1.5">
          {r.actions.map((a, i) => (
            <li key={i} className="flex gap-2 text-[13px]">
              <span className="font-mono text-[11px] text-ink-muted mt-0.5">{i + 1}.</span>
              <span>{a.label}</span>
              <span className={`ml-auto font-mono text-[10px] uppercase px-1 py-0.5 h-fit ${a.kind === 'transport' ? 'text-caution-deep' : 'text-signal-deep'}`}
                style={{ border: '1px solid var(--color-hairline)' }}>{a.kind}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        {/* hc002 stability expectation meter */}
        <div>
          <div className="flex justify-between font-mono text-[10px] text-ink-muted uppercase tracking-wider mb-1">
            <span>Stabilization path</span><span>{incident.prediction.current}% → {r.outcome}</span>
          </div>
          <StabilityProgress pct={100 - incident.prediction.current} tone="signal" />
        </div>
        <SolidButton
          onClick={async () => { setDispatching(true); await act('dispatch', { incidentId: incident.id, actions: r.actions }); setDispatching(false); onClose(); }}
          disabled={dispatching}>
          {dispatching ? 'Dispatching…' : 'Apply recommended actions'}
        </SolidButton>
        <div className="grid grid-cols-2 gap-2">
          <GhostButton onClick={onClose}>Deploy manually</GhostButton>
          <GhostButton onClick={onClose}>Dismiss</GhostButton>
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function CommandCenterPage() {
  const { state, act, lastSync } = useEventState();
  const [selected, setSelected] = useState(null);   // schematic focus panel
  const [drawerIncident, setDrawerIncident] = useState(null);

  // auto-open the drawer when a new incident is detected
  useEffect(() => {
    if (!state) return;
    const inc = state.incidents.find((i) => i.status === 'DETECTED');
    if (inc) setDrawerIncident(inc.id);
  }, [state?.incidents?.length]); // eslint-disable-line

  if (!state) {
    return <div className="p-8 font-mono text-[12px] text-ink-muted">CONNECTING TO LIVE EVENT STATE…</div>;
  }

  const ev = state.event;
  const occupancy = ((state.crowd.inside / ev.capacity) * 100).toFixed(1);
  const openIncident = state.incidents.find((i) => i.id === drawerIncident && i.status !== 'RESOLVED');
  const syncSecs = lastSync ? Math.max(0, Math.round((Date.now() - lastSync.getTime()) / 1000)) : 0;

  return (
    <div className="flex flex-col w-full">
      {/* telemetry strip */}
      <section className="w-full bg-sc-lowest hairline-b px-4 py-4 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <div>
            <MicroLabel className="text-on-surface-variant">Inside Venue</MicroLabel>
            <div className="flex items-baseline gap-2">
              <Metric value={state.crowd.inside.toLocaleString()} />
              <span className="font-mono text-[12px] text-outline-variant">/ {ev.capacity.toLocaleString()}</span>
              <span className="font-mono text-[12px] text-signal-deep">+{state.crowd.enteredRate}/min</span>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-sc-high self-center" />
          <div>
            <MicroLabel className="text-on-surface-variant">Overall Occupancy</MicroLabel>
            <div className="flex items-baseline gap-2">
              <Metric value={`${occupancy}%`} />
              <span className="uppercase tracking-wider text-[10px] font-semibold text-on-surface-variant">Nominal capacity</span>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-sc-high self-center" />
          <div>
            <MicroLabel className="text-critical-deep flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-critical opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-critical" />
              </span>
              Active surge anomaly
            </MicroLabel>
            <div className="flex items-baseline gap-2">
              <Metric value={String(state.incidents.filter((i) => i.status !== 'RESOLVED').length).padStart(2, '0')} tone={state.incidents.some((i) => i.status !== 'RESOLVED') ? 'critical' : 'ink'} />
              <span className="text-[13px] font-medium">{state.incidents.find((i) => i.status !== 'RESOLVED')?.zone || 'All sectors nominal'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* demo spike button */}
          <button
            onClick={() => act('spike')}
            className="h-8 px-3 uppercase tracking-wider text-[10px] font-semibold flex items-center gap-1.5 transition-colors"
            style={{ border: '1px solid var(--color-critical)', color: 'var(--color-critical-deep)', background: '#fff' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-critical)'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fff'}>
            <span className="h-1.5 w-1.5 rounded-full bg-critical animate-pulse" />
            Simulate inflow spike
          </button>
          <GhostButton onClick={() => act('reset')}>Reset sim</GhostButton>
          <div className="flex items-center gap-1.5 bg-sc-low px-2 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            <span className="font-mono text-[12px] text-on-surface-variant">SYNC: <span className="text-ink font-medium tnum">{syncSecs}s ago</span></span>
          </div>
        </div>
      </section>

      {/* main split: canvas 68 / rail 32 */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12" style={{ minHeight: 'calc(100vh - 11rem)' }}>
        {/* spatial canvas */}
        <section className="lg:col-span-8 flex flex-col bg-canvas relative overflow-hidden hairline-r">
          <div className="w-full px-4 py-2 bg-sc-lowest/90 flex flex-wrap items-center justify-between gap-2 hairline-b z-20">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] uppercase tracking-wider font-medium">SCHEMATIC: LEVEL 0 GROUND &amp; CONCOURSE</span>
              <span className="font-mono text-[12px] text-on-surface-variant">· 1:1,250 VECTOR PROJECTION</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-1 uppercase tracking-wider text-[10px] font-semibold bg-ink text-canvas">Density Grid</span>
              <span className="px-2 py-1 uppercase tracking-wider text-[10px] font-semibold bg-sc-low text-on-surface-variant" style={{ border: '1px solid var(--color-hairline)' }}>Flow Vectors</span>
              <span className="px-2 py-1 uppercase tracking-wider text-[10px] font-semibold bg-sc-low text-on-surface-variant" style={{ border: '1px solid var(--color-hairline)' }}>P3 Surge Trace</span>
            </div>
          </div>
          <StadiumSchematic
            state={state}
            onZoneClick={(z) => setSelected(z)} />
          {/* schematic focus panel */}
          {selected && (
            <div className="absolute bottom-4 left-4 bg-sc-lowest p-3 z-30 w-72" style={{ border: '1px solid var(--color-hairline)' }}>
              <div className="flex items-center justify-between">
                <MicroLabel className="text-ink-muted">Zone inspection</MicroLabel>
                <button onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink px-1">×</button>
              </div>
              <div className="text-[15px] font-medium mt-1">{selected.title}</div>
              <div className="font-mono text-[12px] mt-1 tnum">{Math.round(selected.load)}% · {selected.detail}</div>
            </div>
          )}
          {/* hc002 map legend */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-3 py-2 bg-sc-lowest hairline-t z-10">
            {[['NORMAL','var(--color-signal)'],['WARNING','var(--color-caution)'],['CRITICAL','var(--color-critical)']].map(([l,c]) => (
              <span key={l} className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                <span className="uppercase tracking-wider text-[9px] font-semibold" style={{ color: c }}>{l}</span>
              </span>
            ))}
            <span className="ml-auto font-mono text-[8px] text-ink-muted">SCHEMATIC · LEVEL 0 · 1:1,250</span>
          </div>
          {/* decision drawer */}
          {openIncident && (
            <DecisionDrawer incident={openIncident} act={act} onClose={() => setDrawerIncident(null)} />
          )}
        </section>

        {/* alert rail */}
        <aside className="lg:col-span-4 flex flex-col bg-canvas">
          <SectionHead title="Alert rail" tag="LIVE" right={<span className="font-mono text-[10px] text-ink-muted">{state.incidents.filter((i) => i.status !== 'RESOLVED').length} OPEN</span>} />
          <div className="flex-1 overflow-y-auto">
            {state.incidents.length === 0 && (
              <div className="px-4 py-6 text-[13px] text-ink-muted">No active incidents. All systems normal.</div>
            )}
            {state.incidents.slice(0, 12).map((inc, ii) => (
              <div key={inc.id}
                onClick={() => inc.status !== 'RESOLVED' && setDrawerIncident(inc.id)}
                className={`ops-slam px-4 py-3 hairline-b cursor-pointer transition-colors ${inc.status === 'RESOLVED' ? 'opacity-60' : 'hover:bg-canvas-recessed'}`}
                style={{ animationDelay: `${Math.min(ii, 8) * 70}ms`, ...(inc.priority === 'CRITICAL' && inc.status !== 'RESOLVED' ? { borderLeft: '2px solid var(--color-critical)' } : {}) }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${inc.status === 'RESOLVED' ? 'bg-signal' : inc.priority === 'CRITICAL' ? 'bg-critical animate-pulse' : 'bg-caution'}`} />
                    <span className="font-medium text-[13px] truncate">{inc.zone}</span>
                  </div>
                  <StatusChip status={inc.priority === 'CRITICAL' ? 'CRITICAL' : 'ATTENTION'} label={inc.status} />
                </div>
                <div className="font-mono text-[11px] text-on-surface-variant mt-1 tnum">
                  {inc.id} · peak {inc.peakLoad}% · {inc.status === 'RESOLVED' ? `resolved ${inc.resolvedAt}` : `since ${inc.createdAt}`}
                </div>
                {inc.status === 'RESOLVED' && inc.summary && (
                  <div className="text-[12px] text-signal-deep mt-1">{inc.summary.outcome}</div>
                )}
              </div>
            ))}
          </div>
          {/* ops log */}
          <SectionHead title="Ops log" tag="STREAM" />
          <div className="max-h-44 overflow-y-auto">
            {state.log.slice(0, 12).map((l, i) => (
              <div key={i} className={`px-4 py-1.5 hairline-b flex items-baseline gap-2 ${i === 0 ? 'ops-slam' : ''}`}>
                <span className="font-mono text-[10px] text-ink-muted tnum">{l.t}</span>
                <span className={`text-[12px] ${l.kind === 'critical' ? 'text-critical-deep' : l.kind === 'warn' ? 'text-caution-deep' : l.kind === 'ok' ? 'text-signal-deep' : 'text-on-surface-variant'}`}>{l.msg}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
