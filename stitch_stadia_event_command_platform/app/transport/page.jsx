'use client';

// app/transport/page.jsx — Transport Operations (flow.md Step 10).
// Fleet strip, live route board with DIVERTED states, route-change
// confirmation queue, reserve coach deployment.

import React from 'react';
import { useEventState } from '@/lib/useEventState';
import { MicroLabel, StatusChip, SectionHead, FlowBar, GhostButton, SolidButton } from '@/components/ui';

export default function TransportPage() {
  const { state, act } = useEventState();
  if (!state) return <div className="p-8 font-mono text-[12px] text-ink-muted">CONNECTING…</div>;

  const t = state.transport;
  const activeBuses = t.buses.filter((b) => b.status === 'ACTIVE').length;
  const diverted = t.buses.filter((b) => b.status === 'DIVERTED').length;
  const pendingChanges = state.tasks.transport.filter((x) => x.status === 'PENDING');

  return (
    <div className="flex flex-col w-full">
      {/* macro header + telemetry */}
      <section className="w-full bg-sc-lowest hairline-b px-4 py-4">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[28px] leading-[34px] font-medium tracking-[-0.02em] uppercase">Transport Operations</h1>
              <span className="uppercase tracking-widest text-[10px] font-semibold px-1.5 py-0.5 bg-sc-high text-ink">MOBILITY OPS-04</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sc text-signal-deep uppercase text-[10px] font-semibold tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" /> MESH ACTIVE
              </span>
            </div>
            <p className="font-mono text-[12px] text-on-surface-variant uppercase tracking-tight">
              LIVE MOBILITY COORDINATION &amp; ARTERIAL FLEET DISPATCH // CORRIDOR MODEL 04-TRN
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-sc-low px-2 py-1.5 gap-2" style={{ border: '1px solid var(--color-hairline)' }}>
              <MicroLabel className="text-on-surface-variant">Staging Depot 2:</MicroLabel>
              <span className="font-mono text-[12px] font-medium">{t.reserve} COACHES HOT-STANDBY</span>
            </div>
            <SolidButton onClick={() => act('broadcast', { message: `Reserve deployment — ${Math.min(4, t.reserve)} coaches staged from Depot 2` })}>
              Deploy 4 reserve coaches
            </SolidButton>
          </div>
        </div>

        {/* telemetry metric row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 mt-4 pt-4 hairline-t">
          {[
            { l: 'Active Buses', v: `${activeBuses + diverted}`, s: `${t.reserve} standby reserve` },
            { l: 'Diverted', v: String(diverted), s: 'Route change executed', tone: diverted ? 'text-caution-deep' : '' },
            { l: 'Active Cabs', v: `${t.cabs.active}`, s: `${t.cabs.total - t.cabs.active} available in ranks` },
            { l: 'P3 Queue', v: `${Math.round((state.parking.find((p) => p.id === 'P3')?.occupancy || 0) * 16)}`, s: 'Awaiting dispatch' },
            { l: 'P4 Capacity', v: `${Math.round(100 - (state.parking.find((p) => p.id === 'P4')?.occupancy || 0))}%`, s: 'Absorption headroom' },
            { l: 'Avg Headway', v: '4m 20s', s: 'Fleet spacing nominal' },
          ].map((m) => (
            <div key={m.l} className="flex flex-col px-3 first:pl-0 hairline-r last:border-r-0">
              <MicroLabel className="text-on-surface-variant">{m.l}</MicroLabel>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-[36px] leading-[44px] font-light tracking-[-0.04em] tnum ${m.tone || ''}`}>{m.v}</span>
              </div>
              <span className="font-mono text-[11px] text-on-surface-variant mt-1">{m.s}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* live route board */}
        <section className="lg:col-span-7 bg-canvas hairline-r">
          <SectionHead title="Live route board" tag="FLEET MESH" right={<span className="font-mono text-[10px] text-ink-muted">{t.buses.length} VEHICLES</span>} />
          <table className="w-full">
            <thead>
              <tr className="hairline-b">
                {['Vehicle', 'Route', 'Load', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left uppercase tracking-wider text-[10px] font-semibold text-ink-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.buses.map((b) => (
                <tr key={b.id} className="hairline-b hover:bg-canvas-recessed transition-colors"
                  style={b.status === 'DIVERTED' ? { borderLeft: '2px solid var(--color-caution)' } : {}}>
                  <td className="px-4 py-3 font-mono text-[13px] font-medium">{b.id}</td>
                  <td className="px-4 py-3 text-[13px]">{b.route}</td>
                  <td className="px-4 py-3 w-36">
                    <div className="font-mono text-[12px] tnum mb-1">{b.load}/{b.cap}</div>
                    <FlowBar pct={(b.load / b.cap) * 100} warn={85} crit={95} />
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'DIVERTED'
                      ? <StatusChip status="ATTENTION" label="● DIVERTED" />
                      : <StatusChip status="NORMAL" label="ACTIVE" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <SectionHead title="Pickup zone queues" tag="LIVE" />
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {state.parking.map((p) => (
              <div key={p.id} className="px-4 py-3 hairline-b hairline-r">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">{p.name}</span>
                  <span className="font-mono text-[12px] tnum text-on-surface-variant">{Math.round(p.occupancy)}%</span>
                </div>
                <div className="mt-1.5"><FlowBar pct={p.occupancy} warn={80} crit={90} /></div>
                <div className="font-mono text-[10px] text-ink-muted mt-1">{p.capacity} veh capacity</div>
              </div>
            ))}
          </div>
        </section>

        {/* route change queue */}
        <aside className="lg:col-span-5 flex flex-col bg-canvas">
          <SectionHead title="Route change queue" tag="FROM EXECUTIVE" right={
            <span className="font-mono text-[10px] text-ink-muted">{pendingChanges.length} PENDING</span>} />
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 620 }}>
            {state.tasks.transport.length === 0 && (
              <div className="px-4 py-6 text-[13px] text-ink-muted">No route instructions. Corridors nominal.</div>
            )}
            {state.tasks.transport.map((task, ti) => (
              <div key={task.id} className="ops-slam px-4 py-3 hairline-b"
                style={{ animationDelay: `${Math.min(ti, 8) * 60}ms`, ...(task.status === 'PENDING' ? { borderLeft: '2px solid var(--color-critical)' } : {}) }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${task.status === 'PENDING' ? 'bg-critical animate-pulse' : 'bg-signal'}`} />
                    <MicroLabel className={task.status === 'PENDING' ? 'text-critical-deep' : 'text-ink'}>
                      {task.status === 'PENDING' ? 'ROUTE CHANGE — HIGH PRIORITY' : `CONFIRMED · ${task.id}`}
                    </MicroLabel>
                  </div>
                  <span className="font-mono text-[10px] text-ink-muted tnum">{task.createdAt}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[13px]">
                  <span className="font-mono">{task.oldRoute}</span>
                  <span className="text-ink-muted">→</span>
                  <span className="font-mono font-medium">{task.newRoute}</span>
                </div>
                <div className="font-mono text-[12px] mt-1 text-on-surface-variant">{task.buses.join(' · ')}</div>
                <div className="text-[12px] text-on-surface-variant mt-1">Reason: {task.reason}</div>
                {task.status === 'PENDING' ? (
                  <div className="flex gap-2 mt-3">
                    <SolidButton onClick={() => act('transport.confirm', { id: task.id })}>Confirm route change</SolidButton>
                    <GhostButton onClick={() => act('task.flag', { id: task.id, kind: 'transport', issue: 'P4 approach congestion risk — requesting review' })}>Flag issue</GhostButton>
                  </div>
                ) : (
                  <div className="mt-3"><StatusChip status="NORMAL" label="BUSES DIVERTED" /></div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
