import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useApi, api } from '../api.js';
import Stepper from '../components/Stepper.jsx';
import { kickoffLong, inr, teamFlag } from '../lib/format.js';

const TIER_ORDER = { Luxury: 0, Premium: 1, Budget: 2 };
const TIER_STYLE = {
  Luxury: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  Premium: 'border-cyber-400/40 bg-cyber-400/10 text-cyber-300',
  Budget: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
};

/* STADIA Intelligence overlay — the "smart assignment moment". */
function IntelligenceOverlay({ kind, decision, onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const reassigned = decision?.reassigned;
    const steps =
      kind === 'local'
        ? reassigned
          ? [
              { icon: '📡', title: 'Detecting arrival plan', sub: 'Locating your seat block & nearest gates' },
              { icon: '🧠', title: 'Analyzing zone capacity', sub: 'Checking live parking load across the corridor' },
              { icon: '⚠️', title: 'Capacity risk detected', sub: `${decision.reason}` },
              { icon: '🔁', title: 'Reassigning route', sub: 'Updating your parking assignment…' },
              { icon: '✅', title: 'Route updated', sub: 'Your ticket now reflects the new zone' },
            ]
          : [
              { icon: '📡', title: 'Detecting arrival plan', sub: 'Locating your seat block & nearest gates' },
              { icon: '🧠', title: 'Analyzing zone capacity', sub: 'Checking live parking load across the corridor' },
              { icon: '✅', title: 'Route assigned', sub: 'Nearest zone has capacity — no change needed' },
            ]
        : [
            { icon: '🏨', title: 'Detecting hotel zone', sub: 'Locating your partner hotel & corridor' },
            { icon: '🚐', title: 'Assigning shuttle corridor', sub: 'Matching your hotel to the nearest drop point' },
            { icon: '🕒', title: 'Reserving departure slot', sub: 'Picking the least-loaded shuttle time' },
            { icon: '✅', title: 'Route updated', sub: 'Hotel → shuttle → gate → seat, locked in' },
          ];
    const timers = steps.map((_, i) =>
      setTimeout(() => setPhase(i + 1), 500 + i * 560),
    );
    timers.push(setTimeout(onDone, 500 + steps.length * 560 + 350));
    return () => timers.forEach(clearTimeout);
  }, [kind, decision, onDone]);

  const steps =
    kind === 'local' && decision?.reassigned
      ? [
          { icon: '📡', title: 'Detecting arrival plan' },
          { icon: '🧠', title: 'Analyzing zone capacity' },
          { icon: '⚠️', title: 'Capacity risk detected' },
          { icon: '🔁', title: 'Reassigning route' },
          { icon: '✅', title: 'Route updated' },
        ]
      : kind === 'local'
        ? [
            { icon: '📡', title: 'Detecting arrival plan' },
            { icon: '🧠', title: 'Analyzing zone capacity' },
            { icon: '✅', title: 'Route assigned' },
          ]
        : [
            { icon: '🏨', title: 'Detecting hotel zone' },
            { icon: '🚐', title: 'Assigning shuttle corridor' },
            { icon: '🕒', title: 'Reserving departure slot' },
            { icon: '✅', title: 'Route updated' },
          ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="fade-up panel w-full max-w-md overflow-hidden rounded-2xl">
        <div className="relative border-b border-white/[0.07] bg-gradient-to-r from-ink-800 to-ink-900 px-6 py-4">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-400/60 to-transparent" />
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-300">STADIA Intelligence</p>
          </div>
        </div>
        <div className="space-y-1 px-6 py-5">
          {steps.map((s, i) => {
            const done = i < phase;
            const active = i === phase;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  active ? 'bg-cyber-400/[0.08]' : ''
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-base transition ${
                    done
                      ? 'border-emerald-400/50 bg-emerald-400/15'
                      : active
                        ? 'border-cyber-400/60 bg-cyber-400/15 shadow-[0_0_14px_rgba(34,211,238,0.4)]'
                        : 'border-white/10 bg-white/[0.03] opacity-40'
                  }`}
                >
                  {done ? '✓' : s.icon}
                </span>
                <div>
                  <p className={`text-sm font-bold ${done || active ? 'text-white' : 'text-slate-500'}`}>{s.title}</p>
                  {active && decision?.reassigned && i === 2 && (
                    <p className="text-[11px] text-amber-300">{decision.reason}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-1 overflow-hidden rounded-b-2xl bg-white/[0.05]">
          <div
            className="h-full bg-gradient-to-r from-cyber-500 to-volt-400 transition-all duration-500"
            style={{ width: `${Math.min(100, (phase / steps.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function TravelInfo() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { data: detail, loading, error } = useApi(() => api.ticket(ticketId), [ticketId]);
  const { data: hotels } = useApi(api.hotels);

  const [visitorType, setVisitorType] = useState(null);
  const [travelMode, setTravelMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [intel, setIntel] = useState(null); // { kind, decision } while animating
  const [zoneFilter, setZoneFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-ink-800" /></div>;
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error.message}</p>
        <Link to="/" className="mt-4 inline-block font-bold text-cyber-300">← Back to matches</Link>
      </div>
    );
  }

  // Already planned → straight to confirmation
  if (detail.ticket.visitor_type) {
    return <Navigate to={`/ticket/${ticketId}/confirmation`} replace />;
  }

  const submitLocal = async (mode) => {
    setSubmitting(true);
    setErr(null);
    try {
      const res = await api.travelInfo(ticketId, { visitorType: 'local', travelMode: mode });
      setIntel({ kind: 'local', decision: res.routingDecision });
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
      setIntel({ kind: 'outstation', decision: null });
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-white">← Home</Link>
        <Stepper steps={['Match', 'Seats', 'Travel', 'Confirm']} current={2} />
      </div>

      {/* booking summary */}
      <div className="panel fade-up mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink-950 text-xl">
            {teamFlag(detail.match.home_team)}
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Your ticket</p>
            <p className="text-lg font-black text-white">
              {detail.match.home_team} vs {detail.match.away_team}
            </p>
            <p className="text-xs text-slate-400">
              {kickoffLong(detail.match.kickoff_time)} · Block {detail.block.block_name} · Seat{' '}
              {detail.ticket.seat_number}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold text-cyber-300">{detail.ticket.unique_ticket_id}</p>
          <span className="chip mt-1 border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
            <span className="live-dot" /> Ticket booked
          </span>
        </div>
      </div>

      {/* step 1 — visitor classification */}
      <div className="mt-10">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">
          <span className="tabular mr-1.5">03</span> · Travel
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">How are you reaching the event?</h1>
        <p className="mt-2 text-sm text-slate-400">
          This choice decides your corridor: local fans route through North/West gates, outstation
          fans through East/South — the two crowds stay physically separated.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => { setVisitorType('local'); setErr(null); }}
            className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition ${
              visitorType === 'local'
                ? 'border-cyber-400 bg-cyber-400/[0.08] shadow-[0_0_30px_rgba(14,165,233,0.2)]'
                : 'border-white/10 bg-ink-850 hover:border-cyber-400/50'
            }`}
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyber-500/15 blur-2xl" />
            <span className="text-4xl">🏠</span>
            <h3 className="mt-3 text-lg font-black text-white">I’m local</h3>
            <p className="text-xs font-semibold text-cyber-300">Live in or near Navi Mumbai</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Assigned parking zone + gate, or the nearest gate via rail. Corridor: North / West
              gates (A, B, G, H).
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-cyber-400" /> Parking · Rail · North/West
            </div>
          </button>
          <button
            onClick={() => { setVisitorType('outstation'); setErr(null); }}
            className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition ${
              visitorType === 'outstation'
                ? 'border-rose-400 bg-rose-400/[0.08] shadow-[0_0_30px_rgba(251,113,133,0.2)]'
                : 'border-white/10 bg-ink-850 hover:border-rose-400/50'
            }`}
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/15 blur-2xl" />
            <span className="text-4xl">✈️</span>
            <h3 className="mt-3 text-lg font-black text-white">Outstation / international</h3>
            <p className="text-xs font-semibold text-rose-300">Travelling to attend the event</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Pick a partner hotel — we assign your shuttle zone, departure slot and gate.
              Corridor: East / South gates (C, D, E, F).
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Hotel · Shuttle · East/South
            </div>
          </button>
        </div>
      </div>

      {/* step 2 local */}
      {visitorType === 'local' && (
        <div className="fade-up mt-10">
          <h2 className="text-xl font-black text-white">Travel mode</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              disabled={submitting}
              onClick={() => submitLocal('vehicle')}
              className="panel panel-hover group rounded-2xl border border-white/10 p-6 text-left"
            >
              <span className="text-4xl">🚗</span>
              <h3 className="mt-3 text-lg font-black text-white">Personal vehicle</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                STADIA assigns a load-aware parking zone near your seat block plus the walking path
                to your gate.
              </p>
              <p className="mt-3 text-xs font-bold text-cyber-300 opacity-0 transition group-hover:opacity-100">Assign parking →</p>
            </button>
            <button
              disabled={submitting}
              onClick={() => submitLocal('transit')}
              className="panel panel-hover group rounded-2xl border border-white/10 p-6 text-left"
            >
              <span className="text-4xl">🚆</span>
              <h3 className="mt-3 text-lg font-black text-white">Public transport</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                We route you to the nearest gate and suggest the closest railway station.
              </p>
              <p className="mt-3 text-xs font-bold text-cyber-300 opacity-0 transition group-hover:opacity-100">Route to gate →</p>
            </button>
          </div>
          {err && <p className="mt-3 text-sm font-semibold text-rose-300">{err}</p>}
        </div>
      )}

      {/* step 2 outstation */}
      {visitorType === 'outstation' && (
        <div className="fade-up mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Choose your partner hotel</h2>
              <p className="mt-1 text-sm text-slate-400">
                10% event discount tracked on your ticket, plus an assigned shuttle slot.
              </p>
            </div>
            <span className="chip border-rose-400/40 bg-rose-400/10 text-rose-300">STADIA partner</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => setZoneFilter(z)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  zoneFilter === z
                    ? 'border-rose-400 bg-rose-400/15 text-rose-300'
                    : 'border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {z}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-white/10" />
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  tierFilter === t
                    ? 'border-cyber-400 bg-cyber-400/15 text-cyber-300'
                    : 'border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {filteredHotels
              .sort((a, b) => a.distance_from_stadium_km - b.distance_from_stadium_km)
              .map((h, i) => (
                <button
                  key={h.id}
                  disabled={submitting}
                  onClick={() => submitOutstation(h.id)}
                  className="panel panel-hover fade-up group rounded-2xl p-5 text-left"
                  style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-ink-950 text-xl">🏨</span>
                      <div>
                        <h3 className="font-black text-white">{h.name}</h3>
                        <p className="text-[11px] text-slate-400">
                          {h.zone} · <span className="tabular">{h.distance_from_stadium_km} km</span> from stadium
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TIER_STYLE[h.tier]}`}>
                      {h.tier}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
                    <span className="tabular text-sm font-bold text-slate-300">{inr(h.nightly_rate)} / night</span>
                    <span className="flex items-center gap-1.5 text-xs font-extrabold text-cyber-300">
                      <span className="rounded bg-cyber-400/15 px-1.5 py-0.5 text-[10px]">10% off</span>
                      Select →
                    </span>
                  </div>
                </button>
              ))}
          </div>
          {err && <p className="mt-3 text-sm font-semibold text-rose-300">{err}</p>}
        </div>
      )}

      {intel && (
        <IntelligenceOverlay
          kind={intel.kind}
          decision={intel.decision}
          onDone={() => navigate(`/ticket/${ticketId}/confirmation`)}
        />
      )}
    </div>
  );
}