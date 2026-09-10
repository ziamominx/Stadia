import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useApi } from '../api.js';
import { kickoffDate, kickoffTime } from '../lib/format.js';
import { ArrowRight, Clock, MapPin } from '../components/Icons.jsx';

const MATCH_LABELS = ['Opening Match', 'Group Stage', 'Group Stage', 'Group Stage', 'Group Stage', 'Group Stage', 'Quarter-final', 'Semi-final', 'Final'];
const matchLabel = (m, i) => (m.home_team === 'Winner SF1' ? 'Final' : MATCH_LABELS[i] ?? 'Group Stage');

export default function MatchesPage() {
  const { data: matches, loading, error } = useApi(api.matches);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-96 animate-pulse rounded-2xl bg-ink-800" />
      </div>
    );
  }

  if (error || !matches) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">Failed to load matches: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div className="border-b border-white/[0.07] pb-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyber-400">Single official ticketing channel</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Tournament matches &amp; seat reservation</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Book seats with automated physical crowd separation — local fans via North/West gates &amp; parking; outstation fans via East/South gates &amp; partner shuttles.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((m, i) => (
          <div
            key={m.id}
            className="panel panel-hover fade-up flex flex-col justify-between rounded-2xl p-5"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="chip border-cyber-400/40 bg-cyber-400/10 text-cyber-300">{matchLabel(m, i)}</span>
                <span className="text-slate-500">{kickoffDate(m.kickoff_time)}</span>
              </div>
              <div className="mt-4 text-xl font-black tracking-tight text-white">
                {m.home_team} <span className="font-normal text-slate-500">vs</span> {m.away_team}
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{m.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span className="tabular">Kickoff {kickoffTime(m.kickoff_time)} IST</span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <Link to={`/match/${m.id}`} className="btn-primary w-full !py-2.5 text-[13px]">
                Select seats &amp; routing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
