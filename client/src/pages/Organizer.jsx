import { Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import Kpi from '../components/Kpi.jsx';
import LiveBadge from '../components/LiveBadge.jsx';
import LoadBar from '../components/LoadBar.jsx';
import CountUp from '../components/CountUp.jsx';
import ForecastChart, { ChartLegend } from '../components/ForecastChart.jsx';
import { pct, inr, kickoffTime, kickoffDate, shortName } from '../lib/format.js';

const STATUS_COLOR = { ok: '#34d399', approaching_capacity: '#fbbf24', critical: '#fb7185' };

function Panel({ title, right, children, className = '' }) {
  return (
    <section className={`panel rounded-2xl ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-3.5">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">{title}</h2>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function Organizer() {
  const { data, loading, error } = useApi(api.dashboard);
  const { data: forecast } = useApi(api.gateForecastSummary);
  const { data: flow } = useApi(() => api.crowdFlow(60));
  const { data: routing } = useApi(api.routingDecisions);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-ink-800" /></div>;
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error.message}</p>
      </div>
    );
  }

  const avgGate = data.gates.reduce((a, g) => a + g.load, 0) / data.gates.length;
  const avgParking = data.parking.reduce((a, p) => a + p.load, 0) / data.parking.length;
  const avgShuttle = data.shuttles.reduce((a, s) => a + s.load, 0) / data.shuttles.length;
  const peakGate = forecast?.gates ? [...forecast.gates].sort((a, b) => b.peakPct - a.peakPct)[0] : null;
  const flaggedGates = data.gates.filter((g) => g.status !== 'ok');
  const flaggedParking = data.parking.filter((p) => p.status !== 'ok');
  const overloadedParking = data.parking.filter((p) => p.load >= 0.85);
  const hotShuttles = data.shuttles.filter((s) => s.status !== 'ok');
  const decisions = routing?.decisions ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyber-400">
              STADIA Command Center
            </p>
            <LiveBadge label="Live event" />
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            DY Patil Stadium <span className="text-slate-600">·</span>{' '}
            <span className="text-gradient">Match-day orchestration</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {forecast
              ? `${forecast.match.home_team} vs ${forecast.match.away_team} · kickoff ${kickoffTime(forecast.match.kickoff_time)} · ${kickoffDate(forecast.match.kickoff_time)}`
              : 'Live zone-wise load, forecasts and revenue — all from booked tickets.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/organizer/gates" className="btn-ghost !px-4 !py-2.5 text-[13px]">🗺️ Crowd flow map</Link>
          <Link to="/organizer/shuttles" className="btn-ghost !px-4 !py-2.5 text-[13px]">🚐 Shuttle monitor</Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Total visitors" value={data.tickets} sub={`across ${data.matches} matches`} icon="🎫" status="info" delay={0} />
        <Kpi label="Venue load" value={Math.round(avgGate * 100)} suffix="%" sub="average gate load" icon="🏟️" status={avgGate >= 0.8 ? 'warn' : 'ok'} delay={0.05} format={(n) => n} />
        <Kpi label="Peak prediction" value={peakGate?.peakPct ?? 0} suffix="%" sub={peakGate ? `gate ${shortName(peakGate.name)} · ${peakGate.peakLabel}` : '—'} icon="📈" status={peakGate?.flagged ? 'critical' : 'ok'} delay={0.1} format={(n) => n} />
        <Kpi label="Active routes" value={flow?.segments?.length ?? 0} sub="parking · rail · shuttle paths" icon="🗺️" status="info" delay={0.15} format={(n) => n} />
        <Kpi label="Parking" value={Math.round(avgParking * 100)} suffix="%" sub={`${flaggedParking.length} zone${flaggedParking.length === 1 ? '' : 's'} flagged`} icon="🅿️" status={flaggedParking.length ? 'warn' : 'ok'} delay={0.2} format={(n) => n} />
        <Kpi label="Shuttles" value={Math.round(avgShuttle * 100)} suffix="%" sub={`${hotShuttles.length} slot${hotShuttles.length === 1 ? '' : 's'} near-full`} icon="🚐" status={hotShuttles.length ? 'warn' : 'ok'} delay={0.25} format={(n) => n} />
      </div>

      {/* gates */}
      <Panel
        className="mt-6"
        title="🚪 Gate monitoring — live load"
        right={
          <span className="text-[11px] text-slate-500">
            <span className="text-amber-300">≥ 80% warning</span> · <span className="text-rose-300">≥ 90% critical</span>
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...data.gates].sort((a, b) => b.load - a.load).map((g, i) => (
            <div
              key={g.id}
              className={`fade-up rounded-xl border p-4 transition ${
                g.status === 'critical'
                  ? 'border-rose-400/40 bg-rose-400/[0.06]'
                  : g.status === 'approaching_capacity'
                    ? 'border-amber-400/40 bg-amber-400/[0.06]'
                    : 'border-white/[0.07] bg-white/[0.02]'
              }`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[g.status] }} />
                  <span className="text-base font-black text-white">Gate {shortName(g.name)}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${g.side === 'local' ? 'bg-cyber-400/15 text-cyber-300' : 'bg-rose-400/15 text-rose-300'}`}>
                    {g.side}
                  </span>
                </div>
                <span className="tabular font-mono text-lg font-black text-white">{pct(g.load)}</span>
              </div>
              <div className="mt-3">
                <LoadBar load={g.load} status={g.status} />
                <div className="tabular mt-1.5 flex justify-between text-[10px] text-slate-500">
                  <span>{g.assigned.toLocaleString('en-IN')} / {g.capacity.toLocaleString('en-IN')} assigned</span>
                  {g.status !== 'ok' && <span className="font-bold text-amber-300">⚠ {g.status === 'critical' ? 'critical' : 'approaching capacity'}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* forecast + parking */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          title="📈 Predictive forecast — we don’t just see the crowd, we predict it"
          right={<ChartLegend gates={forecast?.gates ?? []} />}
        >
          {forecast ? (
            <>
              <ForecastChart gates={forecast.gates} />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                <p className="text-[11px] text-slate-500">
                  Modelled as tickets assigned × arrival curve · dashed line = 90% capacity ·
                  peak arrivals in the 90–30 min window
                </p>
                {peakGate && (
                  <Link to="/organizer/gates" className="btn-ghost !px-4 !py-2 !text-xs">
                    Review routing →
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="h-48 animate-pulse rounded-xl bg-ink-800" />
          )}
        </Panel>

        {/* parking intelligence */}
        <Panel title="🅿️ Parking intelligence" right={<span className="tabular text-[11px] text-slate-500">{data.parking.length} zones</span>}>
          <div className="space-y-3">
            {[...data.parking].sort((a, b) => b.load - a.load).map((p) => (
              <div key={p.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{p.name}</span>
                  <span className="tabular text-slate-400">
                    {p.assigned.toLocaleString('en-IN')} / {p.capacity.toLocaleString('en-IN')} ·{' '}
                    <b className={p.load >= 0.85 ? 'text-rose-300' : p.status !== 'ok' ? 'text-amber-300' : 'text-slate-300'}>
                      {pct(p.load)}
                    </b>
                  </span>
                </div>
                <LoadBar load={p.load} status={p.load >= 0.85 ? 'critical' : p.status} />
              </div>
            ))}
          </div>

          {overloadedParking.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-rose-400/35 bg-rose-400/[0.06]">
              <div className="flex items-center gap-2 border-b border-rose-400/20 bg-rose-400/10 px-3.5 py-2.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-300">Smart rerouting active</span>
              </div>
              <div className="space-y-2 p-3.5">
                {overloadedParking.map((p) => {
                  const next = [...data.parking].sort(
                    (a, b) => a.load - b.load,
                  )[0];
                  return (
                    <div key={p.id} className="rounded-lg bg-ink-950/60 p-3">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="tabular text-rose-300">{p.name} · {pct(p.load)} full</span>
                        <span className="text-slate-500">→</span>
                        <span className="tabular text-emerald-300">{next.name} · {pct(next.load)}</span>
                      </div>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                        New vehicle arrivals near {p.name} are being reassigned to {next.name} to
                        reduce congestion.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* routing intelligence + shuttles */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* routing intelligence feed */}
        <Panel
          title="⚡ Routing intelligence — live decision feed"
          right={
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
              <span className="live-dot" /> {data.rerouted.toLocaleString('en-IN')} visitors rerouted
            </span>
          }
        >
          {decisions.length ? (
            <div className="space-y-2">
              {decisions.map((d) => (
                <div key={d.ticketId} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-cyber-300">{d.ticketId}</span>
                    <span className="text-[10px] text-slate-600">{d.createdAt} UTC</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{d.reason}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                    ✓ Route updated
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-white/[0.03] p-4 text-sm text-slate-400">
              No reassignments in the recent window — all parking zones have capacity. New
              load-aware reassignments appear here live.
            </p>
          )}
        </Panel>

        {/* shuttle monitor */}
        <Panel
          title="🚐 Shuttle monitor"
          right={
            <Link to="/organizer/shuttles" className="text-[11px] font-bold text-cyber-300 hover:text-cyber-200">
              Full matrix →
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  <th className="pb-2 pr-4">Zone</th>
                  <th className="pb-2 pr-4">Departure</th>
                  <th className="pb-2 pr-4 text-right">Booked / Cap</th>
                  <th className="pb-2 pr-4">Load</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.shuttles.slice(0, 10).map((s) => (
                  <tr key={s.id} className="border-t border-white/[0.06]">
                    <td className="py-2.5 pr-4 font-bold text-white">{s.zone}</td>
                    <td className="tabular py-2.5 pr-4 font-mono text-xs text-slate-300">{s.departure_time}</td>
                    <td className="tabular py-2.5 pr-4 text-right text-slate-300">
                      {s.booked}/{s.capacity}
                    </td>
                    <td className="py-2.5 pr-4">
                      <LoadBar load={s.load} status={s.status} className="w-20" />
                    </td>
                    <td className="tabular py-2.5 text-xs font-bold">
                      <span className={s.status === 'ok' ? 'text-emerald-300' : s.status === 'critical' ? 'text-rose-300' : 'text-amber-300'}>
                        {pct(s.load)} {s.status !== 'ok' && '⚠'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* revenue */}
      <Panel className="mt-6" title="💰 Revenue & hospitality" right={<span className="text-[11px] text-slate-500">tracked via ticket-ID referrals</span>}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.06] p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-300">Hotel referrals</p>
            <p className="tabular mt-1.5 text-3xl font-black text-white">
              <CountUp value={data.revenue.hotel.total} format={(n) => inr(n)} />
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {data.revenue.hotel.count.toLocaleString('en-IN')} bookings · 8–13% partner commission
            </p>
          </div>
          <div className="rounded-xl border border-cyber-400/25 bg-cyber-400/[0.06] p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyber-300">Broadcast referrals</p>
            <p className="tabular mt-1.5 text-3xl font-black text-white">
              <CountUp value={data.revenue.airtel_tv.total} format={(n) => inr(n)} />
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {data.revenue.airtel_tv.count.toLocaleString('en-IN')} signups · ₹149 each
            </p>
          </div>
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Partner revenue</p>
            <p className="tabular mt-1.5 text-3xl font-black text-white">
              <CountUp value={data.revenue.grand_total} format={(n) => inr(n)} />
            </p>
            <p className="mt-1 text-xs text-slate-400">Running total · hotel + broadcast</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}