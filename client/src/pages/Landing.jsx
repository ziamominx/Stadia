import { Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import { kickoffDate, kickoffTime, pct } from '../lib/format.js';

export default function Landing() {
  const { data: matches, loading } = useApi(api.matches);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,153,51,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(30,158,74,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-saffron-500/40 bg-saffron-500/10 px-3 py-1 text-xs font-bold tracking-wide text-saffron-500">
            🏟️ FIFA Women's World Cup · India 2026
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
            The World Cup is coming to <span className="text-saffron-500">Navi Mumbai</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            Book your seat at DY Patil Stadium, Nerul. FanFlow is architected as the tournament's
            single official ticketing channel — the standard model at mega-events, where one
            appointed partner is the system of record for every ticket. That centralisation powers
            your personalised arrival plan: parking + gate routing for local fans, hotel + shuttle
            for those travelling in.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#matches"
              className="rounded-xl bg-gradient-to-r from-saffron-500 to-pitch-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-saffron-500/25 transition hover:brightness-110"
            >
              Book tickets
            </a>
            <Link
              to="/organizer"
              className="rounded-xl border border-slate-600 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Organizer dashboard →
            </Link>
          </div>

          {matches && (
            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { n: matches.length, l: 'Matches' },
                { n: '55,000', l: 'Seats' },
                { n: '3 weeks', l: 'Tournament' },
                { n: '12', l: 'Partner hotels' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-slate-800 bg-navy-900/70 p-3 text-center">
                  <div className="text-2xl font-black text-white">{s.n}</div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Flow explainer */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-extrabold text-white">Two crowds, zero collisions</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Everyone gets a personalised arrival &amp; exit plan. Local and outstation fans use
          physically separate gates and paths so the two crowds never cross.
        </p>
        <div className="mt-5 max-w-3xl rounded-2xl border border-saffron-500/25 bg-saffron-500/5 p-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-saffron-500">Why a single ticketing channel?</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Mega-events run on a single official ticketing partner — the way BookMyShow or Paytm
            Insider hold exclusive rights for specific large events in India. FanFlow is designed
            to be that single system of record for this tournament: every ticket, and therefore
            every visitor's location and travel data, flows through one platform. That
            centralisation is what makes real-time crowd orchestration possible — split ticket
            sources across multiple vendors and the crowd model breaks down.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-sky-500/30 bg-navy-900/70 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300">🏠</span>
              <h3 className="text-lg font-bold text-white">Local fans</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li>• Personal vehicle → assigned <b className="text-sky-300">parking zone</b> (P1–P5)</li>
              <li>• Public transit → nearest <b className="text-sky-300">gate</b> + rail hint</li>
              <li>• Entry &amp; exit via <b className="text-sky-300">North/West gates</b> (A, B, G, H)</li>
              <li>• Walking path from parking → gate → your seat block</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-rose-500/30 bg-navy-900/70 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">✈️</span>
              <h3 className="text-lg font-bold text-white">Outstation &amp; international fans</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li>• Pick a <b className="text-rose-300">partner hotel</b> (Vashi, Belapur, Seawoods, Nerul, Airport)</li>
              <li>• Auto-assigned <b className="text-rose-300">shuttle zone + departure slot</b></li>
              <li>• Entry &amp; exit via <b className="text-rose-300">East/South gates</b> (C, D, E, F)</li>
              <li>• Hotel → shuttle drop → gate → seat block, all on your ticket</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Match timeline */}
      <section id="matches" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Match timeline</h2>
            <p className="mt-1 text-sm text-slate-400">3 weeks · 9 fixtures · all at DY Patil Stadium, Nerul</p>
          </div>
          <span className="hidden rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 sm:block">
            ● Live availability
          </span>
        </div>

        {loading && <div className="h-40 animate-pulse rounded-2xl bg-navy-900" />}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches?.map((m, i) => {
            const soldFrac = Math.min(1, m.tickets_sold / 55000);
            return (
              <Link
                key={m.id}
                to={`/match/${m.id}`}
                className="group rounded-2xl border border-slate-800 bg-navy-900/70 p-5 transition hover:-translate-y-0.5 hover:border-saffron-500/50 hover:shadow-xl hover:shadow-saffron-500/10"
              >
                <div className="mb-3 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">{kickoffDate(m.kickoff_time)}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-400">{kickoffTime(m.kickoff_time)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-950 text-sm font-black text-white ring-1 ring-slate-700">
                    {m.home_team.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-500">vs</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-950 text-sm font-black text-white ring-1 ring-slate-700">
                    {m.away_team.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 text-base font-extrabold text-white">
                  {m.home_team} <span className="font-medium text-slate-500">vs</span> {m.away_team}
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                    <span>Tickets sold</span>
                    <span>{pct(soldFrac)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-pitch-500"
                      style={{ width: `${Math.max(2, soldFrac * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 text-sm font-bold text-saffron-500 opacity-0 transition group-hover:opacity-100">
                  Choose your seat →
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}