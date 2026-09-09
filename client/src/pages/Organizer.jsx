import { Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import LoadBar, { StatusPill } from '../components/LoadBar.jsx';
import { pct, inr } from '../lib/format.js';

function Card({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-navy-900/70 ${className}`}>
      <div className="border-b border-slate-800 px-5 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function Organizer() {
  const { data, loading, error } = useApi(api.dashboard);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-72 animate-pulse rounded-2xl bg-navy-900" /></div>;
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error.message}</p>
      </div>
    );
  }

  const flaggedGates = data.gates.filter((g) => g.status !== 'ok').length;
  const flaggedParking = data.parking.filter((p) => p.status !== 'ok').length;
  const fullShuttles = data.shuttles.filter((s) => s.status !== 'ok').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-saffron-500">Organizer command center</p>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Match-day orchestration</h1>
          <p className="mt-1 text-sm text-slate-400">
            Live zone-wise load, congestion flags and revenue tracking — all from booked tickets.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/organizer/gates" className="rounded-lg border border-slate-600 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
            🗺️ Gate map
          </Link>
          <Link to="/organizer/shuttles" className="rounded-lg border border-slate-600 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
            🚐 Shuttle zones
          </Link>
        </div>
      </div>

      {/* stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: 'Tickets sold', v: data.tickets.toLocaleString('en-IN'), icon: '🎫', sub: `across ${data.matches} matches` },
          { l: 'Referral revenue', v: inr(data.revenue.grand_total), icon: '💰', sub: 'hotel + Airtel TV' },
          { l: 'Gates flagged', v: `${flaggedGates} / ${data.gates.length}`, icon: '🚪', sub: '≥ 80% capacity', warn: flaggedGates > 0 },
          { l: 'Shuttle slots near-full', v: `${fullShuttles} / ${data.shuttles.length}`, icon: '🚐', sub: 'T-2h corridors', warn: fullShuttles > 0 },
        ].map((s) => (
          <div key={s.l} className={`rounded-2xl border p-4 ${s.warn ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800 bg-navy-900/70'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{s.l}</span>
              <span className="text-lg">{s.icon}</span>
            </div>
            <div className="mt-1 text-2xl font-black text-white">{s.v}</div>
            <div className="text-[11px] text-slate-500">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* gates */}
        <Card title="🚪 Gates — predicted load" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4 font-bold">Gate</th>
                  <th className="pb-2 pr-4 font-bold">Side</th>
                  <th className="pb-2 pr-4 text-right font-bold">Assigned</th>
                  <th className="pb-2 pr-4 text-right font-bold">Capacity</th>
                  <th className="pb-2 pr-4 font-bold">Load</th>
                  <th className="pb-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.gates.map((g) => (
                  <tr key={g.id} className="border-t border-slate-800/70">
                    <td className="py-2.5 pr-4 font-bold text-white">{g.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${g.side === 'local' ? 'bg-sky-500/15 text-sky-300' : 'bg-rose-500/15 text-rose-300'}`}>
                        {g.side}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-slate-300">{g.assigned.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 pr-4 text-right text-slate-400">{g.capacity.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <LoadBar load={g.load} status={g.status} className="w-24" />
                        <span className="text-xs font-bold text-slate-300">{pct(g.load)}</span>
                      </div>
                    </td>
                    <td className="py-2.5"><StatusPill status={g.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* parking */}
        <Card title="🅿️ Parking zones — load">
          <div className="space-y-3">
            {data.parking.map((p) => (
              <div key={p.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{p.name}</span>
                  <span className="text-slate-400">
                    {p.assigned.toLocaleString('en-IN')} / {p.capacity.toLocaleString('en-IN')} · <b className={p.status !== 'ok' ? 'text-amber-300' : 'text-slate-300'}>{pct(p.load)}</b>
                  </span>
                </div>
                <LoadBar load={p.load} status={p.status} />
              </div>
            ))}
          </div>
          {flaggedParking > 0 && (
            <p className="mt-4 rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-300">
              ⚠ {flaggedParking} parking zone{flaggedParking > 1 ? 's' : ''} approaching capacity — consider opening overflow lots early.
            </p>
          )}
        </Card>

        {/* shuttles summary */}
        <Card title="🚐 Shuttle corridors — fill by slot">
          <div className="space-y-3">
            {data.shuttles.slice(0, 12).map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{s.zone}</span>
                  <span className="text-slate-400">
                    {s.departure_time} · {s.booked}/{s.capacity} · <b className={s.status !== 'ok' ? 'text-amber-300' : 'text-slate-300'}>{pct(s.load)}</b>
                  </span>
                </div>
                <LoadBar load={s.load} status={s.status} />
              </div>
            ))}
          </div>
          <Link to="/organizer/shuttles" className="mt-4 inline-block text-xs font-bold text-saffron-500 hover:text-saffron-400">
            See all {data.shuttles.length} shuttle slots →
          </Link>
        </Card>

        {/* revenue */}
        <Card title="💰 Referral revenue tracker" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-rose-500/10 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-rose-300">Hotel referrals</p>
              <p className="mt-1 text-2xl font-black text-white">{inr(data.revenue.hotel.total)}</p>
              <p className="text-xs text-slate-400">{data.revenue.hotel.count.toLocaleString('en-IN')} bookings · 8–13% partner commission</p>
            </div>
            <div className="rounded-xl bg-sky-500/10 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300">Airtel TV referrals</p>
              <p className="mt-1 text-2xl font-black text-white">{inr(data.revenue.airtel_tv.total)}</p>
              <p className="text-xs text-slate-400">{data.revenue.airtel_tv.count.toLocaleString('en-IN')} signups · ₹149 each</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">Running total</p>
              <p className="mt-1 text-2xl font-black text-white">{inr(data.revenue.grand_total)}</p>
              <p className="text-xs text-slate-400">Tracked via ticket-ID referrals on the visitor flow</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}