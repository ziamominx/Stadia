'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MatchCard from '../../components/MatchCard';
import { Search, Calendar, Filter, Ticket, MapPin, Shield } from '../../components/Icons';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'india' | 'evening' | 'finals'

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    const matchesSearch = 
      m.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.venue.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'india') {
      return m.home_team === 'India' || m.away_team === 'India';
    }
    if (filterType === 'evening') {
      return m.kickoff_time.includes('14:00');
    }
    if (filterType === 'finals') {
      return m.id >= 8;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-10">
        {/* Header Strip */}
        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-3 py-1 text-xs font-mono font-bold text-[var(--terracotta-text)]">
            <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
            <span>FIFA WOMEN’S WORLD CUP 2026 · MATCH SCHEDULE</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-mono tracking-tight">
                Select Your Match &amp; Reserve Seats
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
                Every ticket booked through STADIA includes autonomous parking reservations, concourse gate synchronization, and real-time egress routing.
              </p>
            </div>

            {/* Total count badge */}
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-mono shadow-soft">
              <Ticket className="w-4 h-4 text-[var(--terracotta-primary)]" />
              <div>
                <span className="text-[var(--text-muted)] block text-[10px]">TOTAL FIXTURES</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{matches.length} Official Matches</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 mb-8 shadow-soft">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search team or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--terracotta-primary)] focus:ring-1 focus:ring-[var(--terracotta-primary)] font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Matches' },
              { id: 'india', label: '🇮🇳 India Games' },
              { id: 'evening', label: '🌙 Prime Time' },
              { id: 'finals', label: '🏆 Knockouts & Final' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-semibold whitespace-nowrap transition ${
                  filterType === tab.id
                    ? 'bg-[var(--terracotta-primary)] text-white shadow-soft font-bold'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Match Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] animate-pulse" />
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <Ticket className="w-10 h-10 text-[var(--text-muted)] opacity-50 mx-auto" />
            <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">No matches found</h3>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Try adjusting your search query or reset the filter filters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setFilterType('all'); }}
              className="rounded-lg bg-[var(--terracotta-primary)] px-4 py-2 text-xs font-mono text-white font-bold hover:bg-[var(--terracotta-hover)]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
