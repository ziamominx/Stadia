'use client';

// app/ground/page.jsx — Ground Operations (flow.md Step 09).
// Force readiness strip, sector deployment, live task feed with the
// RECEIVE → ACCEPT → DEPLOY → EXECUTE → UPDATE loop.

import React, { useState } from 'react';
import { useEventState } from '@/lib/useEventState';
import { MicroLabel, StatusChip, SectionHead, FlowBar, GhostButton, SolidButton } from '@/components/ui';

const TASK_FLOW = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];

export default function GroundPage() {
  const { state, act } = useEventState();
  const [filter, setFilter] = useState('ALL');
  if (!state) return <div className="p-8 font-mono text-[12px] text-ink-muted">CONNECTING…</div>;

  const p = state.personnel;
  const total = p.security.total + p.police.total + p.volunteers.total + p.medical.total;
  const deployed = p.security.deployed + p.police.deployed + p.volunteers.deployed + p.medical.deployed;
  const available = total - deployed;

  const tasks = state.tasks.ground.filter((t) => filter === 'ALL' || t.status === filter);
  const west = state.crowd.zones.find((z) => z.id === 'west');

  return (
    <div className="flex flex-col w-full">
      {/* editorial metrics strip */}
      <section className="w-full bg-sc-lowest hairline-b px-4 py-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[28px] leading-[34px] font-bold tracking-[-0.02em]">GROUND</span>
            <span className="uppercase tracking-wider text-[10px] font-semibold bg-ink text-canvas px-1.5 py-0.5">TACTICAL OPS-03</span>
          </div>
          <p className="font-mono text-[12px] text-on-surface-variant uppercase tracking-wider mt-1">
            LIVE PERSONNEL COORDINATION &amp; TACTICAL DEPLOYMENT // SECTOR MAP 03-GRD
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          {[
            { l: 'Total Force', v: total, s: 'On station readiness', tone: '' },
            { l: 'Deployed', v: deployed, s: 'Active in sectors', tone: '' },
            { l: 'Available', v: available, s: 'Reserve standby', tone: 'text-signal-deep' },
            { l: 'Responding', v: state.tasks.ground.filter((t) => t.status === 'IN_PROGRESS').length, s: 'En route to tasks', tone: 'text-critical' },
            { l: 'Coverage', v: `${Math.round((deployed / total) * 100)}%`, s: 'Perimeter security', tone: '' },
          ].map((m) => (
            <div key={m.l} className="flex flex-col">
              <MicroLabel className="text-ink-muted">{m.l}</MicroLabel>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className={`text-[28px] leading-[34px] font-medium tracking-[-0.02em] tnum ${m.tone}`}>{m.v}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">{m.s}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* deployment schematic */}
        <section className="lg:col-span-7 bg-canvas hairline-r">
          <SectionHead title="Tactical venue deployment" tag="SECTOR 03-GRD" right={
            <div className="flex gap-1">
              {['ALL', 'SECURITY', 'VOLUNTEERS', 'MEDICAL'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2 py-1 uppercase tracking-wider text-[10px] font-semibold ${filter === f ? 'bg-ink text-canvas' : 'bg-sc-low text-on-surface-variant'}`}
                  style={{ border: '1px solid var(--color-hairline)' }}>{f}</button>
              ))}
            </div>} />
          <div className="p-4 flex items-center justify-center">
            <svg viewBox="0 0 640 420" className="w-full max-w-[640px]">
              <rect width="640" height="420" fill="#F7F7F5" />
              {/* radial sectors */}
              {state.gates.slice(0, 8).map((g, i) => {
                const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                const cx = 320 + Math.cos(angle) * 205;
                const cy = 210 + Math.sin(angle) * 150;
                const color = g.load >= g.critical ? '#EF4444' : g.load >= g.warning ? '#F59E0B' : '#10B981';
                const staff = g.id === 'W' ? p.volunteers.deployed % 20 + 6 : Math.max(2, Math.round(g.throughput / 300));
                return (
                  <g key={g.id}>
                    <rect x={cx - 42} y={cy - 16} width="84" height="32" fill="#FFFFFF" stroke={color} strokeWidth="1.5" />
                    <text x={cx} y={cy - 3} textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono">{g.id === 'W' ? 'WEST' : `G${g.id}`}</text>
                    <text x={cx} y={cy + 9} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#444748">{staff} STAFF</text>
                    <line x1="320" y1="210" x2={cx} y2={cy} stroke="#EAEAE7" strokeWidth="1" />
                  </g>
                );
              })}
              <ellipse cx="320" cy="210" rx="150" ry="105" fill="#EEEEED" stroke="#EAEAE7" />
              <rect x="285" y="185" width="70" height="50" fill="#FBFBFA" stroke="#EAEAE7" />
              <text x="320" y="214" textAnchor="middle" fontSize="8" fill="#8E8E8E" letterSpacing="2">PITCH</text>
            </svg>
          </div>
          {/* personnel grid */}
          <SectionHead title="Personnel readiness" tag="ROSTER" />
          <div className="grid grid-cols-2 xl:grid-cols-4">
            {[
              { k: 'security', label: 'Security' }, { k: 'police', label: 'Police' },
              { k: 'volunteers', label: 'Volunteers' }, { k: 'medical', label: 'Medical' },
            ].map(({ k, label }) => (
              <div key={k} className="px-4 py-3 hairline-b hairline-r">
                <MicroLabel className="text-ink-muted">{label}</MicroLabel>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-mono text-[15px] tnum">{p[k].deployed}</span>
                  <span className="font-mono text-[11px] text-ink-muted">/ {p[k].total}</span>
                </div>
                <div className="mt-1.5"><FlowBar pct={(p[k].deployed / p[k].total) * 100} warn={85} crit={95} /></div>
                <div className="font-mono text-[10px] text-signal-deep mt-1">{p[k].available} available</div>
              </div>
            ))}
          </div>
        </section>

        {/* task feed */}
        <aside className="lg:col-span-5 flex flex-col bg-canvas">
          <SectionHead title="Task feed" tag="LIVE DISPATCH" right={
            <span className="font-mono text-[10px] text-ink-muted">{state.tasks.ground.filter((t) => t.status === 'PENDING').length} PENDING</span>} />
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 560 }}>
            {tasks.length === 0 && (
              <div className="px-4 py-6 text-[13px] text-ink-muted">No tasks in this view. Feed is quiet.</div>
            )}
            {tasks.map((t, ti) => (
              <div key={t.id} className="ops-slam px-4 py-3 hairline-b"
                style={{ animationDelay: `${Math.min(ti, 8) * 60}ms`, ...(t.priority === 'CRITICAL' && t.status !== 'COMPLETED' ? { borderLeft: '2px solid var(--color-critical)' } : {}) }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${t.status === 'PENDING' ? 'bg-critical animate-pulse' : t.status === 'COMPLETED' ? 'bg-signal' : 'bg-caution'}`} />
                    <MicroLabel className={t.status === 'PENDING' ? 'text-critical-deep' : 'text-ink'}>{t.status === 'PENDING' ? 'NEW TASK — HIGH PRIORITY' : `TASK ${t.status.replace('_', ' ')}`}</MicroLabel>
                  </div>
                  <span className="font-mono text-[10px] text-ink-muted tnum">{t.createdAt}</span>
                </div>
                <div className="text-[15px] font-medium mt-1.5">{t.task}</div>
                {/* hc002 task progression strip */}
                <div className="flex gap-0.5 mt-3">
                  {TASK_FLOW.map((step) => {
                    const active = TASK_FLOW.indexOf(t.status) >= TASK_FLOW.indexOf(step) && t.status !== 'PENDING' || (step === 'PENDING' && true);
                    const done = t.status === 'COMPLETED' || (step === 'PENDING') || (step === 'ACCEPTED' && t.status !== 'PENDING');
                    return (
                      <span key={step}
                        className={`flex-1 text-center text-[8px] uppercase tracking-wider py-1.5 ${done ? 'text-white' : 'text-ink-muted'}`}
                        style={{ background: done ? 'var(--color-signal)' : 'var(--color-sc-low)', ...(step === TASK_FLOW[TASK_FLOW.indexOf(t.status)] && t.status !== 'COMPLETED' ? { outline: '1px solid var(--color-signal)' } : {}) }}>
                        {step.replace('_', ' ')}
                      </span>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div><MicroLabel className="text-ink-muted">Zone</MicroLabel><div className="text-[12px] mt-0.5">{t.zone}</div></div>
                  <div><MicroLabel className="text-ink-muted">From</MicroLabel><div className="text-[12px] mt-0.5">{t.from}</div></div>
                </div>
                <div className="text-[12px] text-on-surface-variant mt-1">Reason: {t.reason}</div>
                {t.flagged && <div className="text-[12px] text-caution-deep mt-1">⚑ {t.flagged}</div>}
                <div className="flex gap-2 mt-3">
                  {t.status === 'PENDING' && (
                    <>
                      <SolidButton onClick={() => act('ground.accept', { id: t.id })}>Accept</SolidButton>
                      <GhostButton onClick={() => act('task.flag', { id: t.id, kind: 'ground', issue: 'Resource conflict on approach route' })}>Flag issue</GhostButton>
                    </>
                  )}
                  {t.status === 'IN_PROGRESS' && (
                    <SolidButton onClick={() => act('ground.complete', { id: t.id })}>Mark deployed &amp; complete</SolidButton>
                  )}
                  {t.status === 'COMPLETED' && <StatusChip status="NORMAL" label="COMPLETE" />}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
