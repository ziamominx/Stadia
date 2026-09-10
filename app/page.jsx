'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MatchCard from '../components/MatchCard';
import RoutingDecision from '../components/RoutingDecision';
import { 
  Zap, 
  Shield, 
  MapPin, 
  Ticket, 
  Clock, 
  Users, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Navigation,
  Train,
  Building
} from '../components/Icons';
import { INITIAL_EVENTS, getStoredEvents } from '../lib/eventsData';

export default function HomePage() {
  const [matches, setMatches] = useState([]);
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedArea, setSelectedArea] = useState('all');
  const [eventCategory, setEventCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load local stored events (FIFA, F1, Concerts)
    setEvents(getStoredEvents());
    const handleEventsUpdated = (e) => {
      if (e.detail) setEvents(e.detail);
    };
    window.addEventListener('stadia_events_updated', handleEventsUpdated);

    async function loadData() {
      try {
        const [matchesRes, overviewRes] = await Promise.all([
          fetch('/api/matches').catch(() => null),
          fetch('/api/dashboard/overview').catch(() => null),
        ]);

        if (matchesRes && matchesRes.ok) {
          const mData = await matchesRes.json();
          setMatches(mData);
        }

        if (overviewRes && overviewRes.ok) {
          const oData = await overviewRes.json();
          setOverview(oData);
        }
      } catch (err) {
        console.error('Error fetching homepage telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    return () => window.removeEventListener('stadia_events_updated', handleEventsUpdated);
  }, []);

  const totalTickets = overview?.tickets || 38214;
  const matchCount = matches.length || 9;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* ─── HERO SECTION ─── Terracotta White Mode Architectural Elegance */}
        <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          
          {/* Ambient Terracotta Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--terracotta-primary)] opacity-[0.07] blur-[140px] pointer-events-none" />
          
          {/* Subtle Grid Canvas */}
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', 
              backgroundSize: '32px 32px' 
            }} 
          />

          <div className="relative mx-auto max-w-7xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Col: Hero Pitch */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {/* Tournament Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-3.5 py-1 text-xs font-mono font-bold text-[var(--terracotta-text)] shadow-xs">
                  <span className="flex h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-ping" />
                  <span>FIFA WOMEN’S WORLD CUP 2026 · DY PATIL STADIUM</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--text-primary)] uppercase leading-[1.05] font-mono">
                  The Event Is Big.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--terracotta-primary)] via-[#d97757] to-[#b84c2a]">
                    Your Journey Shouldn&apos;t Be.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl font-normal leading-relaxed">
                  One unified terracotta mesh connecting match ticketing, dynamic gate balancing, peripheral hotel absorption, and real-time egress deconfliction. Zero chaos.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/matches"
                    className="flex items-center gap-2 rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-6 py-3.5 text-sm font-bold text-white shadow-soft transition-all duration-150 active:scale-95"
                  >
                    <Ticket className="w-4 h-4 text-white" />
                    <span>Book Match Tickets</span>
                  </Link>

                  <Link
                    href="/command-center"
                    className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:border-[var(--terracotta-border)] px-6 py-3.5 text-sm font-bold text-[var(--text-primary)] shadow-soft transition-all duration-150 active:scale-95"
                  >
                    <Shield className="w-4 h-4 text-[var(--terracotta-primary)]" />
                    <span>Live Command Center</span>
                    <span className="rounded bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border border-[var(--terracotta-border)] text-[10px] px-1.5 py-0.5 font-mono ml-1 font-bold">
                      LIVE
                    </span>
                  </Link>

                  <Link
                    href="/crowd-flow"
                    className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--terracotta-primary)] transition ml-2 font-medium"
                  >
                    <span>View Deconfliction Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Trust telemetry bar */}
                <div className="pt-6 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-4 text-left font-mono">
                  <div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">{totalTickets.toLocaleString()}</div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase">Spectators Orchestrated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[var(--terracotta-text)]">8 Gates</div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase">Surge Balanced</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">12 Hotels</div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase">Peripheral Shuttles</div>
                  </div>
                </div>
              </div>

              {/* Right Col: Floating Live Telemetry Cards */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-soft space-y-4">
                  
                  {/* Top card bar */}
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">LIVE TELEMETRY STREAM</span>
                    </div>
                    <span className="rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)]">
                      FREQ 1.0s
                    </span>
                  </div>

                  {/* Card 1: Gate Bottleneck Reroute */}
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1.5 transition hover:border-[var(--terracotta-border)]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                        Gate C Throughput Warning
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                        72% Load
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Ingress surge detected on East concourse. Reassigning 1,284 incoming fans to Gate D fast-track.
                    </p>
                  </div>

                  {/* Card 2: Parking P3 Divert */}
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1.5 transition hover:border-[var(--terracotta-border)]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        Parking Zone P3 Nearing Max
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                        88% Capacity
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Auto-routing 620 vehicles to Parking P4 (60% load). Dynamic VMS expressway signs triggered.
                    </p>
                  </div>

                  {/* Card 3: Outstation Shuttle Sync */}
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1.5 transition hover:border-[var(--terracotta-border)]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Peak Ingress Window
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        17:10 · ON SCHEDULE
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      12 Hotel shuttle convoys synchronized with local commuter trains to eliminate intersection gridlock.
                    </p>
                  </div>

                  {/* Bottom live indicator */}
                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>STATUS: 0 ACTIVE CRUSH POINTS</span>
                    <span className="text-[var(--terracotta-text)] font-bold">100% DISPATCHED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── LATEST MEGA-EVENTS HAPPENING IN YOUR AREA ─── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[var(--border-subtle)]">
          
          {/* Section Header with Area & Category Selectors */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-4 border-b border-[var(--border-subtle)]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-ping" />
                <span className="text-xs font-mono font-bold text-[var(--terracotta-text)] uppercase tracking-wider">
                  GEO-LOCATED LIVE EVENT RADAR
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] font-mono">
                Latest Events Happening Around Your Area
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
                Discover world-class tournaments, motorsport championships, and stadium tours. Every event is fully synchronized with smart gates, hotel shuttles, and zero-gridlock egress.
              </p>
            </div>

            {/* Admin Console Quick Link */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-4 py-2.5 text-xs font-mono font-bold text-[var(--terracotta-text)] hover:bg-[var(--terracotta-primary)] hover:text-white transition shadow-soft shrink-0"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Console · Add Event</span>
            </Link>
          </div>

          {/* Dual Filtering Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-subtle)]">
            
            {/* Location Area Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase mr-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                Area:
              </span>
              {[
                { id: 'all', label: 'All Regions' },
                { id: 'navi-mumbai', label: 'Navi Mumbai (DY Patil)' },
                { id: 'greater-noida', label: 'Greater Noida (Buddh Circuit)' },
              ].map((area) => (
                <button
                  key={area.id}
                  onClick={() => setSelectedArea(area.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-all whitespace-nowrap ${
                    selectedArea === area.id
                      ? 'bg-[var(--bg-surface)] text-[var(--terracotta-text)] font-bold shadow-xs border border-[var(--terracotta-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {area.label}
                </button>
              ))}
            </div>

            {/* Event Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Sports & Tours' },
                { id: 'fifa', label: 'FIFA Football' },
                { id: 'f1', label: 'Formula 1' },
                { id: 'concert', label: 'Concerts' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setEventCategory(cat.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-all whitespace-nowrap ${
                    eventCategory === cat.id
                      ? 'bg-[var(--terracotta-primary)] text-white font-bold shadow-xs'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events
              .filter((e) => {
                if (eventCategory !== 'all' && e.category !== eventCategory) return false;
                if (selectedArea === 'navi-mumbai' && !e.city?.toLowerCase().includes('mumbai')) return false;
                if (selectedArea === 'greater-noida' && !e.city?.toLowerCase().includes('noida')) return false;
                return true;
              })
              .map((evt) => {
                const soldPct = Math.round(((evt.sold || 0) / (evt.capacity || 1)) * 100);
                return (
                  <div
                    key={evt.id}
                    className="group relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-soft hover:shadow-md hover:border-[var(--terracotta-border)] transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                          evt.category === 'f1'
                            ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                            : evt.category === 'concert'
                            ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                            : 'bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border border-[var(--terracotta-border)]'
                        }`}>
                          {evt.badge || evt.categoryLabel || evt.category?.toUpperCase()}
                        </span>

                        <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[var(--text-secondary)]">
                          <span className={`h-2 w-2 rounded-full ${
                            evt.status === 'Live' ? 'bg-[var(--status-green)] animate-ping' : 'bg-[var(--terracotta-primary)]'
                          }`} />
                          {evt.status}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="text-lg font-black text-[var(--text-primary)] font-mono leading-snug group-hover:text-[var(--terracotta-text)] transition-colors">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                        {evt.subtitle || evt.description}
                      </p>

                      {/* Venue, City & Timing */}
                      <div className="mt-4 space-y-2 text-xs font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[var(--terracotta-primary)] shrink-0" />
                          <span className="text-[var(--text-primary)] font-bold truncate">{evt.venue}</span>
                          <span>({evt.city})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                          <span>{evt.date} · {evt.time}</span>
                        </div>
                      </div>

                      {/* Capacity Meter */}
                      <div className="mt-4 space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Tickets Sold</span>
                          <span className="font-bold text-[var(--text-primary)]">{soldPct}% ({evt.sold?.toLocaleString()} seats)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--terracotta-primary)] to-[#d97757]"
                            style={{ width: `${Math.min(100, soldPct)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & CTAs */}
                    <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Passes From</div>
                        <div className="text-base font-black font-mono text-[var(--text-primary)]">
                          ₹{evt.basePrice?.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin`}
                          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] px-3 py-2 text-xs font-mono font-bold text-[var(--text-secondary)] transition"
                          title="View Admin Analytics for this event"
                        >
                          Telemetry
                        </Link>
                        <Link
                          href={`/matches`}
                          className="flex items-center gap-1.5 rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-4 py-2 text-xs font-mono font-bold text-white shadow-soft transition active:scale-95"
                        >
                          <span>Get Pass</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

        </section>

        {/* ─── MATCH SCHEDULE STRIP & SELECTION ─── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)]" />
                <span className="text-xs font-mono font-bold text-[var(--terracotta-text)] uppercase tracking-wider">
                  OFFICIAL TOURNAMENT SCHEDULE
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-mono">
                Featured Matches &amp; Smart Ticketing
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Every ticket automatically includes optimized gate allocation, transit sync, and real-time travel alerts.
              </p>
            </div>

            <Link
              href="/matches"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-mono font-bold text-[var(--terracotta-text)] hover:border-[var(--terracotta-primary)] shadow-xs transition"
            >
              <span>View All 9 Matches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Match Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.slice(0, 6).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          {matches.length === 0 && !loading && (
            <div className="py-12 text-center text-[var(--text-muted)] font-mono text-sm">
              Loading match schedule from DY Patil Stadium nodes...
            </div>
          )}
        </section>

        {/* ─── HOW STADIA WORKS (4-Step Visual Flow) ─── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--terracotta-text)]">
                ARCHITECTURE &amp; FAN FLOW
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-mono">
                How STADIA Eliminates Matchday Chaos
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Traditional ticketing stops when the seat is sold. STADIA stays active from booking confirmation all the way to stadium exit egress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Step 1 */}
              <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3 shadow-soft hover:border-[var(--terracotta-border)] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] text-[var(--terracotta-text)] font-mono font-black text-base">
                  01
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">
                  Book Seat &amp; Classify
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Select block on 360° pitch map. Platform classifies attendee as <strong>Local</strong> or <strong>Outstation</strong> visitor to tailor logistics.
                </p>
                <div className="pt-2 text-[10px] font-mono text-[var(--terracotta-text)] font-bold">
                  ✔ Automatic cohort segmentation
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3 shadow-soft hover:border-[var(--terracotta-border)] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] text-[var(--terracotta-text)] font-mono font-black text-base">
                  02
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">
                  Smart Gate &amp; Parking
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Algorithm assigns the closest uncongested gate (A–H) and parking zone (P1–P5), guaranteeing no cross-stadium foot traffic.
                </p>
                <div className="pt-2 text-[10px] font-mono text-[var(--terracotta-text)] font-bold">
                  ✔ Zero bottleneck entrance paths
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3 shadow-soft hover:border-[var(--terracotta-border)] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] text-[var(--terracotta-text)] font-mono font-black text-base">
                  03
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">
                  Lodging &amp; Shuttles
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Outstation fans are matched with 12 partner hotels across Vashi &amp; Belapur with scheduled, reserved shuttle pickup slots.
                </p>
                <div className="pt-2 text-[10px] font-mono text-[var(--terracotta-text)] font-bold">
                  ✔ Peripheral lodging absorption
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3 shadow-soft hover:border-[var(--terracotta-border)] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] text-[var(--terracotta-text)] font-mono font-black text-base">
                  04
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">
                  Live Dynamic Reroute
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  If an intersection or turnstile experiences an unexpected surge, instant WhatsApp &amp; in-app advisories divert fans in real-time.
                </p>
                <div className="pt-2 text-[10px] font-mono text-[var(--terracotta-text)] font-bold">
                  ✔ Continuous autonomous mesh
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── INTELLIGENCE SHOWCASE (Routing Decision Before/After) ─── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <RoutingDecision />
        </section>

        {/* ─── FINAL CTA SECTION ─── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="relative rounded-3xl border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] p-8 sm:p-12 overflow-hidden shadow-soft">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-block rounded-full bg-[var(--terracotta-primary)] px-3 py-1 text-xs font-mono font-bold text-white">
                READY FOR KICKOFF
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-mono">
                Experience the Future of Matchday Orchestration
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Whether you&apos;re a fan heading to DY Patil Stadium or a tournament director managing 55,000 arrivals, STADIA has you covered.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/matches"
                  className="rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-6 py-3 text-sm font-bold text-white shadow-soft transition active:scale-95"
                >
                  Pick Match &amp; Seats
                </Link>
                <Link
                  href="/crowd-flow"
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] px-6 py-3 text-sm font-bold text-[var(--text-primary)] transition active:scale-95 shadow-xs"
                >
                  Explore Crowd Flow Map
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
