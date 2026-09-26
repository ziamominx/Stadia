'use client';

// app/crowd/page.jsx — Crowd Intelligence (flow.md Steps 03–05).
// Live densities, trend velocity, time-to-critical countdown, animated flow.

import React from 'react';
import { useEventState } from '@/lib/useEventState';
import { MicroLabel, Metric, StatusChip, SectionHead, FlowBar, GhostButton, SolidButton } from '@/components/ui';

export default function CrowdPage() {
  const { state, act } = useEventState();
  if (!state) return <div className="p-8 font-mono text-[12px] text-ink-muted">CONNECTING…</div>;

  const ev = state.event;
  const occupancy = ((state.crowd.inside / ev.capacity) * 100).toFixed(1);
  const west = state.crowd.zones.find((z) => z.id === 'west');

  return (
    <div className="flex flex-col w-full">
      {/* metrics strip */}
      <section className="w-full bg-sc-lowest hairline-b px-4 py-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { l: 'Inside Venue', v: state.crowd.inside.toLocaleString(), s: `${occupancy}% of cap` },
          { l: 'Occupancy', v: `${occupancy}%`, s: 'Nominal envelope' },
          { l: 'Inflow', v: `+${state.crowd.enteredRate}/min`, s: 'All gates combined' },
          { l: 'Outflow', v: '0/min', s: 'No egress released' },
          { l: 'Avg Gate Wait', v: '3m 12s', s: 'Turnstile median' },
          { l: 'Ingress Corridors', v: '8 active', s: '1 degraded · West' },
        ].map((m) => (
          <div key={m.l} className="flex flex-col pl-2 hairline-l first:border-l-0">
            <MicroLabel className="text-on-surface-variant">{m.l}</MicroLabel>
            <div className="text-[28px] leading-[34px] font-medium tracking-[-0.02em] tnum mt-1">{m.v}</div>
            <span className="font-mono text-[11px] text-on-surface-variant mt-0.5">{m.s}</span>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* zone matrix */}
        <section className="lg:col-span-7 bg-canvas hairline-r">
          <SectionHead title="Zone density matrix" tag="LIVE VELOCITY" right={<span className="font-mono text-[10px] text-ink-muted">TICK {ev.tick}</span>} />
          <table className="w-full">
            <thead>
              <tr className="hairline-b">
                {['Zone', 'Density', 'Trend', 'Status', 'Load'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left uppercase tracking-wider text-[10px] font-semibold text-ink-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.crowd.zones.map((z) => (
                <tr key={z.id} className="hairline-b hover:bg-canvas-recessed transition-colors">
                  <td className="px-4 py-3 font-medium text-[13px]">{z.name}</td>
                  <td className="px-4 py-3 font-mono text-[13px] tnum">{z.density}%</td>
                  <td className={`px-4 py-3 font-mono text-[13px] tnum ${z.trend > 0.6 ? 'text-critical-deep' : z.trend > 0.3 ? 'text-caution-deep' : 'text-signal-deep'}`}>
                    {z.trend > 0 ? '↑' : '↓'} {Math.abs(z.trend).toFixed(1)} / 5min
                  </td>
                  <td className="px-4 py-3"><StatusChip status={z.status} /></td>
                  <td className="px-4 py-3 w-40"><FlowBar pct={z.density} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <SectionHead title="Gate throughput" tag="PEOPLE / MIN" />
          <table className="w-full">
            <thead>
              <tr className="hairline-b">
                {['Gate', 'Side', 'Throughput', 'Load', 'Warning', 'Critical'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left uppercase tracking-wider text-[10px] font-semibold text-ink-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.gates.map((g) => (
                <tr key={g.id} className="hairline-b hover:bg-canvas-recessed transition-colors"
                  style={g.load >= g.critical ? { borderLeft: '2px solid var(--color-critical)' } : {}}>
                  <td className="px-4 py-2.5 font-medium text-[13px]">{g.name}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] uppercase text-on-surface-variant">{g.side}</td>
                  <td className="px-4 py-2.5 font-mono text-[13px] tnum">{g.throughput.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><StatusChip status={g.load >= g.critical ? 'CRITICAL' : g.load >= g.warning ? 'ATTENTION' : 'NORMAL'} label={`${Math.round(g.load)}%`} /></td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-ink-muted tnum">{g.warning}%</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-ink-muted tnum">{g.critical}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* prediction rail */}
        <aside className="lg:col-span-5 flex flex-col bg-canvas">
          <SectionHead title="Prediction engine" tag="T-+15 MIN" />
          <div className="px-4 py-4 hairline-b">
            <MicroLabel className="text-ink-muted">West Gate trajectory</MicroLabel>
            <div className="mt-2 flex items-end gap-1 h-16">
              {(state.intelligence.history.slice(-24).map((h) => h.west) || []).map((v, i) => (
                <div key={i} className="flex-1" style={{ height: `${v}%`, background: v >= 90 ? 'var(--color-critical)' : v >= 75 ? 'var(--color-caution)' : 'var(--color-signal)', opacity: 0.85, minHeight: 2 }} />
              ))}
              {state.intelligence.history.length === 0 && <span className="font-mono text-[11px] text-ink-muted">Collecting samples…</span>}
            </div>
            <div className="font-mono text-[11px] text-ink-muted mt-1 tnum">last {state.intelligence.history.length} ticks · {west ? Math.round(west.density) : '—'}% now</div>
          </div>

          {state.incidents.filter((i) => i.status !== 'RESOLVED').slice(0, 2).map((inc) => (
            <div key={inc.id} className="px-4 py-4 hairline-b">
              <div className="flex items-center justify-between">
                <MicroLabel className="text-critical-deep">{inc.id} · PREDICTED PEAK {inc.prediction.peakEstimate}%</MicroLabel>
              </div>
              <div className="text-[13px] font-medium mt-1">{inc.zone}</div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div><MicroLabel className="text-ink-muted">Time to critical</MicroLabel><div className="font-mono text-[15px] tnum text-critical-deep mt-0.5">{inc.prediction.timeToCritical}</div></div>
                <div><MicroLabel className="text-ink-muted">Trend</MicroLabel><div className="font-mono text-[15px] tnum mt-0.5">↑{inc.prediction.trendPer5}/5m</div></div>
              </div>
              <div className="mt-3"><SolidButton onClick={() => act('spike')}>Inject test surge</SolidButton></div>
            </div>
          ))}

          {state.incidents.every((i) => i.status === 'RESOLVED') && (
            <div className="px-4 py-6 text-[13px] text-ink-muted hairline-b">
              No active predictions. Trend velocity within envelope across all sectors.
            </div>
          )}

          <SectionHead title="Root cause analysis" tag="LIVE" />
          <div className="px-4 py-4 space-y-3">
            {state.incidents.filter((i) => i.status !== 'RESOLVED').slice(0, 1).map((inc) => (
              <div key={inc.id}>
                <div className="text-[13px] font-medium">{inc.cause.summary}</div>
                <div className="text-[12px] text-on-surface-variant mt-1">{inc.cause.detail}</div>
                {inc.cause.contributors.map((c) => (
                  <div key={c} className="font-mono text-[11px] text-caution-deep mt-1">· {c}</div>
                ))}
              </div>
            ))}
            {state.incidents.every((i) => i.status === 'RESOLVED') && (
              <div className="text-[13px] text-ink-muted">No anomalies to attribute. Arrival curve nominal for T-{90 - Math.min(89, Math.round(ev.tick / 2))}min.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
