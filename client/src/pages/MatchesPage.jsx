import React from 'react';
import { Link } from 'react-router-dom';
import { api, useApi } from '../api.js';
import { Shield, ArrowRight, Clock, MapPin } from '../components/Icons.jsx';

export default function MatchesPage() {
  const { data: matches, loading, error } = useApi(api.matches);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse rounded-3xl bg-neutral-900/60 border border-neutral-800" />
      </div>
    );
  }

  if (error || !matches) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-red-400">Failed to load matches: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      <div className="border-b border-neutral-800/80 pb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            Official Tournament Single Ticketing Mandate
          </span>
        </div>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Tournament Matches &amp; Seat Reservation
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Book seats with automated physical crowd separation (local fans via North/West gates &amp; parking; outstation fans via East/South gates &amp; partner shuttles).
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((m) => (
          <div
            key={m.id}
            className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4 hover:border-neutral-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                  {m.status || 'Scheduled'}
                </span>
                <span>{new Date(m.kickoff_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="mt-4 text-xl font-black text-white">
                {m.home_team} <span className="text-neutral-500 font-normal">vs</span> {m.away_team}
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{m.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Kickoff: {new Date(m.kickoff_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} IST</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <Link
                to={`/match/${m.id}`}
                className="flex items-center justify-center gap-2 w-full rounded-full bg-white py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition"
              >
                Select Seats &amp; Routing
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
