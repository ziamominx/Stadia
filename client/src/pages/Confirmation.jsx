import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import QRCodeCard from '../components/QRCode.jsx';
import RouteMap from '../components/RouteMap.jsx';
import JourneyTimeline from '../components/JourneyTimeline.jsx';
import LiveBadge from '../components/LiveBadge.jsx';
import { kickoffLong, kickoffTime, clockTime, timeBefore, inr, teamFlag, shortName } from '../lib/format.js';

function InfoRow({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 transition hover:border-cyber-400/30">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-lg">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{sub}</p>}
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

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-ink-800" /></div>;
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error.message}</p>
        <Link to="/" className="mt-4 inline-block font-bold text-cyber-300">← Back to matches</Link>
      </div>
    );
  }

  if (!detail.ticket.visitor_type) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-white">Finish your arrival plan to see the full ticket.</p>
        <Link to={`/ticket/${ticketId}`} className="mt-3 inline-block font-bold text-cyber-300">Continue setup →</Link>
      </div>
    );
  }

  const t = detail.ticket;
  const isLocal = t.visitor_type === 'local';
  const isVehicle = isLocal && t.travel_mode === 'vehicle';
  const ko = detail.match.kickoff_time;

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
    gate: shortName(detail.entryGate?.name),
  });

  // Suggested event-day journey stops, derived from the assigned plan.
  const journeyStops = [];
  if (isLocal && isVehicle && detail.parkingZone) {
    journeyStops.push(
      { time: clockTime(timeBefore(ko, 75)), icon: '🚗', title: 'Leave for the stadium', sub: `${detail.parkingZone.name} parking · follow stadium signs` },
      { time: clockTime(timeBefore(ko, 50)), icon: '🅿️', title: `Parking ${detail.parkingZone.name}`, sub: detail.routingDecision?.reassigned ? `Auto-routed: ${detail.routingDecision.reason}` : 'Vehicle tag on entry · follow P-signage' },
      { time: clockTime(timeBefore(ko, 35)), icon: '🚪', title: `Gate ${shortName(detail.entryGate?.name)}`, sub: 'Local corridor · North/West approach' },
      { time: clockTime(timeBefore(ko, 25)), icon: '🛂', title: 'Security & scan', sub: 'Present your QR at the turnstile' },
      { time: clockTime(timeBefore(ko, 18)), icon: '🧭', title: `Block ${detail.block.block_name}`, sub: 'Find your row · follow the concourse' },
      { time: clockTime(timeBefore(ko, 15)), icon: '💺', title: `Seat ${t.seat_number}`, sub: `Settle in — kickoff ${kickoffTime(ko)}`, accent: 'hot' },
    );
  } else if (isLocal) {
    journeyStops.push(
      { time: clockTime(timeBefore(ko, 60)), icon: '🚆', title: 'Head to the station', sub: detail.transitHint || 'Nearest rail point to the stadium' },
      { time: clockTime(timeBefore(ko, 35)), icon: '🚪', title: `Gate ${shortName(detail.entryGate?.name)}`, sub: 'Local corridor · North/West approach' },
      { time: clockTime(timeBefore(ko, 25)), icon: '🛂', title: 'Security & scan', sub: 'Present your QR at the turnstile' },
      { time: clockTime(timeBefore(ko, 15)), icon: '💺', title: `Seat ${t.seat_number}`, sub: `Settle in — kickoff ${kickoffTime(ko)}`, accent: 'hot' },
    );
  } else if (detail.hotel && detail.shuttle) {
    journeyStops.push(
      { time: clockTime(timeBefore(ko, 90)), icon: '🏨', title: `Depart ${detail.hotel.name}`, sub: `${detail.hotel.zone} · hotel shuttle pickup point` },
      { time: clockTime(timeBefore(ko, 60)), icon: '🚐', title: `Shuttle ${detail.shuttle.zone}`, sub: `Departs ${detail.shuttle.departure_time} · boarding shows your ticket ID` },
      { time: clockTime(timeBefore(ko, 30)), icon: '🚪', title: `Gate ${shortName(detail.entryGate?.name)}`, sub: 'Outstation corridor · East/South approach' },
      { time: clockTime(timeBefore(ko, 20)), icon: '🛂', title: 'Security & scan', sub: 'Present your QR at the turnstile' },
      { time: clockTime(timeBefore(ko, 12)), icon: '💺', title: `Seat ${t.seat_number}`, sub: `Settle in — kickoff ${kickoffTime(ko)}`, accent: 'hot' },
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
            <span className="live-dot" /> Ticket confirmed
          </p>
          <h1 className="mt-1.5 text-2xl font-black text-white sm:text-3xl">
            {detail.match.home_team} vs {detail.match.away_team}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {kickoffLong(ko)} · {detail.match.venue}
          </p>
        </div>
        <Link to="/" className="btn-ghost !px-4 !py-2.5 text-sm">Book another match</Link>
      </div>

      {/* ── DIGITAL TICKET ──────────────────────────────────────────── */}
      <div className="panel fade-up mt-8 overflow-hidden rounded-3xl">
        <div className="relative bg-gradient-to-r from-ink-800 via-ink-850 to-ink-900 px-6 py-4">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyber-500 via-volt-400 to-cyber-500" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-500 to-volt-500 text-sm font-black text-ink-950">S</span>
              <div>
                <p className="text-sm font-black tracking-[0.18em] text-white">STADIA<span className="text-cyber-400">.</span></p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Digital match ticket</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="chip border-cyber-400/40 bg-cyber-400/10 text-cyber-300">⚡ Smart routing enabled</span>
              <span className="chip hidden border-white/15 text-slate-400 sm:inline-flex">FIFA Women’s World Cup India</span>
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[260px_1fr]">
          {/* QR column */}
          <div className="relative flex flex-col items-center justify-center gap-3 border-b border-white/[0.07] bg-ink-900/60 p-6 md:border-b-0 md:border-r">
            <div className="qr-shimmer rounded-2xl bg-white p-3 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
              <QRCodeCard text={qrPayload} size={176} />
            </div>
            <div className="text-center">
              <p className="font-mono text-sm font-bold tracking-wider text-cyber-300">{t.unique_ticket_id}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Present at gate · entry {detail.entryGate?.name}</p>
            </div>
          </div>

          {/* details */}
          <div className="p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink-950 text-xl">{teamFlag(detail.match.home_team)}</span>
                <div>
                  <p className="text-lg font-black leading-tight text-white">
                    {detail.match.home_team} <span className="text-slate-500">vs</span> {detail.match.away_team}
                  </p>
                  <p className="text-[11px] text-slate-400">{detail.match.venue} · kickoff {kickoffTime(ko)}</p>
                </div>
              </div>
              <span className="tabular chip border-amber-400/40 bg-amber-400/10 font-mono text-amber-300">
                {inr(detail.block.price)}
              </span>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <InfoRow icon="💺" label="Seat" value={`Block ${detail.block.block_name} · Seat ${t.seat_number}`} sub={inr(detail.block.price)} />
              <InfoRow icon="🚪" label="Entry gate" value={shortName(detail.entryGate?.name)} sub={isLocal ? 'Local flow · North/West' : 'Outstation flow · East/South'} />
              <InfoRow icon="🚪" label="Exit gate" value={shortName(detail.exitGate?.name)} sub="Use for post-match exit" />
              {isLocal && !isVehicle && (
                <InfoRow icon="🚆" label="Transit plan" value={detail.transitHint || 'Nearest gate routing'} sub="Show this at the gate if asked" />
              )}
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
        </div>

        {/* journey */}
        <div className="grid gap-8 border-t border-white/[0.07] p-6 md:grid-cols-[1fr_1.15fr]">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-300">Your event journey</h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Suggested times before kickoff · {kickoffTime(ko)}. Follow the green path on the map.
            </p>
            <div className="mt-4">
              <JourneyTimeline stops={journeyStops} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-300">Match-day route</h2>
            <RouteMap route={detail.route} height="h-[360px]" />
            <p className="mt-2 text-[11px] text-slate-500">
              <span className="text-emerald-400">— green</span> arrival path ·{' '}
              <span className="text-rose-400">- - red</span> post-match exit path
              {isLocal && isVehicle && ' · local fans use North/West gates, outstation fans use East/South gates so crowds never mix'}
            </p>
          </div>
        </div>
      </div>

      {/* ── OFFERS ──────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {!isLocal && (
          <div className="panel rounded-2xl border border-rose-400/25 p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏨</span>
              <div>
                <h3 className="font-black text-white">10% off your hotel booking</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {detail.hotel ? `Applies to ${detail.hotel.name} — 2 nights reserved for you.` : 'Applies to your selected partner hotel.'}
                </p>
              </div>
            </div>
            {detail.claims.includes('hotel') ? (
              <span className="chip mt-4 border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                ✓ Claimed — discount linked to {t.unique_ticket_id}
              </span>
            ) : (
              <button
                disabled={claiming === 'hotel'}
                onClick={() => claim('hotel')}
                className="mt-4 rounded-xl bg-rose-400/90 px-4 py-2.5 text-sm font-extrabold text-ink-950 transition hover:bg-rose-400 disabled:opacity-50"
              >
                {claiming === 'hotel' ? 'Claiming…' : 'Claim 10% hotel discount'}
              </button>
            )}
          </div>
        )}
        <div className="panel rounded-2xl border border-cyber-400/25 p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📺</span>
            <div>
              <h3 className="font-black text-white">10% off Airtel TV FIFA subscription</h3>
              <p className="mt-0.5 text-xs text-slate-400">Catch every match from home too — for all fans.</p>
            </div>
          </div>
          {detail.claims.includes('airtel_tv') ? (
            <span className="chip mt-4 border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
              ✓ Claimed — referral tracked on {t.unique_ticket_id}
            </span>
          ) : (
            <button
              disabled={claiming === 'airtel_tv'}
              onClick={() => claim('airtel_tv')}
              className="mt-4 rounded-xl bg-cyber-400/90 px-4 py-2.5 text-sm font-extrabold text-ink-950 transition hover:bg-cyber-300 disabled:opacity-50"
            >
              {claiming === 'airtel_tv' ? 'Claiming…' : 'Claim Airtel TV discount'}
            </button>
          )}
        </div>
      </div>

      {/* ── WHATSAPP ────────────────────────────────────────────────── */}
      <div className="panel mt-6 rounded-2xl border border-emerald-400/25 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h3 className="font-black text-white">WhatsApp confirmation</h3>
              <p className="mt-0.5 text-xs text-slate-400">Sent automatically on booking · resend anytime</p>
            </div>
          </div>
          <button
            onClick={sendWhatsApp}
            disabled={waBusy}
            className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-extrabold text-ink-950 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {waBusy ? 'Sending…' : 'Send on WhatsApp'}
          </button>
        </div>
        {wa && (
          <div className="mt-3 rounded-xl bg-emerald-400/10 p-3 text-sm">
            {wa.error ? (
              <p className="font-semibold text-rose-300">{wa.error}</p>
            ) : wa.mock ? (
              <p className="text-emerald-300">
                ✓ Message queued in <b>mock mode</b> — check the server console for the payload. Set{' '}
                <code className="rounded bg-black/40 px-1">WHATSAPP_TOKEN / WHATSAPP_PHONE_ID / WHATSAPP_TO</code>{' '}
                env vars to send via the Meta Cloud API.
              </p>
            ) : (
              <p className="text-emerald-300">✓ Delivered via WhatsApp Cloud API</p>
            )}
          </div>
        )}
      </div>

      {/* ── TOURISM ─────────────────────────────────────────────────── */}
      {showTourism && (
        <div className="panel mt-6 rounded-2xl border border-amber-400/25 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-white">⛰️ You have {gapDays} gap day{gapDays > 1 ? 's' : ''} before your next match</h3>
              <p className="mt-0.5 text-xs text-slate-400">Make the most of the break — day trips from Navi Mumbai, no booking needed.</p>
            </div>
            <Link to="/tourism" className="btn-primary !px-4 !py-2.5 text-[13px]">Explore getaways →</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(tourism ?? []).slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                <p className="text-2xl">{s.image_emoji}</p>
                <p className="mt-1 text-sm font-black text-white">{s.name}</p>
                <p className="tabular text-[11px] text-slate-400">{s.distance_from_mumbai_km} km from Mumbai</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <LiveBadge label="Smart routing enabled" />
      </div>
    </div>
  );
}