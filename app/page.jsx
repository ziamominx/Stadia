'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api, useApi } from '../lib/api.js';
import { useRole, ROLES } from '../components/RoleContext';
import { Activity, Sliders, Navigation, Hotel, Shield, ArrowRight, Zap, CheckCircle, Sparkles, Bus, Train, Utensils, BarChart3, Ticket } from '../components/Icons';
import ExplainableRecommendation from '../components/ExplainableRecommendation';
import LiveGeospatialLayersHome from '../components/LiveGeospatialLayersHome';
import QRCodeCard from '../components/QRCode';

const ICON_MAP = {
  Activity,
  Bus,
  BarChart3,
  Ticket,
};

export default function Landing() {
  const { role, setRole, currentRoleConfig } = useRole();
  const { data: matches, loading: loadingMatches } = useApi(api.matches);
  const { data: eventData } = useApi(api.itineraryEvents);
  const { data: ecosystem, reload: reloadEcosystem } = useApi(api.ecosystem);
  const [selectedEventType, setSelectedEventType] = useState('all');

  const handleApproveIntervention = async () => {
    await api.applyIntervention();
    if (reloadEcosystem) reloadEcosystem();
  };

  const HERO_CONTENT = {
    stadium_ops: {
      badge: 'Stadium Operations & Safety Command',
      headline1: 'Venue turnstiles.',
      headlineGradient: 'Real-time ingress safety.',
      subtitle: 'Continuous anomaly detection across DY Patil gates. One-click turnstile flow redirection and deconflicted attendee walking corridors.',
      primaryBtn: { text: 'Open Command Center', href: '/command-center' },
      secondaryBtn: { text: 'Inspect Gates & Turnstiles', href: '/organizer/gates' },
      pills: ['8 Turnstile Gates Online', 'Gate B Diversion Active', '0 Safety Breaches'],
    },
    mobility_ops: {
      badge: 'Mobility Operations & Transit Dispatch',
      headline1: 'Arterial corridors.',
      headlineGradient: 'Parking & fleet dispatch.',
      subtitle: 'Coordinating parking zones P1–P5 with automated load bypass, outstation hotel express corridors, and mass transit arrivals.',
      primaryBtn: { text: 'Open Mobility Hub', href: '/organizer/shuttles' },
      secondaryBtn: { text: 'Corridor Health', href: '/command-center' },
      pills: ['6,440 / 9,200 Bays Filled', 'P2 Auto-Diverting to P4', '4 Shuttle Corridors Active'],
    },
    executive: {
      badge: 'Executive Tournament Director Suite',
      headline1: 'Macro event health.',
      headlineGradient: 'Strategic safety & risk index.',
      subtitle: 'Cross-domain event health scorecard: 44,214 checked in (80.4% capacity), 94% safety index, and real-time stress testing.',
      primaryBtn: { text: 'Open Executive Suite', href: '/organizer' },
      secondaryBtn: { text: 'Test Crisis Simulator', href: '/simulator' },
      pills: ['94% Nominal Safety Index', '80.4% Venue Capacity', 'Multi-Agency Aligned'],
    },
    fan: {
      badge: 'Fan & Attendee Matchday Companion',
      headline1: 'Your matchday journey.',
      headlineGradient: 'Direct gates. Zero confusion.',
      subtitle: 'Access your verified digital ticket QR pass, personalized arrival route, walking directions, and early-bird concourse perks.',
      primaryBtn: { text: 'View My Digital Pass', href: '/ticket/FWC-IND-10492/confirmation' },
      secondaryBtn: { text: 'Browse Match Fixtures', href: '/matches' },
      pills: ['Verified Digital QR Pass', 'Fast-Track Turnstiles', 'Trip Companion Active'],
    },
  };

  const hero = HERO_CONTENT[role] || HERO_CONTENT.stadium_ops;

  const megaEvents = eventData?.events || [
    { id: 1, title: "FIFA Women's World Cup 2026: India vs Australia (Opening Match)", event_type: "sports_match", venue: "DY Patil Stadium, Nerul", expected_attendance: 55000, date_time: "2026-10-12T19:30:00.000Z" },
    { id: 2, title: "Coldplay: Music of the Spheres Mega Stadium Tour", event_type: "mega_concert", venue: "DY Patil Stadium, Nerul", expected_attendance: 62000, date_time: "2026-10-18T18:00:00.000Z" },
    { id: 3, title: "Global AI & Sustainable Urbanism Summit 2026", event_type: "global_summit", venue: "CIDCO Exhibition & Convention Center", expected_attendance: 38000, date_time: "2026-10-24T09:00:00.000Z" },
    { id: 4, title: "Grand Cultural Festival & Global Heritage Expo", event_type: "cultural_festival", venue: "Central Park Mega Grounds, Kharghar", expected_attendance: 75000, date_time: "2026-11-02T17:30:00.000Z" }
  ];

  const filteredEvents = selectedEventType === 'all'
    ? megaEvents
    : megaEvents.filter(e => (e.event_type || e.category) === selectedEventType);

  return (
    <div className="space-y-24 pb-20 fade-up">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 px-4 sm:px-6 text-center overflow-hidden">
        {/* Subtle Nexus Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-4xl space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-[#111114]/90 px-4 py-1.5 text-xs font-semibold text-neutral-300 shadow-2xl backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{hero.badge}</span>
            <span className="text-neutral-500">|</span>
            <span className="text-emerald-400 font-mono text-[11px]">Event State: LIVE</span>
          </div>

          {/* Dual-Tone Headline */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.08]">
            {hero.headline1} <br />
            <span className="bg-gradient-to-r from-neutral-400 via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
              {hero.headlineGradient}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base text-neutral-400 sm:text-lg leading-relaxed font-normal">
            {hero.subtitle}
          </p>

          {/* High-Contrast Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href={hero.primaryBtn.href}
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-black hover:bg-neutral-200 transition shadow-xl shadow-white/5 hover:scale-105"
            >
              {hero.primaryBtn.text}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={hero.secondaryBtn.href}
              className="flex items-center gap-2 rounded-full border border-neutral-800 bg-[#111114] px-7 py-3 text-sm font-bold text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
            >
              <Sliders className="h-4 w-4 text-neutral-400" />
              {hero.secondaryBtn.text}
            </Link>
          </div>

          {/* Micro Telemetry Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
            {hero.pills.map((pill, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>{pill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stakeholder Perspective Showcase (Section 24 of Brief) */}
        <div className="mx-auto max-w-5xl mt-12 pt-8 border-t border-neutral-800/80">
          <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-3 text-center">
            One Shared Event Engine · 4 Role-Specific Control Surfaces (Click to Transform)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {Object.values(ROLES).map((r) => {
              const isActive = r.id === role;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`rounded-2xl border p-3.5 transition-all text-left ${
                    isActive
                      ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                      : 'border-neutral-800 bg-[#111114]/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400">
                      {React.createElement(ICON_MAP[r.iconName] || Activity, { className: 'h-4 w-4' })}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        Active View
                      </span>
                    )}
                  </div>
                  <div className="mt-2 font-bold text-xs text-white">{r.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate mt-0.5">{r.tag}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conditional Content by Persona: Fan Journey vs Operational Command */}
      {role === 'fan' ? (
        /* ================= FAN JOURNEY COMPANION VIEW ================= */
        <>
          {/* Active Digital Pass & Guidance Card */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
            <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-[#111114] to-[#141418] p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                    <CheckCircle className="h-3 w-3" />
                    Verified Digital Matchday Pass
                  </span>
                  <h2 className="mt-2 text-2xl font-black text-white">FIFA Women&apos;s World Cup 2026</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    India vs Australia · DY Patil Stadium, Nerul · Kickoff 19:30 IST · Turnstiles Open 16:30 IST
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[#09090b] p-3.5 rounded-2xl border border-neutral-800">
                  <QRCodeCard text="FWC-IND-10492" size={72} />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-neutral-500 font-mono">Digital Pass ID</div>
                    <div className="text-xs font-mono font-bold text-white">FWC-IND-10492</div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Turnstile Ready
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Turnstile Advisory if Rerouted */}
              {ecosystem?.gate_reroute_active && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4 flex items-start gap-3">
                  <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Live Fast-Track Advisory · Auto-Diverted
                      </span>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        Gate A Express
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-300">
                      Gate B turnstiles reached heavy queue density. Your pass has been diverted to <strong>Gate A (North Express)</strong> with priority fast-track lane.
                    </p>
                  </div>
                </div>
              )}

              {/* Ingress Details Bento */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                  <div className="text-[10px] uppercase text-neutral-500 font-bold font-mono">Assigned Turnstile</div>
                  <div className="text-base font-black text-white mt-1">
                    {ecosystem?.gate_reroute_active ? 'Gate A · North Express' : 'Gate B · North Concourse'}
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1">
                    {ecosystem?.gate_reroute_active ? 'Fast-Track Active' : 'Optimal Flow · Walk Time ~4 mins'}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                  <div className="text-[10px] uppercase text-neutral-500 font-bold font-mono">Seat & Sector</div>
                  <div className="text-base font-black text-white mt-1">Block A1 · Seat 14</div>
                  <div className="text-xs text-neutral-400 mt-1">
                    West Lower Tier · Direct stairwell access
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                  <div className="text-[10px] uppercase text-neutral-500 font-bold font-mono">Arrival Corridor</div>
                  <div className="text-base font-black text-white mt-1">Nerul Station Link</div>
                  <div className="text-xs text-emerald-400 mt-1 font-semibold">
                    Pedestrian Skywalk Flow (Separated)
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/ticket/FWC-IND-10492/confirmation"
                  className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition shadow-lg shadow-white/5"
                >
                  Open Full Pass &amp; Route Map &rarr;
                </Link>
                <Link
                  href="/journey-planner"
                  className="rounded-full border border-neutral-800 bg-neutral-900 px-6 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white transition"
                >
                  Plan Multi-Leg Travel Companion
                </Link>
              </div>
            </div>
          </section>

          {/* The 4-Stage Fan Flow Strip */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
            <div className="border-b border-neutral-800/80 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Attendee Experience Architecture</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">The 4-Stage Matchday Flow</h2>
              <p className="text-xs text-neutral-400">How Stadia Nexus guides fans seamlessly from ticket selection to post-match dispersal.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-white">1</span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase font-mono">Stage 1</span>
                </div>
                <h3 className="font-bold text-white text-sm">My Event &amp; Booking</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Seat selection automatically tags your visitor profile (local commuter vs outstation tourist) and allocates dedicated stadium perimeter gates.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-white">2</span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase font-mono">Stage 2</span>
                </div>
                <h3 className="font-bold text-white text-sm">Journey Plan &amp; Hotel</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Smart companion steers outstation fans to partner stays in Belapur/Kharghar (saving ~₹3,500/night) with guaranteed express feeder shuttle slots.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-400">3</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Stage 3</span>
                </div>
                <h3 className="font-bold text-white text-sm">Live Turnstile Guidance</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Real-time turnstile load balancing. If your assigned gate experiences queue congestion, your pass is dynamically reallocated to the nearest open gate.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-white">4</span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase font-mono">Stage 4</span>
                </div>
                <h3 className="font-bold text-white text-sm">Exit &amp; Merchant Dispersal</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Post-match voucher nudges offering 25% dining discounts in nearby fan districts absorb crowd waves and eliminate crushing at Nerul railway station.
                </p>
              </div>
            </div>
          </section>

          {/* Attendee Perks & Dynamic Incentives Strip */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
            <div className="border-b border-neutral-800/80 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Exclusive Matchday Benefits</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Attendee Perks &amp; Concourse Incentives</h2>
              <p className="text-xs text-neutral-400">Claim valuable rewards designed to distribute stadium foot traffic.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Early Ingress Concessions</span>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">₹250 Voucher</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Arrive between T-3h and T-2h to bypass the peak 90-minute ingress rush and receive ₹250 concessions credit at all concourse dining kiosks.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Outstation Hotel Shuttle Pass</span>
                  <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10px] font-bold text-sky-400">Free Feeder Bus</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Book partner accommodation in Belapur or Kharghar to avoid surge pricing and get a free dedicated express shuttle directly to East Gate C.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Post-Match Dining Dispersal</span>
                  <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[10px] font-bold text-violet-400">25% Discount</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Enjoy post-match dinners and drinks with 25% off at verified local restaurants in Seawoods and Nerul while peak transit crowds subside.
                </p>
              </div>
            </div>
          </section>

          {/* Upcoming Matches & Ingress Seat Selection */}
          {matches && matches.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Match Schedule &amp; Tickets</span>
                  <h2 className="text-2xl font-black text-white mt-1">Upcoming World Cup Fixtures</h2>
                  <p className="text-xs text-neutral-400">Choose your match, select your block, and get your personalized transit routing.</p>
                </div>
                <Link href="/matches" className="text-xs font-bold text-emerald-400 hover:underline">
                  View All Fixtures &rarr;
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.slice(0, 3).map(m => (
                  <div key={m.id} className="rounded-3xl border border-neutral-800/80 bg-[#0e0e12] p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-bold text-white">{m.venue}</span>
                      <span>{new Date(m.kickoff_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="text-lg font-black text-white">
                      {m.home_team} <span className="text-neutral-500 font-normal">vs</span> {m.away_team}
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`/match/${m.id}`}
                        className="block w-full text-center rounded-full bg-white text-black hover:bg-neutral-200 py-2 text-xs font-bold transition"
                      >
                        Select Seats &amp; Ingress Corridor
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        /* ================= OPERATIONAL COMMAND SUITE VIEW ================= */
        <>
          {/* Live Operational Closed-Loop Engine (Section 1, 3 & 4 of Product Direction) */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Real-Time Decision Cycle · Closed-Loop
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Live Ingress Balancing &amp; Tactical Intervention
                </h2>
                <p className="text-xs text-neutral-400 max-w-2xl mt-0.5">
                  Continuous operational cycle: Understand event state &rarr; Predict congestion &rarr; Recommend intervention &rarr; Human approval &rarr; Execute &rarr; Measure outcome.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/command-center"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-bold text-black transition shadow-lg shadow-emerald-500/20"
                >
                  Open Command Center
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Live Explainable Recommendation Card */}
            <ExplainableRecommendation
              onApprove={handleApproveIntervention}
              isApproved={ecosystem?.gate_reroute_active}
            />

            {/* Interactive Venue & Corridor Radar */}
            <div className="mt-6">
              <LiveGeospatialLayersHome />
            </div>
          </section>

          {/* Core Bento Grid Features */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">System Architecture</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Transforming Fragmented Operations</h2>
              <p className="text-xs text-neutral-400">
                How Stadia Nexus replaces isolated silos with an intelligent, predictive, and coordinated event-hospitality ecosystem.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1: Accommodation Saturation */}
              <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-7 shadow-xl space-y-4 hover:border-neutral-700 transition">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Hotel className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-white">Dynamic Accommodation Balancing</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  When stadium hotels reach 95% saturation with surge pricing, the engine automatically routes visitors to alternative zones (Belapur &amp; Kharghar) with ₹3,500+ savings and guaranteed electric feeder shuttle links.
                </p>
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span>5 City Zones Unified</span>
                  <span>11,700 Overflow Rooms</span>
                </div>
              </div>

              {/* Card 2: Multimodal Transit & Corridors */}
              <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-7 shadow-xl space-y-4 hover:border-neutral-700 transition">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Train className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-white">Multimodal Transportation Orchestration</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Seamlessly integrates Suburban Rail, Navi Mumbai Metro Line 1, park-and-ride hubs, and dedicated electric shuttle fleets. Avoids highway gridlocks by separating local drivers from outstation shuttle arrivals.
                </p>
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-blue-400 font-semibold">
                  <span>97,500 Pax / Hr Capacity</span>
                  <span>Zero-Mix Gate Paths</span>
                </div>
              </div>

              {/* Card 3: Dynamic Incentives & Staggered Dispersal */}
              <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-7 shadow-xl space-y-4 hover:border-neutral-700 transition">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Utensils className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-white">Demand Incentives &amp; Dispersal</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Nudges attendees to arrive during off-peak windows via ₹250 stadium F&amp;B vouchers, and absorbs post-match egress bottlenecks through 25% dining discounts in nearby fan districts and entertainment lounges.
                </p>
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-violet-400 font-semibold">
                  <span>-40% Gate Wait Times</span>
                  <span>10,500 Dispersal Capacity</span>
                </div>
              </div>
            </div>
          </section>

          {/* Multi-Mega-Event Catalog */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Ecosystem Events</span>
                <h2 className="text-2xl font-black text-white sm:text-3xl mt-1">Active Mega-Events Under Orchestration</h2>
                <p className="text-xs text-neutral-400">Sports tournaments, stadium concerts, global summits, and mega festivals.</p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Events' },
                  { id: 'sports_match', label: 'Sports' },
                  { id: 'mega_concert', label: 'Concerts' },
                  { id: 'global_summit', label: 'Summits' },
                  { id: 'cultural_festival', label: 'Festivals' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedEventType(tab.id)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                      selectedEventType === tab.id
                        ? 'bg-white text-black shadow-md'
                        : 'border border-neutral-800 bg-[#111114] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4 hover:border-neutral-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-neutral-800 px-3 py-1 text-[10px] font-bold uppercase text-emerald-400">
                        {(ev.event_type || ev.category || 'sports_match').replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-neutral-400">
                        {ev.date_time
                          ? new Date(ev.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : (ev.date || 'Upcoming')}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-black text-white leading-snug">{ev.title}</h3>
                    <p className="mt-1 text-xs text-neutral-400">{ev.venue}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800 text-xs">
                      <div>
                        <span className="text-neutral-500">Expected Attendance:</span>
                        <div className="font-bold text-white text-sm">
                          {(ev.expected_attendance || ev.capacity || 50000).toLocaleString('en-IN')} pax
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-500">Capacity Status:</span>
                        <div className="font-bold text-emerald-400 text-sm">Orchestrated</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                    <Link
                      href="/journey-planner"
                      className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition"
                    >
                      Plan Trip &amp; Perks
                    </Link>

                    <Link
                      href="/command-center"
                      className="rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition flex items-center gap-1.5"
                    >
                      View Capacity Twin
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FIFA Tournament Specific Matches Section */}
          {matches && matches.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Attendee Ingestion Pipeline</span>
                  <h2 className="text-2xl font-black text-white mt-1">Event Ingestion &amp; Attendee Transit Profiling</h2>
                  <p className="text-xs text-neutral-400">Inputs into the orchestration engine: Seat block allocation directly feeds perimeter gate predictions and corridor separation.</p>
                </div>
                <Link href="/matches" className="text-xs font-bold text-emerald-400 hover:underline">
                  View All 9 Matches &rarr;
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.slice(0, 3).map(m => (
                  <div key={m.id} className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-bold text-white">{m.venue}</span>
                      <span>{new Date(m.kickoff_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="text-lg font-black text-white">
                      {m.home_team} <span className="text-neutral-500 font-normal">vs</span> {m.away_team}
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`/match/${m.id}`}
                        className="block w-full text-center rounded-full bg-white text-black hover:bg-neutral-200 py-2 text-xs font-bold transition"
                      >
                        Select Seats &amp; Ingress Corridor
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Executive Pitch Banner */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-[#111114] to-[#18181f] p-8 sm:p-12 shadow-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase">
                <Zap className="h-3.5 w-3.5" />
                Hackathon Solution Architecture
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white max-w-3xl leading-tight">
                How Stadia Nexus Solves the Mega-Event Capacity Dilemma
              </h2>
              <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
                Major events fail not from lack of total capacity, but from <strong>uncoordinated localized saturation</strong>. By breaking down information barriers between event ticketing, hotel allotments, and transit dispatchers, Stadia Nexus autonomously predicts bottlenecks, redirects surplus demand to peripheral hubs, and guarantees a world-class experience for visitors and city authorities.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/command-center"
                  className="rounded-full bg-white px-7 py-3 text-xs font-bold text-black hover:bg-neutral-200 transition"
                >
                  Launch Operations Room
                </Link>
                <Link
                  href="/simulator"
                  className="rounded-full border border-neutral-800 bg-neutral-900 px-7 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition"
                >
                  Stress-Test Simulator
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
