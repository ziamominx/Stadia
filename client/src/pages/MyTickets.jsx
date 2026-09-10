import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { kickoffDate, kickoffTime, inr, teamFlag } from '../lib/format.js';
import { getSavedTickets, clearSavedTickets } from '../lib/tickets.js';

export default function MyTickets() {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = getSavedTickets();
    if (!saved.length) {
      setTickets([]);
      return;
    }
    let alive = true;
    Promise.all(saved.map((s) => api.ticket(s.id).catch(() => null))).then((details) => {
      if (!alive) return;
      const merged = saved
        .map((s, i) => ({ saved: s, detail: details[i] }))
        .filter((x) => x.detail)
        .map((x) => ({
          ...x.saved,
          detail: x.detail,
          status: x.detail.ticket.visitor_type ? 'planned' : 'pending',
        }));
      setTickets(merged);
    }).catch((e) => {
      if (alive) setError(e.message);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">My tickets</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Your matches</h1>
          <p className="mt-2 text-sm text-slate-400">Every ticket you create in this session, on this device.</p>
        </div>
        <Link to="/#matches" className="btn-primary !py-2.5 text-[13px]">Book more tickets</Link>
      </div>

      {!tickets ? (
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-ink-800" />
      ) : tickets.length === 0 ? (
        <div className="panel mt-8 rounded-2xl p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyber-400/30 bg-cyber-400/10 text-2xl">🎟️</div>
          <p className="text-lg font-black text-white">No tickets yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            Book a seat and it will appear here — along with its parking, gate, hotel and shuttle plan.
          </p>
          <Link to="/#matches" className="btn-primary mt-6">Explore matches</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {tickets.map((tk, i) => {
            const d = tk.detail;
            const statusCls =
              tk.status === 'planned'
                ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                : 'border-amber-400/40 bg-amber-400/10 text-amber-300';
            return (
              <Link
                key={tk.id}
                to={`/ticket/${tk.id}/confirmation`}
                className="panel panel-hover fade-up group rounded-2xl p-5"
                style={{ animationDelay: `${Math.min(i, 5) * 0.06}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink-950 text-xl">
                      {teamFlag(d.match.home_team)}
                    </span>
                    <div>
                      <p className="text-base font-black text-white">{d.match.home_team} vs {d.match.away_team}</p>
                      <p className="text-[11px] text-slate-400">
                        {kickoffDate(d.match.kickoff_time)} · {kickoffTime(d.match.kickoff_time)} · {d.match.venue.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <span className={`chip ${statusCls}`}>{tk.status === 'planned' ? '✓ Planned' : 'Setup needed'}</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-3 text-center">
                  <div>
                    <p className="tabular text-sm font-black text-white">Block {d.block.block_name}</p>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Block</p>
                  </div>
                  <div>
                    <p className="tabular text-sm font-black text-cyan-300">{d.ticket.seat_number}</p>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Seat</p>
                  </div>
                  <div>
                    <p className="tabular text-sm font-black text-slate-300">{inr(d.block.price)}</p>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Price</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold tracking-wider text-cyber-300">{tk.id}</span>
                  <span className="text-xs font-extrabold text-cyber-300 opacity-0 transition group-hover:opacity-100">Open ticket →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {tickets?.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              clearSavedTickets();
              setTickets([]);
            }}
            className="text-xs font-semibold text-slate-600 transition hover:text-rose-300"
          >
            Clear local ticket list
          </button>
        </div>
      )}
    </div>
  );
}