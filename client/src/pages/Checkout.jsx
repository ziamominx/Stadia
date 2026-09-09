import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import { kickoffLong, inr } from '../lib/format.js';

export default function Checkout() {
  const { matchId, blockId, seat } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => api.matchSeats(matchId), [matchId]);

  const [form, setForm] = useState({ name: '', phone: '', email: '', homeLocation: '' });
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><div className="h-64 animate-pulse rounded-2xl bg-navy-900" /></div>;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error?.message}</p>
        <Link to="/" className="mt-4 inline-block font-bold text-saffron-500">← Back to matches</Link>
      </div>
    );
  }

  const block = data.blocks.find((b) => b.id === Number(blockId));
  if (!block) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">Block not found. <Link to={`/match/${matchId}`} className="text-saffron-500">← choose a seat</Link></div>;
  }
  const seatTaken = (block.soldSeats ?? []).includes(seat);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setErr('Name and phone are required');
      return;
    }
    setSubmitting(true);
    try {
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
      navigate(`/ticket/${res.ticketId}`);
    } catch (e2) {
      setErr(e2.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-black text-white">Checkout</h1>
      <p className="mt-1 text-sm text-slate-400">One seat, one ticket ID, then we'll build your arrival plan.</p>

      {seatTaken && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          ⚠️ Seat {seat} in block {block.block_name} was just taken. Go back and pick another seat.
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-2xl border border-slate-700/60 bg-navy-900/70 p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Your details</h2>
            <label className="mb-1 block text-xs font-semibold text-slate-300">Full name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ananya Sharma"
              className="mb-3 w-full rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-saffron-500"
            />
            <label className="mb-1 block text-xs font-semibold text-slate-300">Phone (WhatsApp) *</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 98765 43210"
              className="mb-3 w-full rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-saffron-500"
            />
            <label className="mb-1 block text-xs font-semibold text-slate-300">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="mb-3 w-full rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-saffron-500"
            />
            <label className="mb-1 block text-xs font-semibold text-slate-300">Home location (city)</label>
            <input
              value={form.homeLocation}
              onChange={(e) => setForm({ ...form, homeLocation: e.target.value })}
              placeholder="e.g. Navi Mumbai, Bengaluru, Dubai…"
              className="w-full rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-saffron-500"
            />
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-navy-900/70 p-5">
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-400">Payment</h2>
            <p className="mb-3 text-[11px] text-slate-500">Demo only — no real charge, any details work.</p>
            <label className="mb-1 block text-xs font-semibold text-slate-300">Card number</label>
            <input
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
              placeholder="4242 4242 4242 4242"
              className="mb-3 w-full rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-saffron-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Expiry</label>
                <input
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  placeholder="12/27"
                  className="w-full rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-saffron-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">CVV</label>
                <input
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  placeholder="•••"
                  className="w-full rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-saffron-500"
                />
              </div>
            </div>
          </div>

          {err && <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">{err}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-saffron-500 to-pitch-500 py-3.5 text-base font-black text-white shadow-xl shadow-saffron-500/20 transition enabled:hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? 'Creating your ticket…' : `Pay ${inr(block.price)} (mock) & create ticket`}
          </button>
        </form>

        <div>
          <div className="rounded-2xl border border-slate-700/60 bg-navy-900/70 p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Order summary</h2>
            <p className="text-xs text-slate-500">{kickoffLong(data.match.kickoff_time)}</p>
            <p className="mt-1 text-lg font-extrabold text-white">
              {data.match.home_team} vs {data.match.away_team}
            </p>
            <div className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Block {block.block_name}</span>
                <span className="font-semibold text-white">{inr(block.price)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Seat</span>
                <span className="font-bold text-saffron-500">{seat}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Convenience fee</span>
                <span className="text-emerald-400">₹0</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3 text-base font-black text-white">
                <span>Total</span>
                <span>{inr(block.price)}</span>
              </div>
            </div>
            <p className="mt-4 rounded-lg bg-white/5 p-3 text-[11px] leading-relaxed text-slate-400">
              After payment you'll get a digital ticket with a unique ID, and a quick 2-step
              questionnaire to build your arrival plan (parking + gate, or hotel + shuttle).
            </p>
          </div>
          <Link to={`/match/${matchId}`} className="mt-3 block text-center text-sm font-semibold text-slate-400 hover:text-white">
            ← Back to seat map
          </Link>
        </div>
      </div>
    </div>
  );
}