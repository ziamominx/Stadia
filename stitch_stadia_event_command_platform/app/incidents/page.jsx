'use client';

// app/incidents/page.jsx — Incident lifecycle (flow.md Steps 06, 12, 13).
// Feed + detail split, 5-step progression tracker, full timeline, manual report.

import React, { useState } from 'react';
import { useEventState } from '@/lib/useEventState';
import { MicroLabel, StatusChip, SectionHead, GhostButton, SolidButton, EmptyState } from '@/components/ui';

const LIFECYCLE = ['DETECTED', 'RESPONDING', 'STABILIZING', 'RESOLVED'];
const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'CRITICAL', label: 'Critical' },
  { id: 'ATTENTION', label: 'Attention' },
  { id: 'RESOLVED', label: 'Resolved' },
];

export default function IncidentsPage() {
  const { state, act } = useEventState();
  const [filter, setFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualZone, setManualZone] = useState('W');
  const [manualNote, setManualNote] = useState('');

  if (!state) return <div className="p-8 font-mono text-[12px] text-ink-muted">CONNECTING…</div>;

  const visible = state.incidents.filter((i) =>
    filter === 'ALL' ? true : filter === 'RESOLVED' ? i.status === 'RESOLVED' : i.priority === filter
  );
  const selected = state.incidents.find((i) => i.id === (selectedId || visible[0]?.id));
  const active = state.incidents.filter((i) => i.status !== 'RESOLVED');
  const resolved = state.incidents.filter((i) => i.status === 'RESOLVED');

  return (
    <div className="flex flex-col w-full">
      {/* macro context header */}
      <section className="w-full bg-sc-lowest hairline-b px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[28px] leading-[34px] font-medium tracking-[-0.02em]">INCIDENTS</span>
              <span className="font-mono text-[12px] text-signal-deep uppercase tracking-widest font-medium">/ MODEL 05-INC</span>
            </div>
            <p className="uppercase tracking-widest text-[10px] font-semibold text-on-surface-variant mt-0.5">
              Tactical incident lifecycle &amp; multi-agency response coordination
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-sc-low" style={{ border: '1px solid var(--color-hairline)' }}>
              <span className="h-2 w-2 rounded-full bg-critical animate-pulse" />
              <span className="uppercase tracking-wider text-[10px] font-semibold text-critical-deep">RESPONSE PROTOCOL // LEVEL 2</span>
            </div>
            <div className="inline-flex" style={{ border: '1px solid var(--color-hairline)' }}>
              {FILTERS.map((f, i) => {
                const count = f.id === 'ALL' ? state.incidents.length
                  : f.id === 'RESOLVED' ? resolved.length
                  : active.filter((x) => x.priority === f.id).length;
                return (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    className={`px-3 py-1 uppercase tracking-wider text-[10px] font-semibold ${i < FILTERS.length - 1 ? 'hairline-r' : ''} ${filter === f.id ? 'bg-sc-lowest text-ink font-semibold' : 'text-on-surface-variant hover:text-ink'}`}>
                    {f.label} ({count})
                  </button>
                );
              })}
            </div>
            <SolidButton onClick={() => setManualOpen((v) => !v)}>+ Report manual incident</SolidButton>
          </div>
        </div>

        {/* editorial metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 hairline-t">
          {[
            { l: 'Active Incidents', v: String(active.length), s: `${active.filter((i) => i.priority === 'CRITICAL').length} critical · ${active.filter((i) => i.priority !== 'CRITICAL').length} attention`, tone: '' },
            { l: 'Critical Severity', v: String(active.filter((i) => i.priority === 'CRITICAL').length), s: active.find((i) => i.priority === 'CRITICAL')?.zone || 'None', tone: 'text-critical' },
            { l: 'Attention Required', v: String(active.filter((i) => i.priority !== 'CRITICAL').length), s: 'Monitoring watch', tone: 'text-caution-deep' },
            { l: 'Resolved Today', v: String(resolved.length), s: 'Avg 9 min lifecycle' },
            { l: 'Detection Lag', v: '<1m', s: 'Tick evaluation' },
          ].map((m) => (
            <div key={m.l} className="flex flex-col hairline-r last:border-r-0 pr-4 last:pr-0">
              <MicroLabel className={`uppercase tracking-widest ${m.tone || 'text-on-surface-variant'}`}>{m.l}</MicroLabel>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-[36px] leading-[44px] font-light tracking-[-0.04em] tnum ${m.tone || ''}`}>{m.v}</span>
              </div>
              <span className="text-[12px] text-on-surface-variant mt-0.5 truncate">{m.s}</span>
            </div>
          ))}
        </div>

        {manualOpen && (
          <div className="mt-4 p-3 flex flex-wrap items-end gap-2 bg-canvas-recessed" style={{ border: '1px solid var(--color-hairline)' }}>
            <div className="flex flex-col gap-1">
              <MicroLabel className="text-ink-muted">Zone</MicroLabel>
              <select value={manualZone} onChange={(e) => setManualZone(e.target.value)}
                className="h-8 px-2 bg-sc-lowest text-[13px]" style={{ border: '1px solid var(--color-hairline)' }}>
                {state.gates.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-64">
              <MicroLabel className="text-ink-muted">Observation</MicroLabel>
              <input value={manualNote} onChange={(e) => setManualNote(e.target.value)} placeholder="What did you observe?"
                className="h-8 px-2 bg-sc-lowest text-[13px]" style={{ border: '1px solid var(--color-hairline)' }} />
            </div>
            <SolidButton onClick={() => { act('report', { zone: manualZone, note: manualNote }); setManualNote(''); setManualOpen(false); }}>
              Log incident
            </SolidButton>
          </div>
        )}
      </section>

      {/* two-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* feed */}
        <section className="lg:col-span-5 bg-canvas hairline-r xl:col-span-5">
          <SectionHead title="Incident feed" tag="TACTICAL" right={<span className="font-mono text-[10px] text-ink-muted">{visible.length} SHOWN</span>} />
          <div className="overflow-y-auto" style={{ maxHeight: 640 }}>
            {visible.length === 0 && (
              <EmptyState
                symbol="✓"
                title={filter === 'RESOLVED' ? 'Nothing resolved yet' : 'No incidents in this view'}
                note={filter === 'RESOLVED'
                  ? 'Resolved incidents publish their full outcome summary here — peak density, response taken, and final state.'
                  : 'The lifecycle engine is watching every gate against its thresholds. Breaches create incidents here automatically, with cause and recommended response attached.'} />
            )}
            {visible.map((inc, ii) => (
              <div key={inc.id} onClick={() => setSelectedId(inc.id)}
                className={`ops-slam px-4 py-3 hairline-b cursor-pointer transition-colors ${selected?.id === inc.id ? 'bg-sc-lowest' : 'hover:bg-canvas-recessed'}`}
                style={{ animationDelay: `${Math.min(ii, 8) * 60}ms`, ...(selected?.id === inc.id ? { borderLeft: '2px solid var(--color-ink)' } : {}) }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${inc.status === 'RESOLVED' ? 'bg-signal' : inc.priority === 'CRITICAL' ? 'bg-critical animate-pulse' : 'bg-caution'}`} />
                    <span className="font-medium text-[13px] truncate">{inc.zone}</span>
                  </div>
                  <StatusChip status={inc.priority === 'CRITICAL' ? 'CRITICAL' : 'ATTENTION'} label={inc.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div><MicroLabel className="text-ink-muted">Incident</MicroLabel><div className="font-mono text-[12px] tnum">{inc.id}</div></div>
                  <div><MicroLabel className="text-ink-muted">Peak</MicroLabel><div className="font-mono text-[12px] tnum">{inc.peakLoad}%</div></div>
                  <div><MicroLabel className="text-ink-muted">Created</MicroLabel><div className="font-mono text-[12px] tnum">{inc.createdAt}</div></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* detail */}
        <section className="lg:col-span-7 bg-canvas">
          {!selected && (
            <EmptyState
              symbol="◎"
              title="Select an incident"
              note="Pick any incident from the feed to open its full lifecycle — cause attribution, prediction, dispatched response, and the complete audit timeline."
            />
          )}
          {selected && (
            <>
              <SectionHead title={`${selected.id} · ${selected.zone}`} tag={selected.status} right={
                selected.status === 'RESOLVED'
                  ? <StatusChip status="NORMAL" label="RESOLVED ✓" />
                  : <StatusChip status={selected.priority === 'CRITICAL' ? 'CRITICAL' : 'ATTENTION'} label={selected.status} />} />

              {/* lifecycle tracker */}
              <div className="px-4 py-4 hairline-b">
                <MicroLabel className="text-ink-muted">Lifecycle progression</MicroLabel>
                <div className="flex items-center mt-3">
                  {LIFECYCLE.map((step, i) => {
                    const idx = LIFECYCLE.indexOf(selected.status);
                    const done = idx >= i;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                          <span className={`h-3 w-3 rounded-full ${done ? 'bg-signal' : 'bg-sc-high'}`}
                            style={done && i === idx ? { boxShadow: '0 0 0 3px rgba(16,185,129,.2)' } : {}} />
                          <span className={`mt-1.5 text-[9px] uppercase tracking-wider font-semibold ${done ? 'text-ink' : 'text-ink-muted'}`}>{step}</span>
                        </div>
                        {i < LIFECYCLE.length - 1 && (
                          <div className="flex-1 h-px mx-2 mb-4" style={{ background: idx > i ? 'var(--color-signal)' : 'var(--color-hairline)' }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* cause + prediction */}
              <div className="grid grid-cols-2">
                <div className="px-4 py-4 hairline-b hairline-r">
                  <MicroLabel className="text-ink-muted">Cause</MicroLabel>
                  <div className="text-[13px] font-medium mt-1">{selected.cause.summary}</div>
                  <div className="text-[12px] text-on-surface-variant mt-1">{selected.cause.detail}</div>
                </div>
                <div className="px-4 py-4 hairline-b">
                  <MicroLabel className="text-ink-muted">Prediction</MicroLabel>
                  <div className="font-mono text-[13px] tnum mt-1">{selected.prediction.current}% → peak {selected.prediction.peakEstimate}% · {selected.prediction.trendPer5 >= 0 ? '↑' : '↓'}{Math.abs(selected.prediction.trendPer5)}/5m</div>
                  <div className="font-mono text-[12px] text-critical-deep mt-0.5">Critical in {selected.prediction.timeToCritical}</div>
                </div>
              </div>

              {/* response */}
              {selected.recommendation && (
                <div className="px-4 py-4 hairline-b">
                  <MicroLabel className="text-ink-muted">Response dispatched</MicroLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selected.recommendation.actions.map((a, i) => (
                      <span key={i} className="font-mono text-[11px] px-2 py-1" style={{ border: '1px solid var(--color-hairline)' }}>{a.label}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* summary when resolved */}
              {selected.summary && (
                <div className="px-4 py-4 hairline-b bg-sc-lowest">
                  <MicroLabel className="text-signal-deep">Outcome</MicroLabel>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div><MicroLabel className="text-ink-muted">Peak</MicroLabel><div className="font-mono text-[15px] tnum">{selected.summary.peak}%</div></div>
                    <div><MicroLabel className="text-ink-muted">Final</MicroLabel><div className="font-mono text-[15px] tnum text-signal-deep">{selected.summary.final}%</div></div>
                    <div><MicroLabel className="text-ink-muted">Duration</MicroLabel><div className="font-mono text-[15px] tnum">{selected.summary.durationMin} min</div></div>
                  </div>
                  <div className="text-[12px] text-on-surface-variant mt-2">{selected.summary.outcome}</div>
                </div>
              )}

              {/* timeline */}
              <SectionHead title="Timeline" tag="AUDIT" />
              <div>
                {selected.timeline.map((t, i) => (
                  <div key={i} className="px-4 py-2 hairline-b flex items-baseline gap-3">
                    <span className="font-mono text-[12px] text-ink-muted tnum w-14">{t.t}</span>
                    <span className="text-[13px] font-medium w-44">{t.label}</span>
                    <span className="text-[12px] text-on-surface-variant">{t.detail}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
