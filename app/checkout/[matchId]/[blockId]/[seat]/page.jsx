'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi, api } from '../../../../../lib/api.js';
import { kickoffLong, inr } from '../../../../../lib/format.js';
import {
  AlertTriangle,
  Car,
  Train,
  Hotel,
  CheckCircle,
  Zap,
  Clock,
  Users,
  Shield,
  Ticket,
  ArrowRight,
} from '../../../../../components/Icons.jsx';

export default function CheckoutPage() {
  const params = useParams();
  const matchId = params?.matchId;
  const blockId = params?.blockId;
  const seat = params?.seat;
  const router = useRouter();

  const { data, loading, error } = useApi(() => api.matchSeats(matchId), [matchId]);
  const { data: hotels } = useApi(api.hotels);

  // User details
  const [form, setForm] = useState({ name: '', phone: '', email: '', homeLocation: '' });
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });

  // Unified Logistics selections
  const [travelMode, setTravelMode] = useState('vehicle'); // 'vehicle', 'transit', 'outstation'
  const [selectedHotelId, setSelectedHotelId] = useState(1);
  const [arrivalSlot, setArrivalSlot] = useState('early'); // 'early', 'standard', 'peak'
  const [carpool, setCarpool] = useState(false);
  const [accessible, setAccessible] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="h-72 animate-pulse rounded-3xl bg-[#0e0e12] border border-neutral-800" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error?.message || 'Match details not found'}</p>
        <Link href="/matches" className="mt-4 inline-block font-bold text-emerald-400">
          ← Back to matches
        </Link>
      </div>
    );
  }

  const block = data.blocks?.find((b) => b.id === Number(blockId));
  if (!block) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        Block not found. <Link href={`/match/${matchId}`} className="text-emerald-400">← choose a seat</Link>
      </div>
    );
  }
  const seatTaken = (block.soldSeats ?? []).includes(seat);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setErr('Full name and WhatsApp phone number are required');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create the booking
      const res = await api.createBooking({
        matchId: Number(matchId),
        seatBlockId: Number(blockId),
        seatNumber: seat,
        user: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          homeLocation: form.homeLocation.trim() || null,
        },
      });

      const ticketId = res.ticketId;

      // 2. Synchronize Travel Logistics directly
      if (travelMode === 'outstation') {
        await api.selectHotel(ticketId, selectedHotelId || 1);
      } else {
        await api.travelInfo(ticketId, {
          visitorType: 'local',
          travelMode: travelMode === 'vehicle' ? 'vehicle' : 'transit',
        });
      }

      // 3. Persist perks & preferences for the live pass HUD
      try {
        const perkMeta = {
          arrivalSlot,
          carpool,
          accessible,
          perkVoucher: arrivalSlot === 'early' ? '₹250 F&B Stadium Voucher' : null,
          fastTrack: arrivalSlot === 'early',
          parkingAssigned: travelMode === 'vehicle' ? (carpool ? 'P1 · VIP West Forecourt' : 'P1 · Nerul West Grounds') : null,
          transitAssigned: travelMode === 'transit' ? 'Harbour Rail / Nerul Metro Feeder' : null,
        };
        localStorage.setItem(`stadia_perk_${ticketId}`, JSON.stringify(perkMeta));
      } catch {
        // Safe storage fallback
      }

      // 4. Send WhatsApp notification in background
      api.sendWhatsApp(ticketId).catch(() => {});

      // 5. Instantly route to confirmation without intermediate survey hurdles!
      router.push(`/ticket/${ticketId}/confirmation`);
    } catch (e2) {
      setErr(e2.message || 'Failed to complete booking');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            <Ticket className="h-3.5 w-3.5" /> Fast-Track Unified Booking & Logistics
          </span>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Complete Reservation & Matchday Pass</h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            One-click pass generation: your seat, gate routing, parking zone, and arrival perks bundled automatically.
          </p>
        </div>
        <Link
          href={`/match/${matchId}`}
          className="rounded-xl border border-neutral-700/80 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
        >
          ← Change Seat
        </Link>
      </div>

      {seatTaken && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Seat {seat} in block {block.block_name} was just taken. Please go back and select an available seat.</span>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* STEP 1: Attendee Details */}
          <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">1. Fan Details</h2>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">Step 1 of 3</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">Full Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full rounded-xl border border-neutral-800 bg-[#141418] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">WhatsApp Mobile *</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-neutral-800 bg-[#141418] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">Email Address (Optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="fan@example.com"
                  className="w-full rounded-xl border border-neutral-800 bg-[#141418] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">Origin City</label>
                <input
                  value={form.homeLocation}
                  onChange={(e) => setForm({ ...form, homeLocation: e.target.value })}
                  placeholder="e.g. Navi Mumbai, Pune, Delhi…"
                  className="w-full rounded-xl border border-neutral-800 bg-[#141418] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Smart Ingress Logistics (Unified) */}
          <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">2. Matchday Travel & Gate Logistics</h2>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">Step 2 of 3</span>
            </div>
            <p className="text-xs text-neutral-400">
              Select your travel mode to automatically lock in your parking bay, shuttle slot, and dedicated stadium entrance gate:
            </p>

            {/* Travel Mode Pills */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div
                onClick={() => setTravelMode('vehicle')}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  travelMode === 'vehicle'
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-neutral-800 bg-[#141418] hover:border-neutral-700'
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 mb-2.5">
                  <Car className="h-5 w-5" />
                </div>
                <div className="font-bold text-sm text-white">Personal Vehicle</div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Auto-reserves Parking Bay <strong className="text-emerald-300 font-mono">P1</strong> & Gate A
                </div>
              </div>

              <div
                onClick={() => setTravelMode('transit')}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  travelMode === 'transit'
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-neutral-800 bg-[#141418] hover:border-neutral-700'
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-sky-400 mb-2.5">
                  <Train className="h-5 w-5" />
                </div>
                <div className="font-bold text-sm text-white">Public Transit / Metro</div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Harbour Line / Nerul Station pedestrian spine to Gate A
                </div>
              </div>

              <div
                onClick={() => setTravelMode('outstation')}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  travelMode === 'outstation'
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-neutral-800 bg-[#141418] hover:border-neutral-700'
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 mb-2.5">
                  <Hotel className="h-5 w-5" />
                </div>
                <div className="font-bold text-sm text-white">Outstation Visitor</div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Partner Hotel + Express Shuttle to East Gate C
                </div>
              </div>
            </div>

            {/* Outstation Hotel Picker if Outstation selected */}
            {travelMode === 'outstation' && (
              <div className="mt-3 rounded-2xl border border-neutral-800 bg-[#141418] p-3.5 space-y-2 fade-up">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Select Partner Hotel Corridor:</span>
                  <span className="text-emerald-400 font-semibold text-[11px]">10% Tournament Discount Included</span>
                </div>
                <select
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {(hotels || [
                    { id: 1, name: 'The Grand Vashi', zone: 'Vashi', tier: 'Luxury', nightly_rate: 6500 },
                    { id: 2, name: 'Courtyard by Marriott', zone: 'Nerul', tier: 'Luxury', nightly_rate: 8500 },
                    { id: 3, name: 'Ibis Navi Mumbai', zone: 'Turbhe', tier: 'Premium', nightly_rate: 4200 },
                  ]).map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} · {h.zone} ({h.tier}) — {inr(h.nightly_rate)}/night (Includes T-2h Shuttle)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ingress Slot Selector (Gamified Perk Meter) */}
            <div className="pt-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Select Ingress Window & Claim Rewards
              </label>

              <div className="space-y-2">
                {/* Early Slot */}
                <div
                  onClick={() => setArrivalSlot('early')}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-start justify-between ${
                    arrivalSlot === 'early'
                      ? 'border-emerald-500/80 bg-emerald-950/25 ring-1 ring-emerald-500/60'
                      : 'border-neutral-800 bg-[#141418] hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                        RECOMMENDED · -40% QUEUE
                      </span>
                      <span className="text-xs font-bold text-white">T-3h Early Express (4:30 PM – 5:30 PM)</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      Beat the traffic. Includes <strong className="text-emerald-400">₹250 Stadium F&B Voucher</strong> + <strong className="text-white">Priority Fast-Track Turnstile Lane</strong>.
                    </p>
                  </div>
                  <div className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center ${arrivalSlot === 'early' ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-neutral-600'}`}>
                    {arrivalSlot === 'early' && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                  </div>
                </div>

                {/* Standard Slot */}
                <div
                  onClick={() => setArrivalSlot('standard')}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-start justify-between ${
                    arrivalSlot === 'standard'
                      ? 'border-neutral-500 bg-neutral-800/40 ring-1 ring-neutral-500'
                      : 'border-neutral-800 bg-[#141418] hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-neutral-800 text-neutral-400 px-2 py-0.5 text-[10px] font-bold">
                        STANDARD
                      </span>
                      <span className="text-xs font-bold text-white">T-1.5h Regular Ingress (5:30 PM – 6:30 PM)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Standard stadium entry queue (~8–12 min turnstile wait).
                    </p>
                  </div>
                  <div className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center ${arrivalSlot === 'standard' ? 'border-white bg-white text-black' : 'border-neutral-600'}`}>
                    {arrivalSlot === 'standard' && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                  </div>
                </div>

                {/* Peak Surge */}
                <div
                  onClick={() => setArrivalSlot('peak')}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-start justify-between ${
                    arrivalSlot === 'peak'
                      ? 'border-amber-500/80 bg-amber-950/20'
                      : 'border-neutral-800 bg-[#141418] hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                        PEAK SURGE
                      </span>
                      <span className="text-xs font-bold text-white">T-45m Last Minute (6:30 PM – 7:15 PM)</span>
                    </div>
                    <p className="text-[11px] text-amber-200/80">
                      Heavy corridor congestion & high turnstile queues (20+ min wait). Transit arrival strongly advised.
                    </p>
                  </div>
                  <div className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center ${arrivalSlot === 'peak' ? 'border-amber-400 bg-amber-400 text-black' : 'border-neutral-600'}`}>
                    {arrivalSlot === 'peak' && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility & Group Additions */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={carpool}
                  onChange={(e) => setCarpool(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs text-neutral-300">
                  <strong className="text-white">Carpooling with group (3+ fans):</strong> Unlocks VIP Parking Bay P1 closest to Gate A.
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={accessible}
                  onChange={(e) => setAccessible(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs text-neutral-300">
                  <strong className="text-white">Accessibility assistance:</strong> Require step-free elevator / stroller ramp priority access.
                </span>
              </label>
            </div>
          </div>

          {/* STEP 3: Payment (Mock) */}
          <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">3. Instant Payment</h2>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">Demo Sandbox · Instant</span>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-300">Card Number</label>
              <input
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                placeholder="4242 •••• •••• 4242"
                className="w-full rounded-xl border border-neutral-800 bg-[#141418] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">Expiry</label>
                <input
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  placeholder="12/28"
                  className="w-full rounded-xl border border-neutral-800 bg-[#141418] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">CVV</label>
                <input
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  placeholder="•••"
                  className="w-full rounded-xl border border-neutral-800 bg-[#141418] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {err && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-4 text-base font-black text-black shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Orchestrating Master Pass & Logistics…</span>
            ) : (
              <>
                <span>Confirm & Generate Digital Matchday Pass ({inr(block.price)})</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Side: Order & Perks Summary */}
        <div className="space-y-5">
          <div className="sticky top-20 rounded-3xl border border-neutral-800 bg-[#0e0e12] p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Matchday Summary</h2>
            <div className="border-b border-neutral-800 pb-4">
              <p className="text-xs text-neutral-400">{kickoffLong(data.match.kickoff_time)}</p>
              <p className="mt-1 text-xl font-black text-white">
                {data.match.home_team} vs {data.match.away_team}
              </p>
              <p className="text-xs text-emerald-400 mt-1 font-semibold">{data.match.venue}</p>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-300 border-b border-neutral-800 pb-4">
              <div className="flex justify-between">
                <span>Reserved Seat:</span>
                <span className="font-bold text-white">Block {block.block_name} · Seat {seat}</span>
              </div>
              <div className="flex justify-between">
                <span>Gate Concourse:</span>
                <span className="font-bold text-emerald-400">
                  {travelMode === 'outstation' ? 'Gate C · East Concourse' : 'Gate A · North Concourse'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Arrival Logistics:</span>
                <span className="font-bold text-white capitalize">
                  {travelMode === 'vehicle' ? 'Personal Vehicle (Bay P1)' : travelMode === 'transit' ? 'Harbour Rail / Metro' : 'Hotel Shuttle Coach'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ingress Window:</span>
                <span className="font-bold text-white">
                  {arrivalSlot === 'early' ? '4:30 PM (Early Express)' : arrivalSlot === 'standard' ? '5:30 PM (Standard)' : '6:30 PM (Peak Surge)'}
                </span>
              </div>
            </div>

            {/* Perks Activated Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>Included Matchday Perks</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-neutral-300">
                {arrivalSlot === 'early' && (
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <strong>₹250 Stadium Food & Beverage Voucher</strong>
                  </li>
                )}
                {arrivalSlot === 'early' && (
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <strong>Turnstile Fast-Track Lane Access</strong>
                  </li>
                )}
                {carpool && (
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <strong>VIP Parking Bay P1 Priority Spot</strong>
                  </li>
                )}
                {travelMode === 'outstation' && (
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <strong>10% Tournament Hotel Discount + Shuttle</strong>
                  </li>
                )}
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Instant WhatsApp Offline Media Pass Push</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-neutral-800 space-y-2">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Match Ticket:</span>
                <span>{inr(block.price)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Logistics & Parking Booking:</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-neutral-800">
                <span>Total Amount:</span>
                <span className="text-emerald-400">{inr(block.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
