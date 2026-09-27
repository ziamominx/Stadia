'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApi, api } from '../../lib/api.js';
import { Compass, Sparkles, ArrowRight, CheckCircle, Clock, MapPin } from '../../components/Icons.jsx';

export default function TourismPage() {
  const { data: spots, loading } = useApi(api.tourism);
  const [selectedSpots, setSelectedSpots] = useState(new Set());
  const [category, setCategory] = useState('all');

  const toggleSpot = (id) => {
    setSelectedSpots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSpots = spots?.filter((s) => {
    if (category === 'all') return true;
    if (category === 'close') return s.distance_from_mumbai_km <= 35;
    if (category === 'scenic') return s.distance_from_mumbai_km > 35;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Matchday Gap-Day Curations</p>
          </div>
          <h1 className="mt-1 text-3xl font-black text-white">Your matches have gaps — fill them</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            With matches spread across tournament weeks, connect matchday downtime to Maharashtra heritage and nature.
            Select spots to bundle into your personalized itinerary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedSpots.size > 0 && (
            <Link
              href={`/journey-planner?tourism=${Array.from(selectedSpots).join(',')}`}
              className="flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-black text-black transition shadow-lg shadow-emerald-500/20"
            >
              Build Itinerary with {selectedSpots.size} {selectedSpots.size === 1 ? 'Spot' : 'Spots'} ↗
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            category === 'all' ? 'bg-white text-black' : 'border border-neutral-800 bg-[#111114] text-neutral-400 hover:text-white'
          }`}
        >
          All Getaways ({spots?.length || 0})
        </button>
        <button
          onClick={() => setCategory('close')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            category === 'close' ? 'bg-white text-black' : 'border border-neutral-800 bg-[#111114] text-neutral-400 hover:text-white'
          }`}
        >
          Under 35 km (&lt;45 min drive)
        </button>
        <button
          onClick={() => setCategory('scenic')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            category === 'scenic' ? 'bg-white text-black' : 'border border-neutral-800 bg-[#111114] text-neutral-400 hover:text-white'
          }`}
        >
          Scenic Day Trips (35+ km)
        </button>
      </div>

      {loading && <div className="mt-6 h-40 animate-pulse rounded-2xl bg-[#0e0e12]" />}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSpots?.map((s) => {
          const isAdded = selectedSpots.has(s.id);
          const estDriveMin = Math.round(s.distance_from_mumbai_km * 1.6);
          return (
            <div
              key={s.id}
              className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                isAdded
                  ? 'border-emerald-500 bg-[#0f1713] ring-1 ring-emerald-500/40'
                  : 'border-slate-800 bg-[#0e0e12] hover:border-emerald-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-emerald-400">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-300">
                      <Clock className="h-3 w-3 text-neutral-400" />
                      ~{estDriveMin}m drive
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                      {s.distance_from_mumbai_km} km
                    </span>
                  </div>
                </div>

                <h2 className="mt-3 text-lg font-extrabold text-white">{s.name}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.description}</p>
                <p className="mt-3 text-[11px] font-semibold text-emerald-400">Best window: {s.best_time}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleSpot(s.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white border border-neutral-800'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Added to Itinerary</span>
                    </>
                  ) : (
                    <span>+ Add to Trip</span>
                  )}
                </button>

                <Link
                  href={`/journey-planner?spot=${encodeURIComponent(s.name)}`}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-emerald-400 transition"
                >
                  Plan Transit <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-800 bg-[#0e0e12] p-6 text-center">
        <p className="text-sm text-slate-300">
          Travelling for multiple matches? Your ticket page shows exactly how many gap days you
          have before the next kickoff.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Link href="/matches" className="text-xs font-bold text-emerald-400 hover:underline">
            ← Back to matches
          </Link>
          <span className="text-neutral-600">·</span>
          <Link href="/journey-planner" className="text-xs font-bold text-white hover:underline">
            Open Multimodal Journey Planner →
          </Link>
        </div>
      </div>
    </div>
  );
}
