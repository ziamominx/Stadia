import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import QRCodeCard from '../components/QRCode.jsx';
import RouteMap from '../components/RouteMap.jsx';
import { kickoffLong, inr } from '../lib/format.js';

function InfoRow({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
      <span className="text-xl">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function Confirmation() {
  const { ticketId } = useParams();
  const { data: detail, loading, error, reload } = useApi(() => api.ticket(ticketId), [ticketId]);
  const { data: matches } = useApi(api.matches);
  const { data: tourism } = useApi(api.tourism);

  const [wa, setWa] = useState(null);
  const [waBusy, setWaBusy] = useState(false);
  const [claiming, setClaiming] = useState(null);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><div className="h-72 animate-pulse rounded-2xl bg-navy-900" /></div>;
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error.message}</p>
        <Link to="/" className="mt-4 inline-block font-bold text-saffron-500">← Back to matches</Link>
      </div>
    );
  }

  if (!detail.ticket.visitor_type) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-white">Finish your arrival plan to see the full ticket.</p>
        <Link to={`/ticket/${ticketId}`} className="mt-3 inline-block font-bold text-saffron-500">Continue setup →</Link>
      </div>
    );
  }

  const t = detail.ticket;
  const isLocal = t.visitor_type === 'local';
  const isVehicle = isLocal && t.travel_mode === 'vehicle';

  // tourism if the gap to the next match is >= 2 days
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
    seat: `${detail.block.block_name}-${t.seat_number}`,
    gate: detail.entryGate?.name,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">✓ Ticket confirmed</p>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            {detail.match.home_team} vs {detail.match.away_team}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {kickoffLong(detail.match.kickoff_time)} · {detail.match.venue}
          </p>
        </div>
        <Link
          to="/"
          className="rounded-xl border border-slate-600 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
        >
          Book another match
        </Link>
      </div>

      {/* ticket */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-navy-900/70">
        <div className="flex flex-col gap-6 p-6 md:flex-row">
          <div className="flex flex-col items-center gap-3 md:w-56 md:shrink-0">
            <QRCodeCard text={qrPayload} />
            <div className="text-center">
              <p className="font-mono text-sm font-bold text-saffron-500">{t.unique_ticket_id}</p>
              <p className="text-[11px] text-slate-500">Present this QR at the gate</p>
            </div>
          </div>

          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <InfoRow icon="💺" label="Seat" value={`Block ${detail.block.block_name} · Seat ${t.seat_number}`} sub={inr(detail.block.price)} />
            <InfoRow icon="🚪" label="Entry gate" value={detail.entryGate?.name} sub={isLocal ? 'Local flow · N/W side' : 'Outstation flow · E/S side'} />
            <InfoRow icon="🚪" label="Exit gate" value={detail.exitGate?.name} sub="Use for post-match exit" />

            {isVehicle && detail.parkingZone && (
              <InfoRow
                icon="🅿️"
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
              <InfoRow icon="🚆" label="Transit plan" value={detail.transitHint || 'Nearest gate routing'} sub="Show this at the gate if asked" />
            )}
            {!isLocal && detail.hotel && (
              <InfoRow
                icon="🏨"
                label="Hotel"
                value={detail.hotel.name}
                sub={`${detail.hotel.zone} · ${detail.hotel.tier} · ${inr(detail.hotel.nightly_rate)}/night · check-in ${new Date(detail.hotelBooking.checkin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              />
            )}
            {!isLocal && detail.shuttle && (
              <InfoRow
                icon="🚐"
                label="Shuttle"
                value={`${detail.shuttle.zone} · departs ${detail.shuttle.departure_time}`}
                sub="Boarding shows your ticket ID"
              />
            )}
          </div>
        </div>

        {/* route map */}
        <div className="border-t border-slate-800 p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
            Your match-day route
          </h2>
          <RouteMap route={detail.route} />
          <p className="mt-2 text-[11px] text-slate-500">
            <span className="text-emerald-400">—— green</span> = arrival path ·{' '}
            <span className="text-rose-400">- - red</span> = post-match exit path
            {isLocal && isVehicle && ' · local fans use North/West gates, outstation fans use East/South gates so crowds never mix'}
          </p>
        </div>
      </div>

      {/* offers */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {!isLocal && (
          <div className="rounded-2xl border border-rose-500/30 bg-navy-900/70 p-5">
            <p className="text-2xl">🏨</p>
            <h3 className="mt-1 font-bold text-white">10% off your hotel booking</h3>
            <p className="mt-1 text-xs text-slate-400">
              {detail.hotel ? `Applies to ${detail.hotel.name} — we've already reserved 2 nights for you.` : 'Applies to your selected partner hotel.'}
            </p>
            {detail.claims.includes('hotel') ? (
              <span className="mt-3 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                ✓ Claimed — discount linked to ticket {t.unique_ticket_id}
              </span>
            ) : (
              <button
                disabled={claiming === 'hotel'}
                onClick={() => claim('hotel')}
                className="mt-3 rounded-lg bg-rose-500/90 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {claiming === 'hotel' ? 'Claiming…' : 'Claim 10% hotel discount'}
              </button>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-sky-500/30 bg-navy-900/70 p-5">
          <p className="text-2xl">📺</p>
          <h3 className="mt-1 font-bold text-white">10% off Airtel TV FIFA subscription</h3>
          <p className="mt-1 text-xs text-slate-400">
            Catch every match from home too — this offer is for all fans, local or not.
          </p>
          {detail.claims.includes('airtel_tv') ? (
            <span className="mt-3 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              ✓ Claimed — referral tracked on ticket {t.unique_ticket_id}
            </span>
          ) : (
            <button
              disabled={claiming === 'airtel_tv'}
              onClick={() => claim('airtel_tv')}
              className="mt-3 rounded-lg bg-sky-500/90 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-500 disabled:opacity-50"
            >
              {claiming === 'airtel_tv' ? 'Claiming…' : 'Claim Airtel TV discount'}
            </button>
          )}
        </div>
      </div>

      {/* whatsapp */}
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-navy-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white">💬 WhatsApp confirmation</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Sent automatically on booking completion · resend anytime
            </p>
          </div>
          <button
            onClick={sendWhatsApp}
            disabled={waBusy}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-navy-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {waBusy ? 'Sending…' : 'Send on WhatsApp'}
          </button>
        </div>
        {wa && (
          <div className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm">
            {wa.error ? (
              <p className="text-rose-300">{wa.error}</p>
            ) : wa.mock ? (
              <p className="text-emerald-300">
                ✓ Message queued in <b>mock mode</b> — check the server console for the WhatsApp
                payload. Set <code className="rounded bg-black/40 px-1">WHATSAPP_TOKEN / WHATSAPP_PHONE_ID / WHATSAPP_TO</code>{' '}
                env vars to send via Meta Cloud API.
              </p>
            ) : (
              <p className="text-emerald-300">✓ Delivered via WhatsApp Cloud API</p>
            )}
          </div>
        )}
      </div>

      {/* tourism */}
      {showTourism && (
        <div className="mt-6 rounded-2xl border border-saffron-500/30 bg-navy-900/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">🌄 You have {gapDays} gap days before your next match</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Make the most of the break — day trips from Navi Mumbai, no booking needed.
              </p>
            </div>
            <Link to="/tourism" className="rounded-lg bg-gradient-to-r from-saffron-500 to-pitch-500 px-4 py-2 text-sm font-bold text-white transition hover:brightness-110">
              Explore getaways →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(tourism ?? []).slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-xl bg-white/5 p-3">
                <p className="text-2xl">{s.image_emoji}</p>
                <p className="mt-1 text-sm font-bold text-white">{s.name}</p>
                <p className="text-[11px] text-slate-400">{s.distance_from_mumbai_km} km from Mumbai</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}