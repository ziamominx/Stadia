'use client';

// app/event-control/page.jsx — Matchday master parameters (flow.md Step 01).
// Envelope, per-gate thresholds, personnel quotas, emergency mode.

import React, { useState } from 'react';
import { useEventState } from '@/lib/useEventState';
import { MicroLabel, SectionHead, FlowBar, GhostButton, SolidButton } from '@/components/ui';

function ThresholdRow({ gate, overrides, onSave }) {
  const w = overrides?.warning ?? gate.warning;
  const c = overrides?.critical ?? gate.critical;
  const [warning, setWarning] = useState(w);
  const [critical, setCritical] = useState(c);
  const dirty = warning !== w || critical !== c;

  return (
    <tr className="hairline-b">
      <td className="px-4 py-2.5 font-medium text-[13px]">{gate.name}</td>
      <td className="px-4 py-2.5 font-mono text-[12px] tnum">{Math.round(gate.load)}%</td>
      <td className="px-4 py-2.5">
        <input type="number" min="0" max="100" value={warning}
          onChange={(e) => setWarning(Number(e.target.value))}
          className="h-7 w-16 px-2 font-mono text-[12px] bg-sc-lowest"
          style={{ border: '1px solid var(--color-hairline)' }} />
      </td>
      <td className="px-4 py-2.5">
        <input type="number" min="0" max="100" value={critical}
          onChange={(e) => setCritical(Number(e.target.value))}
          className="h-7 w-16 px-2 font-mono text-[12px] bg-sc-lowest"
          style={{ border: '1px solid var(--color-hairline)' }} />
      </td>
      <td className="px-4 py-2.5 w-36"><FlowBar pct={gate.load} warn={warning} crit={critical} /></td>
      <td className="px-4 py-2.5 text-right">
        {dirty
          ? <SolidButton onClick={() => onSave(gate.id, warning, critical)}>Save</SolidButton>
          : <span className="font-mono text-[10px] text-ink-muted uppercase">{overrides ? 'custom' : 'default'}</span>}
      </td>
    </tr>
  );
}

