import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useApi } from '../api.js';
import { Activity, Sliders, Navigation, Hotel, Shield, ArrowRight, Zap, CheckCircle, Sparkles, Bus, Train, Utensils } from '../components/Icons.jsx';

export default function Landing() {
  const { data: matches, loading: loadingMatches } = useApi(api.matches);
  const { data: eventData } = useApi(api.itineraryEvents);
  const [selectedEventType, setSelectedEventType] = useState('all');

  const megaEvents = eventData?.events || [
    { id: 1, title: "FIFA Women's World Cup 2026: India vs Australia (Opening Match)", event_type: "sports_match", venue: "DY Patil Stadium, Nerul", expected_attendance: 55000, date_time: "2026-10-12T19:30:00.000Z" },
    { id: 2, title: "Coldplay: Music of the Spheres Mega Stadium Tour", event_type: "mega_concert", venue: "DY Patil Stadium, Nerul", expected_attendance: 62000, date_time: "2026-10-18T18:00:00.000Z" },
    { id: 3, title: "Global AI & Sustainable Urbanism Summit 2026", event_type: "global_summit", venue: "CIDCO Exhibition & Convention Center", expected_attendance: 38000, date_time: "2026-10-24T09:00:00.000Z" },
    { id: 4, title: "Grand Cultural Festival & Global Heritage Expo", event_type: "cultural_festival", venue: "Central Park Mega Grounds, Kharghar", expected_attendance: 75000, date_time: "2026-11-02T17:30:00.000Z" }
  ];

  const filteredEvents = selectedEventType === 'all'
    ? megaEvents
    : megaEvents.filter(e => e.event_type === selectedEventType);

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
            <span>Autonomous Mega-Event Hospitality & Crowd Orchestrator</span>
            <span className="text-neutral-500">|</span>
            <span className="text-emerald-400 font-mono text-[11px]">MMR Ecosystem v2.4</span>
          </div>

          {/* Dual-Tone Headline */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.08]">
            Orchestrate mega-events. <br />
            <span className="bg-gradient-to-r from-neutral-400 via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
              Balance city capacity.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base text-neutral-400 sm:text-lg leading-relaxed font-normal">
            A unified event-driven platform coordinating hotels, multimodal transportation networks, and visitor movement during extreme demand spikes.
          </p>

          {/* High-Contrast Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/command-center"
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-black hover:bg-neutral-200 transition shadow-xl shadow-white/5 hover:scale-105"
            >
              Open Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/simulator"
              className="flex items-center gap-2 rounded-full border border-neutral-800 bg-[#111114] px-7 py-3 text-sm font-bold text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
            >
              <Sliders className="h-4 w-4 text-neutral-400" />
              Test Crisis Simulator
            </Link>

            <Link
              to="/journey-planner"
              className="flex items-center gap-2 rounded-full border border-neutral-800 bg-[#111114] px-7 py-3 text-sm font-bold text-neutral-200 hover:bg-neutral-900 hover:text-white transition"
            >
              <Navigation className="h-4 w-4 text-emerald-400" />
              Attendee Trip Planner
            </Link>
          </div>

          {/* Micro Telemetry Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Cross-Sector Coordinated Visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Peripheral Accommodation Balancing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Multimodal Transit Feeder Loops</span>
            </div>
          </div>
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
              When stadium hotels reach 95% saturation with surge pricing, the engine automatically routes visitors to alternative zones (Belapur & Kharghar) with ₹3,500+ savings and guaranteed electric feeder shuttle links.
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
            <h3 className="text-lg font-black text-white">Demand Incentives & Dispersal</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Nudges attendees to arrive during off-peak windows via ₹250 stadium F&B vouchers, and absorbs post-match egress bottlenecks through 25% dining discounts in nearby fan districts and entertainment lounges.
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
              { id: 'sports_match', label: '⚽ Sports' },
              { id: 'mega_concert', label: '🎸 Concerts' },
              { id: 'global_summit', label: '🌐 Summits' },
              { id: 'cultural_festival', label: '🎉 Festivals' },
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
                    {ev.event_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    {new Date(ev.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-black text-white leading-snug">{ev.title}</h3>
                <p className="mt-1 text-xs text-neutral-400">{ev.venue}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-500">Expected Attendance:</span>
                    <div className="font-bold text-white text-sm">{ev.expected_attendance.toLocaleString('en-IN')} pax</div>
                  </div>
                  <div>
                    <span className="text-neutral-500">Capacity Status:</span>
                    <div className="font-bold text-emerald-400 text-sm">Orchestrated</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                <Link
                  to="/journey-planner"
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition"
                >
                  Plan Trip & Perks
                </Link>

                <Link
                  to="/command-center"
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
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Official Ticketing Mandate</span>
              <h2 className="text-2xl font-black text-white mt-1">FIFA Women's World Cup 2026 Match Schedule</h2>
              <p className="text-xs text-neutral-400">Interactive SVG seat booking with automated crowd separation routing.</p>
            </div>
            <Link to="/matches" className="text-xs font-bold text-emerald-400 hover:underline">
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
                    to={`/match/${m.id}`}
                    className="block w-full text-center rounded-full bg-white/10 hover:bg-white/20 py-2 text-xs font-bold text-white transition"
                  >
                    Select Seats &amp; Routing
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
              to="/command-center"
              className="rounded-full bg-white px-7 py-3 text-xs font-bold text-black hover:bg-neutral-200 transition"
            >
              Launch Operations Room
            </Link>
            <Link
              to="/simulator"
              className="rounded-full border border-neutral-800 bg-neutral-900 px-7 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition"
            >
              Stress-Test Simulator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}