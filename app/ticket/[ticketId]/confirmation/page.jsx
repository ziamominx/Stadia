'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApi, api } from '../../../../lib/api.js';
import QRCodeCard from '../../../../components/QRCode.jsx';
import RouteMap from '../../../../components/RouteMap.jsx';
import { kickoffLong, inr } from '../../../../lib/format.js';
import {
  Ticket,
  DoorClosed,
  ParkingSquare,
  Train,
  Hotel,
  Bus,
  Zap,
  Tv,
  MessageSquare,
  Compass,
  CheckCircle,
  Clock,
  Users,
  Shield,
  ArrowRight,
} from '../../../../components/Icons';

function InfoRow({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/5 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
        {sub && <p className="text-[11px] text-neutral-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  const params = useParams();
  const ticketId = params?.ticketId;
  const { data: detail, loading, error, reload } = useApi(() => api.ticket(ticketId), [ticketId]);
  const { data: matches } = useApi(api.matches);
  const { data: tourism } = useApi(api.tourism);
  const { data: ecosystem } = useApi(api.ecosystem);

  const [activeToken, setActiveToken] = useState('turnstile'); // 'turnstile', 'parking', 'voucher'
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [squadCopied, setSquadCopied] = useState(false);

  const [perkData, setPerkData] = useState({
    arrivalSlot: 'early',
    carpool: false,
    accessible: false,
    perkVoucher: '₹250 F&B Stadium Voucher',
    fastTrack: true,
    parkingAssigned: 'P1 · Nerul West Grounds',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`stadia_perk_${ticketId}`);
      if (saved) {
        setPerkData(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, [ticketId]);

  const [wa, setWa] = useState(null);
  const [waBusy, setWaBusy] = useState(false);
  const [claiming, setClaiming] = useState(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-72 animate-pulse rounded-2xl bg-[#0e0e12] border border-neutral-800" />
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-neutral-300">{error?.message || 'Ticket not found'}</p>
        <Link href="/matches" className="mt-4 inline-block font-bold text-emerald-400">
          ← Back to matches
        </Link>
      </div>
    );
  }

  const t = detail.ticket;
  const isLocal = t.visitor_type !== 'outstation';
  const isVehicle = isLocal && t.travel_mode === 'vehicle';

  let gapDays = 0;
  if (matches) {
    const idx = matches.findIndex((m) => m.id === detail.match.id);
    if (idx >= 0 && matches[idx + 1]) {
      gapDays = Math.floor(
        (new Date(matches[idx + 1].kickoff_time) - new Date(matches[idx].kickoff_time)) / 86400000,
      );
    }
  }
  const showTourism = gapDays >= 2;

  const sendWhatsApp = async () => {
    setWaBusy(true);
    setWa(null);
    try {
      const r = await api.sendWhatsApp(ticketId);
      setWa(r);
    } catch (e) {
      setWa({ error: e.message });
    } finally {
      setWaBusy(false);
    }
  };

  const claim = async (type) => {
    setClaiming(type);
    try {
      await api.claimReferral(ticketId, type);
      reload();
    } catch (e) {
      setWa({ error: e.message });
    } finally {
      setClaiming(null);
    }
  };

  // Payloads for multi-token pass
  const turnstileQRPayload = JSON.stringify({
    type: 'TURNSTILE_INGRESS',
    ticket: t.unique_ticket_id,
    match: `${detail.match.home_team} v ${detail.match.away_team}`,
    seat: `Block ${detail.block?.block_name}-${t.seat_number}`,
    gate: ecosystem?.gate_reroute_active ? 'Gate A' : detail.entryGate?.name,
    fastTrack: perkData.fastTrack,
  });

  const parkingQRPayload = JSON.stringify({
    type: 'PARKING_BOOM_BARRIER',
    ticket: t.unique_ticket_id,
    zone: perkData.parkingAssigned || detail.parkingZone?.name || 'P1 · Nerul West',
    bay: perkData.carpool ? 'VIP-BAY-04' : 'BAY-12',
    validUntil: '23:59',
  });

  const voucherQRPayload = JSON.stringify({
    type: 'STADIUM_FB_VOUCHER',
    ticket: t.unique_ticket_id,
    amount: 'INR 250',
    code: `PERK-${t.unique_ticket_id.slice(-6)}`,
    redemption: 'Official Concourse Kiosks & Food Atrium',
  });

  const currentPayload =
    activeToken === 'parking'
      ? parkingQRPayload
      : activeToken === 'voucher'
      ? voucherQRPayload
      : turnstileQRPayload;

  const copySquadLink = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/ticket/${ticketId}/confirmation` : '';
    navigator.clipboard?.writeText(shareUrl);
    setSquadCopied(true);
    setTimeout(() => setSquadCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6 fade-up">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" /> All-in-One Master Pass Active
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-extrabold text-emerald-400">
              OFFLINE READY
            </span>
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl mt-1">
            {detail.match.home_team} vs {detail.match.away_team}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            {kickoffLong(detail.match.kickoff_time)} · {detail.match.venue}
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSquadModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-white/5 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/10"
          >
            <Users className="h-3.5 w-3.5 text-sky-400" />
            <span>Share with Squad</span>
          </button>

          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <Ticket className="h-3.5 w-3.5 text-emerald-400" />
            <span>Add to Apple / Google Wallet</span>
          </button>
        </div>
      </div>

      {/* Live Ingress Reroute Advisory */}
      {ecosystem?.gate_reroute_active && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4 shadow-xl backdrop-blur-md flex items-start gap-3 fade-up">
          <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Live Ingress Advisory · Smart Rerouting Active
              </span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Fast-Track Active
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-200 leading-relaxed">
              Gate B is experiencing peak congestion (18-min turnstile delay). Stadium Operations has automatically redirected your digital pass to <strong className="text-white font-bold">Gate A (North Express Walkway)</strong> for fast-track entry.
            </p>
          </div>
        </div>
      )}

      {/* Ingress Window & Perks Banner */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wide text-white">
                Assigned Ingress Window: {perkData.arrivalSlot === 'early' ? '4:30 PM – 5:30 PM (T-3h Early Express)' : perkData.arrivalSlot === 'standard' ? '5:30 PM – 6:30 PM' : '6:30 PM – 7:15 PM'}
              </span>
              {perkData.fastTrack && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                  FAST-TRACK LANE
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {perkData.perkVoucher ? `Perk Unlocked: ${perkData.perkVoucher} redeemable at official concourse counters.` : 'Present your digital turnstile QR code upon stadium arrival.'}
            </p>
          </div>
        </div>

        <Link
          href="/crowd-flow"
          className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>Live Walkway Radar</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* MATCHDAY GAMEPLAN / WHAT TO DO NEXT */}
      <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Matchday Gameplan · What To Do Next
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">Step-by-Step Guide</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase font-mono">
              <span>01 · Save Pass</span>
            </div>
            <p className="text-xs font-bold text-white">Add to Wallet</p>
            <p className="text-[10px] text-neutral-400 leading-tight">
              Tap &quot;Add to Wallet&quot; or WhatsApp push so pass works offline.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 uppercase font-mono">
              <span>02 · Arrival</span>
            </div>
            <p className="text-xs font-bold text-white">Bay P1 / Metro</p>
            <p className="text-[10px] text-neutral-400 leading-tight">
              Arrive by 4:30 PM. Use &quot;Parking Pass&quot; QR at the boom barrier.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase font-mono">
              <span>03 · Entry</span>
            </div>
            <p className="text-xs font-bold text-white">Gate A Turnstile</p>
            <p className="text-[10px] text-neutral-400 leading-tight">
              Select &quot;Turnstile Pass&quot; tab and scan at Fast-Track Turnstile.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase font-mono">
              <span>04 · Concessions</span>
            </div>
            <p className="text-xs font-bold text-white">₹250 Food Credit</p>
            <p className="text-[10px] text-neutral-400 leading-tight">
              Select &quot;Food Voucher&quot; QR tab at concourse snack kiosks.
            </p>
          </div>
        </div>
      </div>

      {/* MULTI-TOKEN MASTER PASS */}
      <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-[#0e0e12] shadow-2xl">
        {/* Token Selector Switcher */}
        <div className="flex border-b border-neutral-800 bg-[#121217] p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveToken('turnstile')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeToken === 'turnstile'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <DoorClosed className="h-4 w-4" />
            <span>Turnstile Entry Pass</span>
          </button>

          {(isVehicle || perkData.parkingAssigned) && (
            <button
              onClick={() => setActiveToken('parking')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
                activeToken === 'parking'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <ParkingSquare className="h-4 w-4" />
              <span>Parking Barrier Pass ({perkData.carpool ? 'VIP Bay P1' : 'Bay P1'})</span>
            </button>
          )}

          {perkData.perkVoucher && (
            <button
              onClick={() => setActiveToken('voucher')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
                activeToken === 'voucher'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>₹250 Stadium Food Voucher</span>
            </button>
          )}
        </div>

        {/* Pass Content Body */}
        <div className="flex flex-col gap-6 p-6 md:flex-row items-center md:items-stretch">
          <div className="flex flex-col items-center justify-center gap-3 md:w-64 md:shrink-0 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
            <QRCodeCard text={currentPayload} />
            <div className="text-center">
              <p className="font-mono text-xs font-extrabold text-emerald-400 tracking-wider">
                {activeToken === 'turnstile'
                  ? t.unique_ticket_id
                  : activeToken === 'parking'
                  ? `PARK-${t.unique_ticket_id.slice(-6)}`
                  : `PERK-FB-${t.unique_ticket_id.slice(-6)}`}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5 uppercase tracking-wide">
                {activeToken === 'turnstile'
                  ? 'Present at Optical Turnstile'
                  : activeToken === 'parking'
                  ? 'Scan at Parking Boom Barrier'
                  : 'Scan at Concession Cashier'}
              </p>
            </div>
          </div>

          <div className="grid flex-1 gap-3 sm:grid-cols-2 w-full">
            <InfoRow
              icon={<Ticket className="h-4 w-4 text-emerald-400" />}
              label="Reserved Seat"
              value={`Block ${detail.block?.block_name} · Seat ${t.seat_number}`}
              sub={inr(detail.block?.price)}
            />
            <InfoRow
              icon={<DoorClosed className="h-4 w-4 text-emerald-400" />}
              label="Entry Gate"
              value={ecosystem?.gate_reroute_active ? 'Gate A · North Express (Rerouted)' : detail.entryGate?.name}
              sub={ecosystem?.gate_reroute_active ? 'Dynamic fast-track diversion active' : (isLocal ? 'Local Flow · North/West perimeter' : 'Outstation Flow · East/South perimeter')}
            />
            <InfoRow
              icon={<DoorClosed className="h-4 w-4 text-rose-400" />}
              label="Exit Gate"
              value={detail.exitGate?.name}
              sub="Follow directional signage post-match"
            />

            {(isVehicle || perkData.parkingAssigned) && (
              <InfoRow
                icon={<ParkingSquare className="h-4 w-4 text-amber-400" />}
                label="Parking Assignment"
                value={perkData.carpool ? 'P1 · VIP West Forecourt (Carpool)' : (detail.parkingZone?.name || 'P1 · Nerul West')}
                sub={perkData.carpool ? 'Reserved priority bay <150m from Gate A' : 'Vehicle RFID / QR tag on entry'}
              />
            )}

            {!isVehicle && isLocal && (
              <InfoRow
                icon={<Train className="h-4 w-4 text-sky-400" />}
                label="Transit Plan"
                value="Nerul Suburban Spine / Metro Line 1"
                sub="8-min flat pedestrian walkway to Gate A"
              />
            )}

            {!isLocal && detail.hotel && (
              <InfoRow
                icon={<Hotel className="h-4 w-4 text-indigo-400" />}
                label="Partner Accommodation"
                value={detail.hotel.name}
                sub={`${detail.hotel.zone} · ${detail.hotel.tier} · ${inr(detail.hotel.nightly_rate)}/night`}
              />
            )}

            {!isLocal && detail.shuttle && (
              <InfoRow
                icon={<Bus className="h-4 w-4 text-amber-400" />}
                label="Shuttle Transfer"
                value={`${detail.shuttle.zone} · departs ${detail.shuttle.departure_time}`}
                sub="Boarding verified with ticket QR"
              />
            )}
          </div>
        </div>

        {/* Route Map Section */}
        <div className="border-t border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Your Matchday Ingress & Egress Corridor
            </h2>
            <Link
              href="/crowd-flow"
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Open Live Crowd Map →
            </Link>
          </div>
          <RouteMap route={detail.route} />
          <p className="mt-2 text-[11px] text-neutral-500">
            <span className="text-emerald-400">—— green</span> = arrival walkway ·{' '}
            <span className="text-rose-400">- - red</span> = post-match egress path
          </p>
        </div>
      </div>

      {/* WhatsApp Dispatch Box */}
      <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-white">WhatsApp Matchday Media Pass</h3>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              Preview the matchday message. No WhatsApp provider is connected.
            </p>
          </div>
          <button
            onClick={sendWhatsApp}
            disabled={waBusy}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition disabled:opacity-50"
          >
            {waBusy ? 'Preparing…' : 'Preview WhatsApp message'}
          </button>
        </div>

        {wa && (
          <div className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-xs">
            {wa.error ? (
              <p className="text-rose-300">{wa.error}</p>
            ) : wa.mock ? (
              <p className="flex items-start gap-2 text-emerald-300">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Message preview generated for ticket <b>{t.unique_ticket_id}</b>. Nothing was sent to a phone.
                </span>
              </p>
            ) : (
              <p className="flex items-center gap-2 text-emerald-300">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Delivered via WhatsApp Cloud API!</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Offers & Partner Perks */}
      <div className="grid gap-4 sm:grid-cols-2">
        {!isLocal && (
          <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-rose-400">
              <Hotel className="h-4 w-4" />
            </div>
            <h3 className="mt-3 font-bold text-white text-sm">10% Hotel Reservation Discount</h3>
            <p className="mt-1 text-xs text-neutral-400">
              {detail.hotel ? `Linked to ${detail.hotel.name} — instant discount verified on checkout.` : 'Applies to your selected tournament partner hotel.'}
            </p>
            {detail.claims?.includes('hotel') ? (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <CheckCircle className="h-3 w-3" /> Claimed — voucher active
              </span>
            ) : (
              <button
                disabled={claiming === 'hotel'}
                onClick={() => claim('hotel')}
                className="mt-3 rounded-lg bg-white text-black px-3.5 py-1.5 text-xs font-bold transition hover:bg-neutral-200 disabled:opacity-50"
              >
                {claiming === 'hotel' ? 'Claiming…' : 'Activate 10% Hotel Voucher'}
              </button>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-sky-400">
            <Tv className="h-4 w-4" />
          </div>
          <h3 className="mt-3 font-bold text-white text-sm">Airtel 5G Match Streaming Pass</h3>
          <p className="mt-1 text-xs text-neutral-400">
            Complimentary 4K multi-cam tournament streaming on Airtel Xstream Play.
          </p>
          {detail.claims?.includes('airtel_tv') ? (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <CheckCircle className="h-3 w-3" /> Claimed — linked to ticket {t.unique_ticket_id}
            </span>
          ) : (
            <button
              disabled={claiming === 'airtel_tv'}
              onClick={() => claim('airtel_tv')}
              className="mt-3 rounded-lg bg-white text-black px-3.5 py-1.5 text-xs font-bold transition hover:bg-neutral-200 disabled:opacity-50"
            >
              {claiming === 'airtel_tv' ? 'Claiming…' : 'Claim 4K Stream Access'}
            </button>
          )}
        </div>
      </div>

      {/* Tourism Hub Section */}
      {showTourism && (
        <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">{gapDays} Layover Days Before Next Match</h3>
              </div>
              <p className="mt-0.5 text-xs text-neutral-400">
                Explore recommended destinations around Navi Mumbai & the Konkan coast.
              </p>
            </div>
            <Link href="/tourism" className="rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3.5 py-1.5 text-xs font-bold text-white transition">
              Explore Guide →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(tourism ?? []).slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-2xl bg-white/5 border border-white/5 p-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 mb-2">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm font-bold text-white">{s.name}</p>
                <p className="text-[11px] text-neutral-400">{s.distance_from_mumbai_km} km from DY Patil</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Apple / Google Wallet Offline Preview Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md fade-up">
          <div className="w-full max-w-md rounded-3xl border border-neutral-700 bg-[#111116] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Apple / Google Wallet Pass</h3>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-neutral-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Realistic Wallet Card */}
            <div className="rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-900 to-black p-5 shadow-2xl space-y-4 text-white">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black tracking-widest text-emerald-400">FIFA WWC 2026</span>
                <span className="font-mono text-neutral-400">{t.unique_ticket_id}</span>
              </div>
              <div>
                <h4 className="text-lg font-black">{detail.match.home_team} v {detail.match.away_team}</h4>
                <p className="text-[11px] text-neutral-400">{kickoffLong(detail.match.kickoff_time)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-neutral-800 pt-3 text-center">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">Gate</div>
                  <div className="text-xs font-bold text-emerald-400">{detail.entryGate?.name?.split('·')[0] || 'Gate A'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">Block</div>
                  <div className="text-xs font-bold">{detail.block?.block_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">Seat</div>
                  <div className="text-xs font-bold text-emerald-400">{t.seat_number}</div>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <QRCodeCard text={turnstileQRPayload} />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  alert('Pass installed to Wallet! Access offline anytime.');
                  setShowWalletModal(false);
                }}
                className="w-full rounded-xl bg-white hover:bg-neutral-200 py-3 text-xs font-bold text-black transition flex items-center justify-center gap-2"
              >
                <span>Add to Apple Wallet (.pkpass)</span>
              </button>
              <button
                onClick={() => {
                  alert('Pass linked to Google Wallet!');
                  setShowWalletModal(false);
                }}
                className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-3 text-xs font-bold text-white transition flex items-center justify-center gap-2"
              >
                <span>Save to Google Wallet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Share with Squad Modal */}
      {showSquadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md fade-up">
          <div className="w-full max-w-md rounded-3xl border border-neutral-700 bg-[#111116] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Share Pass with Your Squad</h3>
              </div>
              <button
                onClick={() => setShowSquadModal(false)}
                className="text-neutral-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Send your friends their synchronized matchday pass with the exact same block, turnstile entrance gate, and parking bay instructions.
            </p>

            <div className="rounded-xl border border-neutral-800 bg-[#141418] p-3 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-neutral-300 truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/ticket/${ticketId}/confirmation` : ''}
              </span>
              <button
                onClick={copySquadLink}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition shrink-0"
              >
                {squadCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Here is our official matchday pass for ${detail.match.home_team} vs ${detail.match.away_team} at DY Patil Stadium: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-black transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Share via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