export default function EventControlPage() {
  const { state, act, lastSync } = useEventState();
  const [emergencyArmed, setEmergencyArmed] = useState(false);

  if (!state) return <div className="p-8 font-mono text-[12px] text-ink-muted">CONNECTING…</div>;

  const ev = state.event;
  const occ = state.crowd.inside / ev.capacity;

  return (
    <div className="flex flex-col w-full">
      {/* masthead */}
      <section className="w-full bg-sc-lowest hairline-b px-4 py-4">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-sc-high font-mono text-[10px] tracking-wider uppercase font-semibold">SYS.CONFIG // 06-CTL</span>
              <span className="inline-flex items-center gap-1.5 uppercase text-[10px] font-semibold text-signal-deep tracking-wider">
                <span className="h-2 w-2 rounded-full bg-signal animate-pulse" /> LIVE RUNTIME CONFIGURATION SYNCED
              </span>
            </div>
            <h1 className="text-[40px] leading-[44px] font-light tracking-[-0.03em] uppercase">Event Control</h1>
            <p className="text-[13px] text-on-surface-variant max-w-3xl">
              Matchday master parameters · venue boundary topology · dynamic optical thresholds · fleet &amp; ground force quotas
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GhostButton onClick={() => act('reset')}>Export schema</GhostButton>
            <SolidButton onClick={() => act('broadcast', { message: 'Operational parameters committed and broadcast to all mesh nodes' })}>
              + Commit &amp; broadcast parameters
            </SolidButton>
          </div>
        </div>

        {/* runtime strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 mt-4 pt-4 hairline-t">
          {[
            { l: 'Event Runtime', v: 'Q3 IN PROGRESS', s: `Matchday live · tick ${ev.tick}` },
            { l: 'Expected / Peak', v: `${ev.expected.toLocaleString()}`, s: `/ ${ev.capacity.toLocaleString()} pax` },
            { l: 'Active Sectors', v: '4', s: 'N · E · W · S stands' },
            { l: 'Gates Online', v: `${state.gates.length}`, s: 'All turnstile banks synced' },
            { l: 'Emergency Mode', v: state.control.emergencyMode ? 'ACTIVE' : 'STANDBY', s: state.control.emergencyMode ? 'All units alerted' : 'Armed toggle below', tone: state.control.emergencyMode ? 'text-critical' : '' },
          ].map((m) => (
            <div key={m.l} className="flex flex-col px-4 first:pl-0 py-1 hairline-r last:border-r-0">
              <MicroLabel className="text-on-surface-variant">{m.l}</MicroLabel>
              <div className={`text-[18px] font-medium mt-1 tnum ${m.tone || ''}`}>{m.v}</div>
              <span className="font-mono text-[11px] text-on-surface-variant mt-0.5">{m.s}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* capacity envelope + thresholds */}
        <section className="lg:col-span-7 bg-canvas hairline-r">
          <SectionHead title="Capacity envelope" tag="EVENT IDENTITY" />
          <div className="px-4 py-4 hairline-b">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-[44px] leading-[48px] font-light tracking-[-0.04em] tnum">{state.crowd.inside.toLocaleString()}</span>
                <span className="font-mono text-[12px] text-ink-muted">/ {ev.capacity.toLocaleString()} pax · {(occ * 100).toFixed(1)}%</span>
              </div>
              <span className="font-mono text-[11px] text-ink-muted">{ev.date} · {ev.kickoff} · {ev.venue}</span>
            </div>
            <div className="mt-3 relative">
              <FlowBar pct={occ * 100} warn={80} crit={95} />
              <div className="absolute -top-1 h-3 w-px bg-caution" style={{ left: '80%' }} />
            </div>
            <div className="flex justify-between mt-1.5 font-mono text-[10px] text-ink-muted uppercase tracking-wider">
              <span>Concourse comfort floor</span><span>warning 80% · critical 95%</span>
            </div>
          </div>

          <SectionHead title="Crowd rules — gate thresholds" tag="DYNAMIC OPTICAL" right={<span className="font-mono text-[10px] text-ink-muted">EDITS PROPAGATE ON SAVE</span>} />
          <table className="w-full">
            <thead>
              <tr className="hairline-b">
                {['Gate', 'Load', 'Warning %', 'Critical %', 'Live', ''].map((h) => (
                  <th key={h} className="px-4 py-2 text-left uppercase tracking-wider text-[10px] font-semibold text-ink-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.gates.map((g) => (
                <ThresholdRow key={g.id} gate={g} overrides={state.control.thresholdOverrides[g.id]}
                  onSave={(id, w, c) => act('thresholds', { gateId: id, warning: w, critical: c })} />
              ))}
            </tbody>
          </table>
        </section>

        {/* force quotas + emergency */}
        <aside className="lg:col-span-5 flex flex-col bg-canvas">
          <SectionHead title="Ground force quotas" tag="PERSONNEL TARGETS" />
          <div>
            {Object.entries(state.personnel).map(([k, v]) => (
              <div key={k} className="px-4 py-3 hairline-b">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium capitalize">{k}</span>
                  <span className="font-mono text-[12px] tnum text-on-surface-variant">{v.deployed} / {v.total} deployed</span>
                </div>
                <div className="mt-1.5"><FlowBar pct={(v.deployed / v.total) * 100} warn={85} crit={95} /></div>
                <div className="font-mono text-[10px] text-signal-deep mt-1">{v.available} in reserve</div>
              </div>
            ))}
          </div>

          <SectionHead title="Transport quotas" tag="FLEET" />
          <div className="px-4 py-3 hairline-b">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium">Bus fleet</span>
              <span className="font-mono text-[12px] tnum text-on-surface-variant">{state.transport.buses.length} active · {state.transport.reserve} reserve</span>
            </div>
          </div>

          <SectionHead title="Emergency authority" tag="L5 COMMAND" />
          <div className="px-4 py-4">
            {!state.control.emergencyMode ? (
              <div>
                <p className="text-[12px] text-on-surface-variant mb-3">
                  Activating emergency mode alerts every surface in the system — command, ground, transport, signage — and switches the global posture to EMERGENCY. Requires armed confirmation.
                </p>
                {!emergencyArmed ? (
                  <SolidButton tone="danger" onClick={() => setEmergencyArmed(true)}>Arm emergency activation</SolidButton>
                ) : (
                  <div className="flex gap-2">
                    <SolidButton tone="danger" onClick={() => { act('emergency', { on: true }); setEmergencyArmed(false); }}>Activate event emergency</SolidButton>
                    <GhostButton onClick={() => setEmergencyArmed(false)}>Stand down</GhostButton>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3" style={{ border: '1px solid var(--color-critical)' }}>
                <div>
                  <MicroLabel className="text-critical-deep">Emergency mode active</MicroLabel>
                  <div className="text-[12px] text-on-surface-variant mt-0.5">All units alerted · L5 command in force</div>
                </div>
                <SolidButton onClick={() => act('emergency', { on: false })}>Clear emergency</SolidButton>
              </div>
            )}
          </div>

          <SectionHead title="Last commit" tag="AUDIT" />
          <div className="px-4 py-3 font-mono text-[11px] text-on-surface-variant">
            {lastSync ? lastSync.toLocaleTimeString() : '—'} · {ev.tick} ticks · thresholds {Object.keys(state.control.thresholdOverrides).length} customized
          </div>
        </aside>
      </div>
    </div>
  );
}
