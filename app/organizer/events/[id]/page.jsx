'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  getStoredEvents, 
  updateEventStatus, 
  getEventById, 
  deleteStoredEvent 
} from '../../../../lib/eventsData.js';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Eye, 
  Lock, 
  Zap, 
  Activity, 
  Hotel, 
  Bus, 
  Sliders,
  TrendingUp
} from '../../../../components/Icons.jsx';
import CapacityBar from '../../../../components/CapacityBar.jsx';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreated = searchParams?.get('created') === 'true';

  const eventId = params?.id;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(justCreated ? 'Event successfully created and provisioned in the Executive Console!' : '');

  const loadEvent = () => {
    if (!eventId) return;
    const found = getEventById(eventId);
    if (found) {
      setEvent(found);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvent();

    const handleUpdate = () => loadEvent();
    window.addEventListener('stadia_events_updated', handleUpdate);
    return () => window.removeEventListener('stadia_events_updated', handleUpdate);
  }, [eventId]);

  const handleStatusChange = (newStatus) => {
    if (!event) return;
    const updated = updateEventStatus(event.id, newStatus);
    if (updated) {
      setEvent(updated);
      setActionSuccess(`Event status changed to "${newStatus}". ${newStatus === 'Published' || newStatus === 'Live' ? 'Now accessible to public fans!' : 'Event is now private to executive organizers.'}`);
      setTimeout(() => setActionSuccess(''), 6000);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove event "${event.title}"?`)) {
      deleteStoredEvent(event.id);
      router.push('/organizer');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto mb-4" />
        <p className="text-xs text-neutral-400 font-mono">Loading Executive Event Console...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="text-xs text-neutral-400 mt-1">The requested event could not be located in the current state store.</p>
        <Link href="/organizer" className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-xs font-bold text-black">
          Back to Executive Console
        </Link>
      </div>
    );
  }

  const isDraft = (event.status || '').toLowerCase() === 'draft';
  const isLive = (event.status || '').toLowerCase() === 'live';
  const isPublished = (event.status || '').toLowerCase() === 'published' || (event.status || '').toLowerCase() === 'registration open';

  const soldPct = event.capacity > 0 ? Math.round(((event.sold || 0) / event.capacity) * 100) : 0;
  const grossRev = event.grossRevenue || ((event.sold || 0) * (event.basePrice || 1200));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up text-neutral-200">
      
      {/* Top Breadcrumb & Status Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Link href="/organizer" className="hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Executive Organizer
            </Link>
            <span>/</span>
            <span>Events</span>
            <span>/</span>
            <span className="text-white font-bold">{event.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {event.title}
            </h1>

            {/* Lifecycle Status Pill */}
            {isDraft && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 font-mono">
                <Lock className="h-3 w-3" />
                DRAFT · HIDDEN FROM FANS
              </span>
            )}
            {isPublished && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 font-mono">
                <Eye className="h-3 w-3" />
                PUBLISHED · LIVE TO FANS
              </span>
            )}
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300 font-mono animate-pulse">
                <Zap className="h-3 w-3" />
                LIVE IN-PROGRESS
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-neutral-400 flex items-center gap-2">
            <span>{event.subtitle}</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">{event.venue} ({event.city})</span>
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {!isDraft ? (
            <Link
              href={`/match/${event.id}`}
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <Eye className="h-3.5 w-3.5" />
              View Public Fan Page
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-[#121217] px-3.5 py-1.5 text-[11px] font-mono text-neutral-500">
              <Lock className="h-3 w-3" /> Fan Page Locked (Draft)
            </span>
          )}

          <Link
            href="/command-center"
            className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-[#121217] px-4 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-800 transition"
          >
            Tactical Map
          </Link>

          <Link
            href="/simulator"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition"
          >
            Stress Simulator
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-300 flex items-center justify-between gap-2 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* EXECUTIVE PUBLICATION & GO-LIVE CONTROL BAR */}
      <div className={`rounded-2xl border p-5 sm:p-6 transition ${
        isDraft 
          ? 'border-amber-500/40 bg-[#17130a]' 
          : isLive 
            ? 'border-rose-500/40 bg-[#170a0e]' 
            : 'border-emerald-500/40 bg-[#0a1610]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Executive Publication &amp; Operational Mode
              </span>
              <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                Current: {event.status || 'Draft'}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-300 leading-relaxed max-w-2xl">
              {isDraft && "This event is currently in STAGING DRAFT. Gates, ticket prices, and transit assumptions are being simulated. Fans cannot see this event in the public directory."}
              {isPublished && "This event is PUBLISHED & LIVE TO FANS. Public booking is active, fans can browse seat tiers and receive pre-arrival walking path instructions."}
              {isLive && "MATCH DAY LIVE MODE ACTIVE. Real-time gate cameras, sensor counters, and automated crowd deconfliction loops are actively managing fan flow."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isDraft && (
              <button
                onClick={() => handleStatusChange('Published')}
                className="flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-xs font-black text-black shadow-lg shadow-emerald-500/25 transition"
              >
                <Eye className="h-4 w-4" />
                Put Event Live to Fans
              </button>
            )}

            {isPublished && (
              <>
                <button
                  onClick={() => handleStatusChange('Live')}
                  className="flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition"
                >
                  <Zap className="h-4 w-4" />
                  Trigger Match-Day Live Mode
                </button>
                <button
                  onClick={() => handleStatusChange('Draft')}
                  className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 px-4 py-2.5 text-xs font-bold text-neutral-300 transition"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Unpublish to Draft
                </button>
              </>
            )}

            {isLive && (
              <>
                <button
                  onClick={() => handleStatusChange('Completed')}
                  className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-xs font-bold text-neutral-200 transition"
                >
                  Mark Event Completed
                </button>
                <button
                  onClick={() => handleStatusChange('Published')}
                  className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2.5 text-xs font-bold text-emerald-300 transition"
                >
                  Return to Scheduled
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Macro Scorecard KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>STADIUM CAPACITY</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {event.capacity?.toLocaleString('en-IN') || '55,000'}
          </div>
          <div className="mt-2">
            <CapacityBar value={soldPct} max={100} size="sm" showPercentage={false} />
            <div className="mt-1 flex justify-between text-[10px] font-mono text-neutral-500">
              <span>{event.sold?.toLocaleString('en-IN') || '0'} booked</span>
              <span className="text-emerald-400">{soldPct}% sold</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>GROSS TICKETING REV</span>
            <span className="font-mono font-bold text-emerald-400">₹</span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            ₹{(grossRev / 10000000).toFixed(2)} Cr
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-mono">
            Base: ₹{event.basePrice?.toLocaleString('en-IN')} · VIP: ₹{event.vipPrice?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>PEAK INGRESS CADENCE</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {event.ingressRate || 140} <span className="text-xs font-normal text-neutral-400 font-sans">fans / min</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-mono">
            {event.totalTurnstiles || 64} Calibrated Gates Active
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>COLLISION RISK LEVEL</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            {event.safetyMetrics?.riskLevel || 'LOW'}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-mono">
            {event.safetyMetrics?.activeMarshals || 180} Police &amp; Marshals assigned
          </div>
        </div>
      </div>

      {/* Operational Grids (Gates & Transit) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Gate Ingress & Concourse Strain Mesh */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Concourse Entry Gates Health Mesh
                </h3>
                <p className="text-xs text-neutral-400">
                  Real-time turnstile velocity, strain percentage, and estimated fan wait times.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Auto-Balancing Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(event.gates || []).map((gate) => {
                const strain = gate.strainPct || 0;
                let colorClass = 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
                if (strain >= 85) colorClass = 'border-red-500/40 bg-red-500/10 text-red-400';
                else if (strain >= 70) colorClass = 'border-amber-500/30 bg-amber-500/5 text-amber-400';

                return (
                  <div key={gate.id} className={`rounded-xl border p-4 space-y-3 ${colorClass}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white font-mono">{gate.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{gate.label}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-current">
                        {gate.status || 'Optimal'}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-1">
                        <span>Strain: {strain}%</span>
                        <span>Wait: {gate.waitMins || 2} mins</span>
                      </div>
                      <CapacityBar value={strain} max={100} size="sm" showPercentage={false} />
                    </div>

                    <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>Cap: {gate.capacity?.toLocaleString('en-IN')}</span>
                      <span>Throughput: {gate.throughput || 30}/min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multimodal Transit Split & Parking Section */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Multimodal Transit &amp; Parking Grid
                </h3>
                <p className="text-xs text-neutral-400">
                  Passenger ingress splits connecting Maharashtra rail corridors and highway park &amp; ride.
                </p>
              </div>
              <Bus className="h-4 w-4 text-emerald-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-neutral-800 bg-[#14141a] p-3">
                <div className="text-[10px] text-neutral-400 font-mono uppercase">Harbour Rail / Metro</div>
                <div className="text-lg font-black text-white font-mono mt-1">
                  {event.transitSplit?.railMetro || 45}%
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">Nerul / Belapur Stations</div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-[#14141a] p-3">
                <div className="text-[10px] text-neutral-400 font-mono uppercase">Electric Shuttles</div>
                <div className="text-lg font-black text-white font-mono mt-1">
                  {event.transitSplit?.shuttles || 28}%
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">NMMT &amp; Atal Setu Link</div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-[#14141a] p-3">
                <div className="text-[10px] text-neutral-400 font-mono uppercase">Park &amp; Ride Lots</div>
                <div className="text-lg font-black text-white font-mono mt-1">
                  {event.transitSplit?.parkRide || 17}%
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">P1–P4 Perimeter Lots</div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-[#14141a] p-3">
                <div className="text-[10px] text-neutral-400 font-mono uppercase">Rideshare / Cabs</div>
                <div className="text-lg font-black text-white font-mono mt-1">
                  {event.transitSplit?.rideshare || 10}%
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">Designated App Pickup</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Hospitality Absorption & Live Operation Logs */}
        <div className="space-y-6">
          
          {/* Hotel & Hospitality Card */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Hotel className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Regional Hospitality
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {event.hotelAbsorption?.ratePct || 82}% Absorbed
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-mono text-neutral-400">
                <span>Rooms Booked:</span>
                <span className="text-white font-bold">{event.hotelAbsorption?.roomsBooked || 1200}</span>
              </div>
              <div className="flex justify-between font-mono text-neutral-400">
                <span>RevPAR Uplift:</span>
                <span className="text-emerald-400 font-bold">+{event.hotelAbsorption?.revparUpliftPct || 20}%</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800/60">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-2">Partner Hotel Nodes:</span>
              <div className="space-y-1.5">
                {(event.hotelAbsorption?.primaryHotels || ['The Park Navi Mumbai', 'Four Points Vashi', 'Radisson Blu Belapur']).map((hotel, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{hotel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Operational Log Stream */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Live Operations Log
              </h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs font-mono">
              {(event.liveLogs || []).map((log, idx) => (
                <div key={idx} className="rounded-lg bg-[#14141a] p-2.5 border border-neutral-800/60 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span>{log.time}</span>
                    <span className={`uppercase font-bold ${
                      log.type === 'alert' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-blue-400'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone: Delete / Archive */}
          <div className="pt-2">
            <button
              onClick={handleDelete}
              className="w-full text-center text-xs font-mono text-red-400/80 hover:text-red-300 hover:underline py-2 transition"
            >
              Delete / Archive This Event
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
