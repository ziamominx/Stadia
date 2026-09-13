'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApi, api } from '../../../../lib/api.js';
import QRCodeCard from '../../../../components/QRCode.jsx';
import RouteMap from '../../../../components/RouteMap.jsx';
import { kickoffLong, inr } from '../../../../lib/format.js';
import { Ticket, DoorClosed, ParkingSquare, Train, Hotel, Bus, Zap, Tv, MessageSquare, Compass, CheckCircle } from '../../../../components/Icons';

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

  const [wa, setWa] = useState(null);
  const [waBusy, setWaBusy] = useState(false);
  const [claiming, setClaiming] = useState(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-72 animate-pulse rounded-2xl bg-[#0e0e12]" />
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

  if (!detail.ticket?.visitor_type) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-white">Finish your arrival plan to see the full ticket.</p>
        <Link href={`/ticket/${ticketId}`} className="mt-3 inline-block font-bold text-emerald-400">
          Continue setup →
        </Link>
      </div>
    );
  }

  const t = detail.ticket;
  const isLocal = t.visitor_type === 'local';
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

  const qrPayload = JSON.stringify({
    ticket: t.unique_ticket_id,
    match: `${detail.match.home_team} v ${detail.match.away_team}`,
    seat: `${detail.block?.block_name}-${t.seat_number}`,
    gate: detail.entryGate?.name,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" /> Ticket Confirmed
          </span>
          <h1 className="text-2xl font-black text-white sm:text-3xl mt-1">
            {detail.match.home_team} vs {detail.match.away_team}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {kickoffLong(detail.match.kickoff_time)} · {detail.match.venue}
          </p>
        </div>
        <Link
          href="/matches"
          className="rounded-xl border border-neutral-700 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
        >
          Book another match
        </Link>
      </div>

      {/* Live Ingress Reroute Advisory */}
      {ecosystem?.gate_reroute_active && (
        <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4 shadow-xl backdrop-blur-md flex items-start gap-3 fade-up">
          <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Live Turnstile Advisory · Ingress Optimization Active
              </span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Fast-Track Active
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-200 leading-relaxed">
              Gate B is currently experiencing heavy queue saturation. Stadium Operations has automatically diverted your digital pass to <strong className="text-white font-bold">Gate A (North Express Concourse)</strong> for fast-track entry. Your QR code is verified and active at Gate A turnstiles.
            </p>
          </div>
        </div>
      )}

      {/* ticket */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e0e12]">
        <div className="flex flex-col gap-6 p-6 md:flex-row">
          <div className="flex flex-col items-center gap-3 md:w-56 md:shrink-0">
            <QRCodeCard text={qrPayload} />
            <div className="text-center">
              <p className="font-mono text-sm font-bold text-emerald-400">{t.unique_ticket_id}</p>
              <p className="text-[11px] text-neutral-500 font-mono">Present this QR at the gate</p>
            </div>
          </div>

          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <InfoRow icon={<Ticket className="h-4 w-4 text-emerald-400" />} label="Seat" value={`Block ${detail.block?.block_name} · Seat ${t.seat_number}`} sub={inr(detail.block?.price)} />
            <InfoRow
              icon={<DoorClosed className="h-4 w-4 text-emerald-400" />}
              label="Entry gate"
              value={ecosystem?.gate_reroute_active ? 'Gate A · North Express (Rerouted)' : detail.entryGate?.name}
              sub={ecosystem?.gate_reroute_active ? 'Dynamic fast-track diversion active' : (isLocal ? 'Local flow · North/West perimeter' : 'Outstation flow · East/South perimeter')}
            />
            <InfoRow icon={<DoorClosed className="h-4 w-4 text-rose-400" />} label="Exit gate" value={detail.exitGate?.name} sub="Use for post-match exit" />

            {isVehicle && detail.parkingZone && (
              <InfoRow
                icon={<ParkingSquare className="h-4 w-4 text-amber-400" />}
                label="Parking zone"
                value={detail.parkingZone.name}
                sub={
                  detail.routingDecision?.reassigned
                    ? `Auto-routed: ${detail.routingDecision.reason}`
                    : 'Vehicle tag on entry · follow signs'
                }
              />
            )}
            {!isVehicle && isLocal && (
              <InfoRow icon={<Train className="h-4 w-4 text-sky-400" />} label="Transit plan" value={detail.transitHint || 'Nearest gate routing'} sub="Show this at the gate if asked" />
            )}
            {!isLocal && detail.hotel && (
              <InfoRow
                icon={<Hotel className="h-4 w-4 text-indigo-400" />}
                label="Hotel"
                value={detail.hotel.name}
                sub={`${detail.hotel.zone} · ${detail.hotel.tier} · ${inr(detail.hotel.nightly_rate)}/night · check-in ${new Date(detail.hotelBooking?.checkin || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              />
            )}
            {!isLocal && detail.shuttle && (
              <InfoRow
                icon={<Bus className="h-4 w-4 text-amber-400" />}
                label="Shuttle"
                value={`${detail.shuttle.zone} · departs ${detail.shuttle.departure_time}`}
                sub="Boarding shows your ticket ID"
              />
            )}
          </div>
        </div>

        {/* route map */}
        <div className="border-t border-neutral-800 p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-400 font-mono">
            Your match-day route
          </h2>
          <RouteMap route={detail.route} />
          <p className="mt-2 text-[11px] text-neutral-500">
            <span className="text-emerald-400">—— green</span> = arrival path ·{' '}
            <span className="text-rose-400">- - red</span> = post-match exit path
            {isLocal && isVehicle && ' · local fans use North/West gates, outstation fans use East/South gates so crowds never mix'}
          </p>
        </div>
      </div>

      {/* offers */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {!isLocal && (
          <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-rose-400">
              <Hotel className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-bold text-white">10% Off Hotel Reservation</h3>
            <p className="mt-1 text-xs text-neutral-400">
              {detail.hotel ? `Applies to ${detail.hotel.name} — we've already reserved 2 nights for you.` : 'Applies to your selected partner hotel.'}
            </p>
            {detail.claims?.includes('hotel') ? (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <CheckCircle className="h-3 w-3" /> Claimed — discount linked to ticket {t.unique_ticket_id}
              </span>
            ) : (
              <button
                disabled={claiming === 'hotel'}
                onClick={() => claim('hotel')}
                className="mt-3 rounded-lg bg-white text-black px-4 py-2 text-sm font-bold transition hover:bg-neutral-200 disabled:opacity-50"
              >
                {claiming === 'hotel' ? 'Claiming…' : 'Claim 10% Hotel Discount'}
              </button>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-sky-400">
            <Tv className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-bold text-white">10% Off Match Streaming Pass</h3>
          <p className="mt-1 text-xs text-neutral-400">
            Catch every match from home too — this offer is for all fans, local or not.
          </p>
          {detail.claims?.includes('airtel_tv') ? (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <CheckCircle className="h-3 w-3" /> Claimed — referral tracked on ticket {t.unique_ticket_id}
            </span>
          ) : (
            <button
              disabled={claiming === 'airtel_tv'}
              onClick={() => claim('airtel_tv')}
              className="mt-3 rounded-lg bg-white text-black px-4 py-2 text-sm font-bold transition hover:bg-neutral-200 disabled:opacity-50"
            >
              {claiming === 'airtel_tv' ? 'Claiming…' : 'Claim Streaming Discount'}
            </button>
          )}
        </div>
      </div>

      {/* whatsapp */}
      <div className="mt-6 rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-white">WhatsApp Matchday Dispatch</h3>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              Sent automatically on booking completion · resend anytime
            </p>
          </div>
          <button
            onClick={sendWhatsApp}
            disabled={waBusy}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {waBusy ? 'Sending…' : 'Send on WhatsApp'}
          </button>
        </div>
        {wa && (
          <div className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm">
            {wa.error ? (
              <p className="text-rose-300">{wa.error}</p>
            ) : wa.mock ? (
              <p className="flex items-start gap-2 text-emerald-300">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Message queued in <b>mock mode</b> — check the server console for the WhatsApp
                  payload. Set <code className="rounded bg-black/40 px-1">WHATSAPP_TOKEN / WHATSAPP_PHONE_ID / WHATSAPP_TO</code>{' '}
                  env vars to send via Meta Cloud API.
                </span>
              </p>
            ) : (
              <p className="flex items-center gap-2 text-emerald-300">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Delivered via WhatsApp Cloud API</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* tourism */}
      {showTourism && (
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-white">{gapDays} Layover Days Before Next Match</h3>
              </div>
              <p className="mt-0.5 text-xs text-neutral-400">
                Regional tourism destinations around Mumbai Metropolitan Region.
              </p>
            </div>
            <Link href="/tourism" className="rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 text-xs font-bold text-white transition">
              Explore Regional Hubs →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(tourism ?? []).slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-xl bg-white/5 border border-white/5 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 mb-2">
                  <Compass className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-white">{s.name}</p>
                <p className="text-[11px] text-neutral-400">{s.distance_from_mumbai_km} km from DY Patil</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
