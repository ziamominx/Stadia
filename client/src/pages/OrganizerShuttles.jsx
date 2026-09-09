import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import LoadBar, { StatusPill } from '../components/LoadBar.jsx';
import { kickoffDate, pct } from '../lib/format.js';

const SLOTS = ['T-3h', 'T-2h', 'T-1h'];

export default function OrganizerShuttles() {
  const { data: shuttles, loading, error } = useApi(api.shuttles);
  const { data: matches } = useApi(api.matches);
  const [matchId, setMatchId] = useState(null);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-72 animate-pulse rounded-2xl bg-navy-900" /></div>;
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/organizer" className="text-sm font-semibold text-slate-400 hover:text-white">← Overview</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Shuttle zone detail</h1>
          <p className="mt-1 text-sm text-slate-400">
            Seats booked vs shuttle capacity per time slot per zone. T-2h corridors fill fastest.
          </p>
        </div>
        <select
          value={activeMatch ?? ''}
          onChange={(e) => setMatchId(Number(e.target.value))}
          className="rounded-lg border border-slate-700 bg-navy-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-saffron-500"
        >
          {(matches ?? []).map((m) => (
            <option key={m.id} value={m.id}>
              {kickoffDate(m.kickoff_time)} · {m.home_team} vs {m.away_team}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="pb-3 pr-4 font-bold">Shuttle zone</th>
              {SLOTS.map((s) => (
                <th key={s} className="pb-3 pr-4 font-bold">Departure · {s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone} className="border-t border-slate-800/70 align-top">
                <td className="py-3 pr-4 font-bold text-white">{zone}</td>
                {SLOTS.map((tag) => {
                  const s = byZone[zone]?.[tag];
                  if (!s) return <td key={tag} className="py-3 pr-4 text-slate-600">—</td>;
                  return (
                    <td key={tag} className="py-3 pr-4">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300">{s.departure_time}</span>
                        <span className="font-bold text-slate-300">
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