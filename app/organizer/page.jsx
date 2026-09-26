'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi, api } from '../../lib/api.js';
import { getAllEventsForOrganizer, updateEventStatus } from '../../lib/eventsData.js';
import LoadBar, { StatusPill } from '../../components/LoadBar.jsx';
import { pct, inr } from '../../lib/format.js';
import { Activity, Shield, Hotel, Sliders, ArrowRight, CheckCircle, AlertTriangle, Bus, Eye, Lock, Zap, Calendar, MapPin } from '../../components/Icons.jsx';

export default function ExecutiveOrganizerPage() {
  const { data, loading, error, reload } = useApi(api.dashboard);
  const { data: ecosystem } = useApi(api.ecosystem);
  const [showCommercial, setShowCommercial] = useState(false);

  // Executive managed events
  const [managedEvents, setManagedEvents] = useState([]);

  useEffect(() => {
    const loadEvents = () => {
      setManagedEvents(getAllEventsForOrganizer());
    };
    loadEvents();
    window.addEventListener('stadia_events_updated', loadEvents);
    return () => window.removeEventListener('stadia_events_updated', loadEvents);
  }, []);

  const handleToggleStatus = (eventId, currentStatus) => {
    const s = (currentStatus || '').toLowerCase();
    const nextStatus = s === 'draft' ? 'Published' : 'Draft';
    updateEventStatus(eventId, nextStatus);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-72 animate-pulse rounded-2xl bg-[#0e0e12]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-red-400">{error?.message || 'Failed to load executive dashboard'}</p>
        <button onClick={reload} className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-bold text-black">
          Retry
        </button>
      </div>
    );
  }

  const flaggedGates = data.gates?.filter((g) => g.status !== 'ok').length || 0;
  const flaggedParking = data.parking?.filter((p) => p.status !== 'ok').length || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Executive Organizer Suite · Tournament Director Console
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Event Operations &amp; Publication Mesh
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Create events, configure Maharashtra venue grids, inspect pre-live analytics, and choose when to put events live for fans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/organizer/events/new"
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-black text-black shadow-lg shadow-emerald-500/20 transition"
          >
            <span className="text-sm font-bold">+</span>
            Create New Event
          </Link>
          <Link
            href="/simulator"
            className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-[#121217] px-4 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            Launch Stress Simulator
          </Link>
          <Link
            href="/command-center"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition"
          >
            Tactical Map
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* EXECUTIVE EVENT PORTFOLIO & PUBLICATION LIFECYCLE */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
        <div className="border-b border-neutral-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                Executive Event Portfolio &amp; Go-Live Control
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Draft events are restricted to organizers. Published and Live events are immediately discoverable and bookable by fans.
            </p>
          </div>

          <Link
            href="/organizer/events/new"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            + Register Another Event &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managedEvents.map(ev => {
            const isDraft = (ev.status || '').toLowerCase() === 'draft';
            const isLive = (ev.status || '').toLowerCase() === 'live';
            const isPublished = (ev.status || '').toLowerCase() === 'published' || (ev.status || '').toLowerCase() === 'registration open';

            return (
              <div 
                key={ev.id} 
                className={`rounded-2xl border p-5 space-y-4 transition flex flex-col justify-between ${
                  isDraft 
                    ? 'border-amber-500/30 bg-[#14120a]' 
                    : isLive 
                      ? 'border-rose-500/40 bg-[#140a0e]' 
                      : 'border-emerald-500/30 bg-[#0e1411]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded">
                      {ev.categoryLabel || ev.category || 'Event'}
                    </span>

                    {/* Publication Status Pill */}
                    {isDraft && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                        <Lock className="h-2.5 w-2.5" /> DRAFT · STAGING
                      </span>
                    )}
                    {isPublished && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 font-mono">
                        <Eye className="h-2.5 w-2.5" /> PUBLISHED
                      </span>
                    )}
                    {isLive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 font-mono animate-pulse">
                        <Zap className="h-2.5 w-2.5" /> LIVE MATCH
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {ev.title}
                  </h3>

                  <div className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                    <MapPin className="h-3 w-3 text-neutral-500" />
                    <span>{ev.venue}</span>
                    <span>·</span>
                    <span className="text-emerald-400">{ev.city}</span>
                  </div>

                  <div className="text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
                    <Calendar className="h-3 w-3 text-neutral-500" />
                    <span>{ev.date}</span>
                    <span>·</span>
                    <span>{ev.time}</span>
                    {ev.duration && (
                      <>
                        <span>·</span>
                        <span className="text-neutral-300">{ev.duration}</span>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Capacity: <strong className="text-white">{(ev.capacity || 50000).toLocaleString('en-IN')}</strong></span>
                    <span className="text-emerald-400 font-bold">
                      {isDraft ? '0 booked (Draft)' : `${(ev.sold || 0).toLocaleString('en-IN')} booked`}
                    </span>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleStatus(ev.id, ev.status)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                        isDraft
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black font-black'
                          : 'border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {isDraft ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Put Live to Fans
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          Make Draft
                        </>
                      )}
                    </button>

                    <Link
                      href={`/organizer/events/${ev.id}`}
                      className="text-xs font-bold text-white hover:text-emerald-400 flex items-center gap-1 transition"
                    >
                      Analytics &amp; Gates &rarr;
                    </Link>
                  </div>

                  {!isDraft && (
                    <Link
                      href={`/match/${ev.id}`}
                      className="text-[11px] text-neutral-400 hover:text-emerald-400 font-mono text-right transition"
                    >
                      View Fan Page &amp; Tickets &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Macro Event Health Scorecard (Section 20 of Brief) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <span className="text-xs font-medium text-neutral-400">Venue Attendance</span>
          <div className="text-3xl font-black text-white">44,214 <span className="text-xs font-normal text-neutral-500">/ 55,000</span></div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-500">Capacity Filled:</span>
            <span className="font-mono font-bold text-emerald-400">80.4%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80.4%' }} />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <span className="text-xs font-medium text-neutral-400">Safety & Risk Index</span>
          <div className="text-3xl font-black text-emerald-400">94% <span className="text-xs font-bold text-emerald-300">NOMINAL</span></div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-500">Crowd Mixing Risk:</span>
            <span className="font-bold text-emerald-400">LOW (Deconflicted)</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <span className="text-xs font-medium text-neutral-400">Ingress Velocity</span>
          <div className="text-3xl font-black text-white">1,420 <span className="text-xs font-normal text-neutral-500">pax/min</span></div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-500">Avg Turnstile Wait:</span>
            <span className="font-mono font-bold text-emerald-400">8.2 mins</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 space-y-2">
          <span className="text-xs font-medium text-neutral-400">Transport Network</span>
          <div className="text-3xl font-black text-white">72% <span className="text-xs font-bold text-neutral-400">FLOW</span></div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-neutral-500">Shuttle Fleet:</span>
            <span className="font-mono font-bold text-emerald-400">On Schedule</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
          </div>
        </div>
      </div>

      {/* Top 3 Strategic Operational Risks (Section 20 of Brief) */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
        <div className="border-b border-neutral-800/80 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Top Strategic Risks & Active Mitigations
            </h2>
            <p className="text-xs text-neutral-400">
              Live anomaly detection across stadium turnstiles, parking hubs, and mass transit corridors.
            </p>
          </div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            All Addressed
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-amber-500/30 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">Risk 01 · Parking Surge</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">Active Reroute</span>
            </div>
            <h4 className="text-sm font-bold text-white">P2 Sector 14 Lot at 88%</h4>
            <p className="text-xs text-neutral-400">
              Automated load-balancing engine has diverted incoming vehicles to P4 Palm Beach Road (48% capacity).
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Risk 02 · Turnstile Congestion</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Balanced</span>
            </div>
            <h4 className="text-sm font-bold text-white">Gate B Ingress Chokepoint</h4>
            <p className="text-xs text-neutral-400">
              Stadium Ops authorized 1,200 attendee diversion to Gate A. Turnstile wait dropped from 14m to 8m.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-700 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">Risk 03 · Rail Wave</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">Monitoring</span>
            </div>
            <h4 className="text-sm font-bold text-white">Harbour Line Peak Ingress</h4>
            <p className="text-xs text-neutral-400">
              Expected arrival surge of 12,000 fans between 18:30 and 19:15. Concourse stewards deployed.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Agency Operational Command Status (Section 14 of Brief) */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
        <div className="border-b border-neutral-800/80 pb-4">
          <h2 className="text-lg font-bold text-white">Multi-Agency Operations Coordination</h2>
          <p className="text-xs text-neutral-400">
            Real-time readiness status across cross-functional agency stakeholders.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> Stadium Operations
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-neutral-400">8 Gates active · 68 turnstile lanes operating nominal.</p>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">All Gates Online</div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Bus className="h-3.5 w-3.5 text-sky-400" /> Mobility Operations
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-neutral-400">4 Shuttle corridors · 9,200 parking bays orchestrated.</p>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Active Auto-Reroute</div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Shield className="h-3.5 w-3.5 text-indigo-400" /> Safety & Security
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-neutral-400">Perimeter clear · 0 safety incidents or breaches.</p>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Perimeter Secure</div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Activity className="h-3.5 w-3.5 text-rose-400" /> Medical & Emergency
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-neutral-400">14 First-aid concourses · 4 dedicated ambulances on standby.</p>
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Ready & Standby</div>
          </div>
        </div>
      </div>

      {/* Secondary Section: Commercial Partnerships & Referral Telemetry (Section 21 of Brief) */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl">
        <button
          onClick={() => setShowCommercial(!showCommercial)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div>
            <h2 className="text-base font-bold text-white">
              Commercial & Hospitality Referral Analytics
            </h2>
            <p className="text-xs text-neutral-400">
              Hotel commissions, Airtel partnership signups, and hospitality merchant redemptions.
            </p>
          </div>
          <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition">
            {showCommercial ? 'Hide Details ▲' : 'Expand Commercial Analytics ▼'}
          </span>
        </button>

        {showCommercial && (
          <div className="mt-6 pt-6 border-t border-neutral-800 space-y-6 fade-up">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                <span className="text-xs text-neutral-400 font-medium">Hotel Commissions Earned</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{inr(data.revenue?.hotelCommission || 342000)}</div>
                <p className="text-[10px] text-neutral-500 mt-1">10–12% commission per verified partner booking</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                <span className="text-xs text-neutral-400 font-medium">Telecom Sponsor Revenue</span>
                <div className="text-2xl font-black text-white mt-1">{inr(data.revenue?.telecomCommission || 184500)}</div>
                <p className="text-[10px] text-neutral-500 mt-1">₹149/signup flat referral on Airtel 5G passes</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
                <span className="text-xs text-neutral-400 font-medium">Total Partnership Revenue</span>
                <div className="text-2xl font-black text-white mt-1">
                  {inr((data.revenue?.hotelCommission || 342000) + (data.revenue?.telecomCommission || 184500))}
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">Directly attributed to matchday attendee journey</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
