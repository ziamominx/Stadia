'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi, api } from '../../../lib/api.js';
import { kickoffLong, inr } from '../../../lib/format.js';
import { Building2, Plane, Car, Train, CheckCircle } from '../../../components/Icons';

const TIER_STYLE = {
  Luxury: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  Premium: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  Budget: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
};

export default function TravelInfoPage() {
  const params = useParams();
  const ticketId = params?.ticketId;
  const router = useRouter();

  const { data: detail, loading, error } = useApi(() => api.ticket(ticketId), [ticketId]);
  const { data: hotels } = useApi(api.hotels);

  const [visitorType, setVisitorType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [zoneFilter, setZoneFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');

  useEffect(() => {
    if (detail?.ticket?.visitor_type) {
      router.replace(`/ticket/${ticketId}/confirmation`);
    }
  }, [detail, ticketId, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl bg-[#0e0e12]" />
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-neutral-300">{error?.message || 'Ticket not found'}</p>
        <Link href="/matches" className="mt-4 inline-block font-bold text-emerald-400">
          ← Back to matches
        </Link>
      </div>
    );
  }

  const submitLocal = async (mode) => {
    setSubmitting(true);
    setErr(null);
    try {
      await api.travelInfo(ticketId, { visitorType: 'local', travelMode: mode });
      router.push(`/ticket/${ticketId}/confirmation`);
    } catch (e) {
      setErr(e.message);
      setSubmitting(false);
    }
  };

  const submitOutstation = async (hotelId) => {
    setSubmitting(true);
    setErr(null);
    try {
      await api.selectHotel(ticketId, hotelId);
      router.push(`/ticket/${ticketId}/confirmation`);
    } catch (e) {
      setErr(e.message);
      setSubmitting(false);
    }
  };

  const zones = hotels ? ['All', ...new Set(hotels.map((h) => h.zone))] : ['All'];
  const tiers = ['All', 'Luxury', 'Premium', 'Budget'];
  const filteredHotels = (hotels ?? []).filter(
    (h) =>
      (zoneFilter === 'All' || h.zone === zoneFilter) &&
      (tierFilter === 'All' || h.tier === tierFilter),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 fade-up">
      <Link href="/matches" className="text-sm font-semibold text-neutral-400 hover:text-white">
        ← Matches
      </Link>

      {/* booking summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 font-mono">Your ticket</p>
          <p className="text-lg font-extrabold text-white">
            {detail.match.home_team} vs {detail.match.away_team}
          </p>
          <p className="text-xs text-neutral-400">
            {kickoffLong(detail.match.kickoff_time)} · Block {detail.block.block_name} · Seat{' '}
            {detail.ticket.seat_number} · <span className="font-mono text-emerald-400">{detail.ticket.unique_ticket_id}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" /> Ticket Booked
        </span>
      </div>

      {/* step 1 */}
      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-black text-white">How are you getting to the stadium?</h1>
        <p className="mt-1 text-sm text-neutral-400">
          We'll route you through the crowd-orchestration system — different gates and paths for
          local and outstation fans.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => { setVisitorType('local'); setErr(null); }}
            className={`rounded-2xl border-2 p-5 text-left transition ${
              visitorType === 'local'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-[#0e0e12] hover:border-emerald-500/50'
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 mb-3">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Local Fan · Mumbai Metropolitan Region</h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              Get an assigned parking zone + gate, or the nearest gate via rail. North/West gates
              (A, B, G, H).
            </p>
          </button>
          <button
            onClick={() => { setVisitorType('outstation'); setErr(null); }}
            className={`rounded-2xl border-2 p-5 text-left transition ${
              visitorType === 'outstation'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-[#0e0e12] hover:border-emerald-500/50'
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-sky-400 mb-3">
              <Plane className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Outstation Fan · Regional / International</h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              Pick a partner hotel — we'll assign your shuttle zone, departure slot and East/South
              gate (C, D, E, F).
            </p>
          </button>
        </div>
      </div>

      {/* step 2 local */}
      {visitorType === 'local' && (
        <div className="fade-up mt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Step 2 of 2</p>
          <h2 className="mt-1 text-xl font-black text-white">How are you travelling today?</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              disabled={submitting}
              onClick={() => submitLocal('vehicle')}
              className="rounded-2xl border-2 border-neutral-800 bg-[#0e0e12] p-5 text-left transition hover:border-emerald-500/60 disabled:opacity-50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 mb-3">
                <Car className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Personal Vehicle</h3>
              <p className="mt-1 text-xs text-neutral-400">
                We'll assign a parking zone near your seat block and the walking path to your gate.
              </p>
            </button>
            <button
              disabled={submitting}
              onClick={() => submitLocal('transit')}
              className="rounded-2xl border-2 border-neutral-800 bg-[#0e0e12] p-5 text-left transition hover:border-emerald-500/60 disabled:opacity-50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 mb-3">
                <Train className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Public Transit / Metro</h3>
              <p className="mt-1 text-xs text-neutral-400">
                We'll route you to the nearest gate and suggest the closest railway station.
              </p>
            </button>
          </div>
          {err && <p className="mt-3 text-sm text-rose-300">{err}</p>}
        </div>
      )}

      {/* step 2 outstation */}
      {visitorType === 'outstation' && (
        <div className="fade-up mt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Step 2 of 2</p>
          <h2 className="mt-1 text-xl font-black text-white">Choose your partner hotel</h2>
          <p className="mt-1 text-sm text-neutral-400">
            You'll get a 10% discount (tracked on your ticket) and a shuttle slot to the stadium.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => setZoneFilter(z)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                  zoneFilter === z
                    ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                    : 'border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {z}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-neutral-800" />
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                  tierFilter === t
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : 'border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredHotels
              .sort((a, b) => a.distance_from_stadium_km - b.distance_from_stadium_km)
              .map((h) => (
                <button
                  key={h.id}
                  disabled={submitting}
                  onClick={() => submitOutstation(h.id)}
                  className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 text-left transition hover:-translate-y-0.5 hover:border-rose-500/60 hover:shadow-lg disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white">{h.name}</h3>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TIER_STYLE[h.tier]}`}>
                      {h.tier}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">
                    {h.zone} · {h.distance_from_stadium_km} km from stadium
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">{inr(h.nightly_rate)} / night</span>
                    <span className="text-xs font-bold text-emerald-400">10% off →</span>
                  </div>
                </button>
              ))}
          </div>
          {err && <p className="mt-3 text-sm text-rose-300">{err}</p>}
        </div>
      )}
    </div>
  );
}
