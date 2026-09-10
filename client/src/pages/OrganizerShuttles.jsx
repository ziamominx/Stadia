import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import LoadBar, { StatusPill } from '../components/LoadBar.jsx';
import LiveBadge from '../components/LiveBadge.jsx';
import { kickoffDate, pct } from '../lib/format.js';

const SLOTS = ['T-3h', 'T-2h', 'T-1h'];

export default function OrganizerShuttles() {
  const { data: shuttles, loading, error } = useApi(api.shuttles);
  const { data: matches } = useApi(api.matches);
  const [matchId, setMatchId] = useState(null);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-ink-800" /></div>;
  if (error) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6"><p className="text-lg text-slate-300">{error.message}</p></div>;
  }

  const activeMatch = matchId ?? matches?.[0]?.id;
  const zones = [...new Set(shuttles.filter((s) => s.match_id === activeMatch).map((s) => s.zone))];
  const byZone = {};
  for (const s of shuttles) {
    if (s.match_id !== activeMatch) continue;
    const tag = `T-${s.departure_time.split('T-')[1]}`;
    (byZone[s.zone] ??= {})[tag] = s;
  }
  const matchShuttles = shuttles.filter((s) => s.match_id === activeMatch);
  const flagged = matchShuttles.filter((s) => s.status !== 'ok').length;
  const totalBooked = matchShuttles.reduce((a, s) => a + s.booked, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyber-400">Shuttle monitor</p>
            <LiveBadge label="Live" />
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Corridor capacity</h1>
          <p className="mt-2 text-sm text-slate-400">
            Seats booked vs shuttle capacity per time slot per zone — T-2h corridors fill fastest.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/organizer" className="btn-ghost !px-4 !py-2.5 text-[13px]">← Command center</Link>
          <select
            value={activeMatch ?? ''}
            onChange={(e) => setMatchId(Number(e.target.value))}
            className="input-dark !w-auto text-sm font-bold"
          >
            {(matches ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {kickoffDate(m.kickoff_time)} · {m.home_team} vs {m.away_team}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
        <div className="panel rounded-xl p-4 text-center">
          <p className="tabular text-xl font-black text-white">{matchShuttles.length}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Slots</p>
        </div>
        <div className="panel rounded-xl p-4 text-center">
          <p className="tabular text-xl font-black text-cyber-300">{totalBooked.toLocaleString('en-IN')}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Booked</p>
        </div>
        <div className={`panel rounded-xl p-4 text-center ${flagged ? 'border-amber-400/40' : ''}`}>
          <p className={`tabular text-xl font-black ${flagged ? 'text-amber-300' : 'text-emerald-300'}`}>{flagged}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Near-full</p>
        </div>
      </div>

      <div className="panel mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <th className="px-5 py-3.5">Shuttle zone</th>
              {SLOTS.map((s) => (
                <th key={s} className="px-5 py-3.5">Departure · {s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone} className="border-b border-white/[0.05] align-top last:border-0">
                <td className="px-5 py-4 font-black text-white">{zone}</td>
                {SLOTS.map((tag) => {
                  const s = byZone[zone]?.[tag];
                  if (!s) return <td key={tag} className="px-5 py-4 text-slate-600">—</td>;
                  return (
                    <td key={tag} className="px-5 py-4">
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="tabular font-mono font-bold text-slate-300">{s.departure_time}</span>
                        <span className="tabular font-bold text-slate-300">
                          {s.booked}/{s.capacity} · {pct(s.load)}
                        </span>
                      </div>
                      <LoadBar load={s.load} status={s.status} className="w-40" />
                      <div className="mt-1.5"><StatusPill status={s.status} /></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-xs text-slate-500">
        Capacity is seeded per corridor; the T-2h slot is the most popular pickup time for fans
        staying in partner hotels.
      </p>
    </div>
  );
}