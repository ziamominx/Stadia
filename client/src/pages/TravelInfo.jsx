import { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useApi, api } from '../api.js';
import { kickoffLong, inr } from '../lib/format.js';

const TIER_ORDER = { Luxury: 0, Premium: 1, Budget: 2 };
const TIER_STYLE = {
  Luxury: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  Premium: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  Budget: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
};

export default function TravelInfo() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { data: detail, loading, error } = useApi(() => api.ticket(ticketId), [ticketId]);
  const { data: hotels } = useApi(api.hotels);

  const [visitorType, setVisitorType] = useState(null);
  const [travelMode, setTravelMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [zoneFilter, setZoneFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><div className="h-64 animate-pulse rounded-2xl bg-navy-900" /></div>;
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error.message}</p>
        <Link to="/" className="mt-4 inline-block font-bold text-saffron-500">← Back to matches</Link>
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
      await api.travelInfo(ticketId, { visitorType: 'local', travelMode: mode });
      navigate(`/ticket/${ticketId}/confirmation`);
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
      navigate(`/ticket/${ticketId}/confirmation`);
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-white">← Home</Link>

      {/* booking summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/60 bg-navy-900/70 p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Your ticket</p>
          <p className="text-lg font-extrabold text-white">
            {detail.match.home_team} vs {detail.match.away_team}
          </p>
          <p className="text-xs text-slate-400">
            {kickoffLong(detail.match.kickoff_time)} · Block {detail.block.block_name} · Seat{' '}
            {detail.ticket.seat_number} · <span className="font-mono text-saffron-500">{detail.ticket.unique_ticket_id}</span>
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
          ✓ Ticket booked
        </span>
      </div>

      {/* step 1 */}
      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-saffron-500">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-black text-white">How are you getting to the stadium?</h1>
        <p className="mt-1 text-sm text-slate-400">
          We'll route you through the crowd-orchestration system — different gates and paths for
          local and outstation fans.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => { setVisitorType('local'); setErr(null); }}
            className={`rounded-2xl border-2 p-5 text-left transition ${
              visitorType === 'local'
                ? 'border-sky-500 bg-sky-500/10'
                : 'border-slate-800 bg-navy-900/70 hover:border-sky-500/50'
            }`}
          >
            <span className="text-3xl">🏠</span>
            <h3 className="mt-2 text-lg font-bold text-white">I'm local to Mumbai / Navi Mumbai</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Get an assigned parking zone + gate, or the nearest gate via rail. North/West gates
              (A, B, G, H).
            </p>
          </button>
          <button
            onClick={() => { setVisitorType('outstation'); setErr(null); }}
            className={`rounded-2xl border-2 p-5 text-left transition ${
              visitorType === 'outstation'
                ? 'border-rose-500 bg-rose-500/10'
                : 'border-slate-800 bg-navy-900/70 hover:border-rose-500/50'
            }`}
          >
            <span className="text-3xl">✈️</span>
            <h3 className="mt-2 text-lg font-bold text-white">Travelling from elsewhere / another country</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Pick a partner hotel — we'll assign your shuttle zone, departure slot and East/South
              gate (C, D, E, F).
            </p>
          </button>
        </div>
      </div>

      {/* step 2 local */}
      {visitorType === 'local' && (
        <div className="fade-up mt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-saffron-500">Step 2 of 2</p>
          <h2 className="mt-1 text-xl font-black text-white">How are you travelling today?</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              disabled={submitting}
              onClick={() => submitLocal('vehicle')}
              className="rounded-2xl border-2 border-slate-800 bg-navy-900/70 p-5 text-left transition hover:border-emerald-500/60 disabled:opacity-50"
            >
              <span className="text-3xl">🚗</span>
              <h3 className="mt-2 text-lg font-bold text-white">Personal vehicle</h3>
              <p className="mt-1 text-xs text-slate-400">
                We'll assign a parking zone near your seat block and the walking path to your gate.
              </p>
            </button>
            <button
              disabled={submitting}
              onClick={() => submitLocal('transit')}
              className="rounded-2xl border-2 border-slate-800 bg-navy-900/70 p-5 text-left transition hover:border-emerald-500/60 disabled:opacity-50"
            >
              <span className="text-3xl">🚆</span>
              <h3 className="mt-2 text-lg font-bold text-white">Public transport</h3>
              <p className="mt-1 text-xs text-slate-400">
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
          <p className="text-xs font-bold uppercase tracking-widest text-saffron-500">Step 2 of 2</p>
          <h2 className="mt-1 text-xl font-black text-white">Choose your partner hotel</h2>
          <p className="mt-1 text-sm text-slate-400">
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
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {z}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-slate-700" />
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                  tierFilter === t
                    ? 'border-saffron-500 bg-saffron-500/15 text-saffron-500'
                    : 'border-slate-700 text-slate-400 hover:text-white'
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
                  className="rounded-2xl border border-slate-800 bg-navy-900/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-rose-500/60 hover:shadow-lg disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white">{h.name}</h3>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TIER_STYLE[h.tier]}`}>
                      {h.tier}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {h.zone} · {h.distance_from_stadium_km} km from stadium
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{inr(h.nightly_rate)} / night</span>
                    <span className="text-xs font-bold text-saffron-500">10% off →</span>
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