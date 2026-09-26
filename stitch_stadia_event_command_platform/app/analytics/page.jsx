'use client';

// app/analytics/page.jsx — Analytics as a visual dashboard (flow.md Step 14).
// Panel grid of hand-rolled SVG charts in the hc002 editorial style:
// trajectory, gate grid + sparklines, personnel donut, zone bars, task funnel,
// fleet + parking bars, incident scatter, compact outcome reports.

import React from 'react';
import { useEventState } from '@/lib/useEventState';
import { MicroLabel, SectionHead, EmptyState, GhostButton, Rise, CountUp } from '@/components/ui';

const C = { green: '#087855', amber: '#925b00', red: '#bc2029', ink: '#56645a', grid: '#dfe3dc', muted: '#818b80' };

function fmtLag(secs) {
  if (secs == null) return '—';
  return secs < 90 ? `${secs}s` : `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, '0')}s`;
}

/* ---------------- chart primitives ---------------- */

function Sparkline({ data, color = C.green, height = 26 }) {
  if (!data || data.length < 2) return <div className="font-mono text-[9px] text-ink-muted">—</div>;
  const W = 100;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${26 - Math.max(1, (v / 100) * height) + 2}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${height + 2}`} preserveAspectRatio="none" style={{ width: '100%', height: height + 2 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke"
        className="ops-draw" style={{ '--len': 140 }} />
    </svg>
  );
}

function HBar({ label, value, max = 100, sub, color = C.green, delay = 0 }) {
  return (
    <div className="px-4 py-2.5 hairline-b last:border-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-medium truncate">{label}</span>
        <span className="font-mono text-[11px] tnum" style={{ color }}><CountUp value={value} suffix="%" /></span>
      </div>
      <div className="mt-1.5" style={{ height: 6, background: 'var(--color-sc-high)' }}>
        <div className="ops-grow" style={{ '--stagger': `${delay}ms`, height: 6, width: `${Math.min(100, (value / max) * 100)}%`, background: color, transition: 'width .5s' }} />
      </div>
    </div>
  );
}

/* ---------------- charts ---------------- */

function TrajectoryChart({ data }) {
  if (!data || data.length < 2) return <div className="px-4 py-10 text-center text-[12px] text-ink-muted">Collecting samples…</div>;
  const W = 760, H = 190, PAD = 10;
  const x = (i) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const y = (v) => H - PAD - (v / 100) * (H - PAD * 2);
  const line = (k) => data.map((d, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(d[k]).toFixed(1)}`).join(' ');
  const area = `${line('west')} L ${x(data.length - 1).toFixed(1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;
  const warnY = y(75), critY = y(90);
  let pi = 0; data.forEach((d, i) => { if (d.west > data[pi].west) pi = i; });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 230 }}>
      <rect x="0" y={critY} width={W} height={Math.max(0, H - PAD - critY)} fill="rgba(188,32,41,0.06)" className="ops-fade" />
      {warnY > critY && <rect x="0" y={critY} width={W} height={warnY - critY} fill="rgba(146,91,0,0.06)" className="ops-fade" />}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={PAD} y1={y(v)} x2={W - PAD} y2={y(v)} stroke={C.grid} strokeWidth="0.6" />
          <text x={W - PAD + 2} y={y(v) + 3} fontSize="8" fontFamily="JetBrains Mono" fill={C.muted}>{v}</text>
        </g>
      ))}
      <line x1={PAD} y1={warnY} x2={W - PAD} y2={warnY} stroke={C.amber} strokeWidth="0.8" strokeDasharray="4 4" opacity="0.6" />
      <line x1={PAD} y1={critY} x2={W - PAD} y2={critY} stroke={C.red} strokeWidth="0.8" strokeDasharray="4 4" opacity="0.6" />
      <path d={area} fill="rgba(8,120,85,0.08)" className="ops-fade" />
      <path d={line('occupancy')} fill="none" stroke={C.ink} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" className="ops-draw" style={{ '--len': 1600, '--stagger': '200ms' }} />
      <path d={line('west')} fill="none" stroke={C.green} strokeWidth="1.8" className="ops-draw" style={{ '--len': 1600 }} />
      <circle cx={x(pi)} cy={y(data[pi].west)} r="3.5" fill={C.red} className="ops-pop" style={{ '--stagger': '1200ms' }} />
      <text x={Math.min(x(pi) + 7, W - 70)} y={Math.max(y(data[pi].west) - 8, 12)} fontSize="9" fontFamily="JetBrains Mono" fill={C.red} fontWeight="600" className="ops-fade" style={{ '--stagger': '400ms' }}>
        PEAK {data[pi].west}%
      </text>
    </svg>
  );
}

function PersonnelDonut({ personnel }) {
  const roles = Object.entries(personnel);
  const total = roles.reduce((a, [, r]) => a + r.total, 0);
  const deployed = roles.reduce((a, [, r]) => a + r.deployed, 0);
  const R = 52, CIRC = 2 * Math.PI * R;
  let acc = 0;
  const colors = [C.green, C.ink, C.amber, C.red];
  return (
    <div className="flex items-center gap-5 px-4 py-4">
      <svg viewBox="0 0 140 140" style={{ width: 130, height: 130, flexShrink: 0 }}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-sc-high)" strokeWidth="14" />
        {roles.map(([, r], i) => {
          const frac = r.deployed / total;
          const seg = (
            <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={colors[i % colors.length]} strokeWidth="14"
              strokeDasharray={`${(frac * CIRC).toFixed(1)} ${(CIRC - frac * CIRC).toFixed(1)}`}
              strokeDashoffset={-acc * CIRC} transform="rotate(-90 70 70)"
              className="ops-pop" style={{ '--stagger': `${150 + i * 120}ms` }} />
          );
          acc += frac;
          return seg;
        })}
        <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="300" fill="#18201b" className="ops-fade" style={{ '--stagger': '650ms' }}>{Math.round((deployed / total) * 100)}%</text>
        <text x="70" y="82" textAnchor="middle" fontSize="7" letterSpacing="1.5" fill={C.muted} className="ops-fade" style={{ '--stagger': '750ms' }}>DEPLOYED</text>
      </svg>
      <div className="flex-1">
        {roles.map(([k, r], i) => (
          <div key={k} className="flex items-center gap-2 py-1.5 hairline-b last:border-0">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-[12px] capitalize flex-1">{k}</span>
            <span className="font-mono text-[11px] tnum text-ink-muted">{r.deployed}/{r.total}</span>
            <span className="font-mono text-[10px] tnum w-10 text-right" style={{ color: r.available < 8 ? C.red : C.green }}>{r.available} free</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GateGrid({ gates }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4">
      {gates.map((g, gi) => {
        const col = g.load >= g.critical ? C.red : g.load >= g.warning ? C.amber : C.green;
        return (
          <div key={g.id} className="ops-rise px-4 py-3 hairline-b hairline-r" style={{ '--stagger': `${gi * 45}ms`, ...(g.id === 'W' ? { background: 'var(--color-sc-low)' } : {}) }}>
            <div className="flex items-baseline justify-between">
              <MicroLabel className="text-ink-muted">{g.id === 'W' ? 'WEST' : `GATE ${g.id}`}</MicroLabel>
              <span className="font-mono text-[16px] font-medium tnum" style={{ color: col }}><CountUp value={Math.round(g.load)} suffix="%" /></span>
            </div>
            <Sparkline data={g.history} color={col} />
            <div className="flex justify-between font-mono text-[9px] text-ink-muted tnum mt-1">
              <span>pk {Math.round(g.peak ?? g.load)}%</span>
              <span>{g.throughput.toLocaleString()}/min</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IncidentScatter({ incidents, tick }) {
  if (!incidents.length) return null;
  const W = 620, H = 170, PAD = 26;
  const stamp = (t) => { if (!t) return 0; const [h, m, s] = t.split(':').map(Number); return h * 3600 + m * 60 + s; };
  const xs = incidents.map((i) => stamp(i.createdAt));
  const x0 = Math.min(...xs), x1 = Math.max(...xs, x0 + 60);
  const x = (t) => PAD + ((stamp(t) - x0) / Math.max(1, x1 - x0)) * (W - PAD * 2);
  const y = (v) => H - PAD - (v / 100) * (H - PAD * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {[25, 50, 75, 90].map((v) => (
        <g key={v}>
          <line x1={PAD} y1={y(v)} x2={W - PAD} y2={y(v)} stroke={C.grid} strokeWidth="0.6" />
          <text x={4} y={y(v) + 3} fontSize="8" fontFamily="JetBrains Mono" fill={C.muted}>{v}</text>
        </g>
      ))}
      {incidents.map((inc, ii) => {
        const resolved = inc.status === 'RESOLVED';
        const col = inc.priority === 'CRITICAL' ? C.red : C.amber;
        return (
          <g key={inc.id}>
            <line x1={x(inc.createdAt)} y1={y(inc.peakLoad)} x2={x(inc.createdAt)} y2={H - PAD} stroke={col} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" className="ops-fade" style={{ '--stagger': `${200 + ii * 150}ms` }} />
            <circle cx={x(inc.createdAt)} cy={y(inc.peakLoad)} r="6" fill={resolved ? col : 'transparent'} stroke={col} strokeWidth="1.5" className="ops-pop" style={{ '--stagger': `${300 + ii * 150}ms` }} />
            <text x={x(inc.createdAt)} y={y(inc.peakLoad) - 10} textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill={col} className="ops-fade" style={{ '--stagger': `${450 + ii * 150}ms` }}>{inc.id}</text>
          </g>
        );
      })}
      <text x={PAD} y={H - 8} fontSize="8" fontFamily="JetBrains Mono" fill={C.muted}>FIRST INCIDENT</text>
      <text x={W - PAD} y={H - 8} textAnchor="end" fontSize="8" fontFamily="JetBrains Mono" fill={C.muted}>TICK {tick}</text>
    </svg>
  );
}

function TaskFunnel({ tasks }) {
  const g = tasks.ground, t = tasks.transport;
  const stages = [
    { l: 'Dispatched to Ground', v: g.length, c: C.ink },
    { l: 'Accepted / in progress', v: g.filter((x) => x.status === 'IN_PROGRESS' || x.status === 'ACCEPTED').length, c: C.amber },
    { l: 'Completed', v: g.filter((x) => x.status === 'COMPLETED').length, c: C.green },
    { l: 'Route changes confirmed', v: t.filter((x) => x.status === 'CONFIRMED').length, c: C.green },
    { l: 'Flagged by field', v: g.filter((x) => x.flagged).length + t.filter((x) => x.flagged).length, c: C.red },
  ];
  const max = Math.max(1, ...stages.map((s) => s.v));
  return (
    <div className="py-1">
      {stages.map((s, si) => (
        <div key={s.l} className="px-4 py-2.5 hairline-b last:border-0">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px]">{s.l}</span>
            <span className="font-mono text-[13px] font-medium tnum" style={{ color: s.c }}><CountUp value={s.v} /></span>
          </div>
          <div className="mt-1" style={{ height: 6, background: 'var(--color-sc-high)' }}>
            <div className="ops-grow" style={{ '--stagger': `${si * 90}ms`, height: 6, width: `${(s.v / max) * 100}%`, background: s.c, transition: 'width .5s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- page ---------------- */

export default function AnalyticsPage() {
  const { state, act } = useEventState();
  if (!state) return <div className="p-8 font-mono text-[12px] text-ink-muted">CONNECTING…</div>;

  const ev = state.event;
  const resolved = state.incidents.filter((i) => i.status === 'RESOLVED');
  const active = state.incidents.filter((i) => i.status !== 'RESOLVED');
  const withLag = resolved.filter((r) => r.summary?.responseLagSecs != null);
  const avgLag = withLag.length ? Math.round(withLag.reduce((a, r) => a + r.summary.responseLagSecs, 0) / withLag.length) : null;
  const avgRes = resolved.length ? Math.round(resolved.reduce((a, r) => a + (r.summary?.resolutionSecs ?? 0), 0) / resolved.length) : null;
  const escalations = state.incidents.filter((i) => (i.timeline || []).some((t) => t.label === 'Escalated')).length;
  const breachCount = state.gates.filter((g) => (g.peak ?? g.load) >= g.critical).length;
  const diverted = state.transport.buses.filter((b) => b.status === 'DIVERTED').length;

  const verdict = !state.incidents.length
    ? { label: 'UNTESTED', cls: 'text-ink-muted', note: 'No incidents yet — trigger the demo surge to exercise the chain.' }
    : escalations > 0
      ? { label: 'ESCALATED', cls: 'text-critical', note: `${escalations} incident(s) rebounded past critical before stabilizing.` }
      : active.length
        ? { label: 'RESPONDING', cls: 'text-caution-deep', note: `${active.length} incident(s) live — outcomes publish on resolution.` }
        : { label: 'ALL CLEAR', cls: 'text-signal-deep', note: `${resolved.length} incident(s), all resolved without escalation.` };

  return (
    <div className="flex flex-col w-full">
      {/* masthead + verdict */}
      <section className="w-full bg-sc-lowest hairline-b px-4 py-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[24px] leading-[30px] font-medium tracking-[-0.02em]">ANALYTICS</span>
          <span className="font-mono text-[11px] text-signal-deep uppercase tracking-widest">/ 07-ANT</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <MicroLabel className="text-ink-muted">Event verdict</MicroLabel>
            <div className={`text-[18px] font-medium leading-tight ${verdict.cls}`}>{verdict.label}</div>
          </div>
          <div className="h-8 w-px bg-hairline" />
          <p className="text-[11px] text-on-surface-variant max-w-[280px] leading-[1.5]">{verdict.note}</p>
          <GhostButton onClick={() => act('reset')}>Reset</GhostButton>
          <GhostButton onClick={() => act('spike')}>Inject surge</GhostButton>
        </div>
      </section>

      {/* KPI tiles */}
      <section className="w-full bg-sc-lowest hairline-b grid grid-cols-3 md:grid-cols-6">
        {[
          { l: 'Attendance', v: state.crowd.inside, n: true, s: `${((state.crowd.inside / ev.capacity) * 100).toFixed(1)}% of cap` },
          { l: 'Response Lag', v: avgLag != null ? fmtLag(avgLag) : '—', s: 'detected → dispatched', c: C.green },
          { l: 'Resolution', v: avgRes != null ? fmtLag(avgRes) : '—', s: 'detected → resolved', c: C.green },
          { l: 'Escalations', v: String(escalations), s: 'rebounds past critical', c: escalations ? C.red : C.muted },
          { l: 'Gates Peaked', v: `${breachCount}/${state.gates.length}`, s: 'hit critical this event', c: breachCount ? C.amber : C.muted },
          { l: 'Buses Diverted', v: String(diverted), s: 'on diversion orders', c: diverted ? C.amber : C.muted },
        ].map((m, mi) => (
          <Rise key={m.l} delay={mi * 60} className="px-4 py-3 hairline-r">
            <MicroLabel className="text-ink-muted">{m.l}</MicroLabel>
            <div className="text-[26px] leading-[32px] font-light tracking-[-0.03em] tnum" style={{ color: m.c === C.muted ? 'var(--color-ink)' : m.c }}>
              {m.n ? <CountUp value={m.v} /> : m.v}
            </div>
            <span className="font-mono text-[9px] text-ink-muted">{m.s}</span>
          </Rise>
        ))}
      </section>

      {/* row 1: trajectory + donut */}
      <Rise delay={250} className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <section className="lg:col-span-8 bg-sc-lowest hairline-r hairline-b">
          <SectionHead title="Density trajectory" tag="WEST GATE VS OCCUPANCY · % OF CAPACITY" right={
            <span className="flex gap-3 font-mono text-[9px] text-ink-muted">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5" style={{ background: C.green }} />WEST</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5" style={{ background: C.ink, opacity: 0.6 }} />OCCUPANCY</span>
            </span>} />
          <div className="px-3 py-2"><TrajectoryChart data={state.analytics?.trajectory} /></div>
        </section>
        <section className="lg:col-span-4 bg-sc-lowest hairline-b">
          <SectionHead title="Personnel deployment" tag="FOUR AGENCIES" />
          <PersonnelDonut personnel={state.personnel} />
        </section>
      </Rise>

      {/* row 2: gate grid + zones/parking */}
      <Rise delay={400} className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <section className="lg:col-span-8 bg-sc-lowest hairline-r hairline-b">
          <SectionHead title="Gate load grid" tag="CURRENT · 30-TICK SPARK · PEAK" />
          <GateGrid gates={state.gates} />
        </section>
        <aside className="lg:col-span-4 bg-sc-lowest hairline-b flex flex-col">
          <SectionHead title="Zone density" tag="STANDS" />
          {state.crowd.zones.map((z, zi) => (
            <HBar key={z.id} label={z.name} value={z.density} delay={zi * 80} color={z.density >= 90 ? C.red : z.density >= 75 ? C.amber : C.green} />
          ))}
          <SectionHead title="Parking occupancy" tag="LOTS" />
          {state.parking.map((p, pi) => (
            <HBar key={p.id} label={p.name} value={p.occupancy} delay={pi * 80} color={p.occupancy >= 90 ? C.red : p.occupancy >= 80 ? C.amber : C.green} />
          ))}
        </aside>
      </Rise>

      {/* row 3: scatter + funnel */}
      <Rise delay={550} className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <section className="lg:col-span-7 bg-sc-lowest hairline-r hairline-b">
          <SectionHead title="Incident map" tag="WHEN × PEAK SEVERITY · ○ LIVE ● RESOLVED" />
          <div className="px-3 py-2">
            {state.incidents.length
              ? <IncidentScatter incidents={state.incidents} tick={ev.tick} />
              : <EmptyState symbol="◫" title="No incidents plotted" note="Each incident appears at its detection time and peak severity once triggered." />}
          </div>
        </section>
        <section className="lg:col-span-5 bg-sc-lowest hairline-b">
          <SectionHead title="Response funnel" tag="TASKS THROUGH THE LOOP" />
          <TaskFunnel tasks={state.tasks} />
        </section>
      </Rise>

      {/* row 4: compact outcome reports */}
      <section className="w-full bg-sc-lowest hairline-b">
        <SectionHead title="Outcome reports" tag="ONE LINE PER INCIDENT" right={<span className="font-mono text-[10px] text-ink-muted">{resolved.length} RESOLVED · {active.length} LIVE</span>} />
        {state.incidents.length === 0 && (
          <EmptyState symbol="◫" title="No incident data yet" note="Trigger the demo surge on the Command Center (or above) to generate the first report." />
        )}
        {state.incidents.map((inc) => {
          const sum = inc.summary;
          return (
            <div key={inc.id} className="px-4 py-2.5 hairline-b flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${inc.status === 'RESOLVED' ? 'bg-signal' : 'bg-caution animate-pulse'}`} />
              <span className="font-mono text-[12px] font-medium w-20">{inc.id}</span>
              <span className="text-[13px] font-medium w-36 truncate">{inc.zone}</span>
              {sum ? (
                <>
                  <span className="font-mono text-[11px] tnum text-critical">peak {sum.peak}%</span>
                  <span className="text-ink-muted text-[11px]">→</span>
                  <span className="font-mono text-[11px] tnum text-signal-deep">{sum.final}%</span>
                  <span className="font-mono text-[11px] tnum text-ink-muted">−{Math.max(0, sum.peak - sum.final)} pts</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5" style={{ border: '1px solid var(--color-hairline)' }}>responded {fmtLag(sum.responseLagSecs)}</span>
                  <span className="font-mono text-[10px] text-ink-muted">lifecycle {fmtLag(sum.resolutionSecs)}</span>
                  <span className="ml-auto text-[11px] text-on-surface-variant truncate max-w-[340px]">
                    {sum.ground.length + sum.transport.length} action(s): {[...sum.ground, ...sum.transport].join(' · ')}
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-on-surface-variant">live — peak so far {inc.peakLoad}%, status {inc.status}</span>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
