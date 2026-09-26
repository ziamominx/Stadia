'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Ticket, ChevronRight, Users } from './Icons';
import CapacityBar from './CapacityBar';

// FIFA 3-letter country codes
const TEAM_CODES = {
  India: 'IND',
  Australia: 'AUS',
  Brazil: 'BRA',
  Japan: 'JPN',
  USA: 'USA',
  England: 'ENG',
  Spain: 'ESP',
  France: 'FRA',
  Germany: 'GER',
  Nigeria: 'NGA',
  Canada: 'CAN',
  Netherlands: 'NED',
  Sweden: 'SWE',
  'Winner SF1': 'SF1',
  'Winner SF2': 'SF2',
};

function TeamBadge({ name }) {
  const code = TEAM_CODES[name] || name?.slice(0, 3)?.toUpperCase() || 'FC';
  return (
    <div className="mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/90 text-xs sm:text-sm font-black font-mono tracking-wider text-emerald-400 shadow-inner group-hover:border-emerald-500/50 group-hover:bg-emerald-950/20 transition-all">
      {code}
    </div>
  );
}

export default function MatchCard({ match, compact = false }) {
  if (!match) return null;

  const dateObj = new Date(match.kickoff_time);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const totalCapacity = 55000;
  const sold = match.tickets_sold || 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-[var(--terracotta-primary)] hover:shadow-md">
      
      {/* Top row: Match badge, date & stage */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[var(--terracotta-tint)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--terracotta-text)] border border-[var(--terracotta-border)]">
            MATCH {match.id < 10 ? `0${match.id}` : match.id}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            GROUP STAGE
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
          <Calendar className="w-3.5 h-3.5 opacity-70" />
          <span>{formattedDate}</span>
          <span>·</span>
          <Clock className="w-3.5 h-3.5 opacity-70" />
          <span className="text-[var(--text-secondary)] font-semibold">{formattedTime}</span>
        </div>
      </div>

      {/* Main fixture block */}
      <div className="py-5">
        <div className="grid grid-cols-5 items-center gap-2">
          
          {/* Home team */}
          <div className="col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <TeamBadge name={match.home_team} />
            <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight group-hover:text-[var(--terracotta-primary)] transition-colors">
              {match.home_team}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Home</span>
          </div>

          {/* VS center pillar */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[11px] font-mono font-black text-[var(--text-muted)] shadow-inner">
              VS
            </div>
            <span className="mt-1 text-[9px] font-mono text-[var(--terracotta-text)] uppercase tracking-widest font-bold">
              LIVE GATE
            </span>
          </div>

          {/* Away team */}
          <div className="col-span-2 flex flex-col items-center sm:items-end text-center sm:text-right">
            <TeamBadge name={match.away_team} />
            <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight group-hover:text-[var(--terracotta-primary)] transition-colors">
              {match.away_team}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Away</span>
          </div>
        </div>

        {/* Venue info */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
          <MapPin className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
          <span>{match.venue || 'DY Patil Stadium, Nerul'}</span>
        </div>
      </div>

      {/* Capacity & Booking Footer */}
      <div className="border-t border-[var(--border-subtle)] pt-3 space-y-3">
        <CapacityBar 
          value={sold}
          max={totalCapacity}
          label="STADIUM ALLOCATION"
          sublabel={`${sold.toLocaleString()} / ${totalCapacity.toLocaleString()}`}
          size="sm"
        />

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">Tickets From</span>
            <span className="text-sm font-black text-[var(--text-primary)] font-mono">₹1,500</span>
          </div>

          <Link
            href={`/match/${match.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-3.5 py-1.5 text-xs font-bold text-white transition shadow-soft active:scale-95"
          >
            <span>Choose Seats</span>
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
