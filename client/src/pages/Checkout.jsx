import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import Stepper from '../components/Stepper.jsx';
import { kickoffLong, kickoffDate, kickoffTime, inr, teamFlag } from '../lib/format.js';
import { saveTicket } from '../lib/tickets.js';

function Field({ label, required, ...props }) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-xs font-bold text-slate-300">
        {label} {required && <span className="text-cyber-400">*</span>}
      </label>
      <input className="input-dark" {...props} />
    </div>
  );
}

export default function Checkout() {
  const { matchId, blockId, seat } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => api.matchSeats(matchId), [matchId]);

  const [form, setForm] = useState({ name: '', phone: '', email: '', homeLocation: '' });
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-ink-800" /></div>;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error?.message}</p>
        <Link to="/" className="mt-4 inline-block font-bold text-cyber-300">← Back to matches</Link>
      </div>
    );
  }

  const block = data.blocks.find((b) => b.id === Number(blockId));
  if (!block) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">Block not found. <Link to={`/match/${matchId}`} className="text-cyber-300">← choose a seat</Link></div>;
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
      saveTicket({
        id: res.ticketId,
        matchId: Number(matchId),
        match: `${data.match.home_team} vs ${data.match.away_team}`,
        kickoff: data.match.kickoff_time,
        block: block.block_name,
        seat,
        price: block.price,
        status: 'pending',
      });
      navigate(`/ticket/${res.ticketId}`);
    } catch (e2) {
      setErr(e2.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`/match/${matchId}`} className="text-sm font-semibold text-slate-400 hover:text-white">← Seat map</Link>
        <Stepper steps={['Match', 'Seats', 'Travel', 'Confirm']} current={1} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Checkout</h1>
          <p className="mt-1 text-sm text-slate-400">One seat, one ticket ID — then we build your arrival plan.</p>
        </div>
        <span className="chip border-amber-400/40 bg-amber-400/10 text-amber-300">Demo payment · no real charge</span>
      </div>

      {seatTaken && (
        <div className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">
          ⚠ Seat {seat} in block {block.block_name} was just taken. Go back and pick another seat.
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_1fr]">
        <form onSubmit={submit} className="space-y-5">
          <div className="panel rounded-2xl p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-slate-300">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyber-400/15 text-[11px] font-black text-cyber-300">1</span>
              Your details
            </h2>
            <Field label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ananya Sharma" />
            <Field label="Phone (WhatsApp)" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 98765 43210" />
            <Field label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            <Field label="Home location (city)" value={form.homeLocation} onChange={(e) => setForm({ ...form, homeLocation: e.target.value })} placeholder="e.g. Navi Mumbai, Bengaluru, Dubai…" />
          </div>

          <div className="panel rounded-2xl p-5 sm:p-6">
            <h2 className="mb-1 text-sm font-extrabold uppercase tracking-widest text-slate-300">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyber-400/15 text-[11px] font-black text-cyber-300">2</span>
              Payment
            </h2>
            <p className="mb-4 text-[11px] text-slate-500">Demo only — any card details work.</p>
            <Field label="Card number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="12/27" />
              <Field label="CVV" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="•••" />
            </div>
          </div>

          {err && <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm font-semibold text-rose-300">{err}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full !py-4 text-base"
          >
            {submitting ? 'Creating your ticket…' : `Pay ${inr(block.price)} · create ticket`}
          </button>
        </form>

        <div className="space-y-4">
          <div className="panel fade-up overflow-hidden rounded-2xl">
            <div className="relative border-b border-white/[0.07] bg-gradient-to-r from-ink-800 to-ink-900 p-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-400/50 to-transparent" />
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink-950 text-xl">{teamFlag(data.match.home_team)}</span>
                <div>
                  <p className="text-base font-black text-white">{data.match.home_team} vs {data.match.away_team}</p>
                  <p className="text-[11px] text-slate-400">{kickoffDate(data.match.kickoff_time)} · {kickoffTime(data.match.kickoff_time)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2.5 p-5 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Block {block.block_name}</span>
                <span className="tabular font-bold text-white">{inr(block.price)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Seat</span>
                <span className="tabular font-black text-cyan-300">{seat}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Convenience fee</span>
                <span className="tabular text-emerald-300">₹0</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.07] pt-3">
                <span className="font-black text-white">Total</span>
                <span className="tabular font-mono text-lg font-black text-cyber-300">{inr(block.price)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cyber-400/25 bg-cyber-400/[0.06] p-4 text-[11px] leading-relaxed text-slate-400">
            <p className="font-extrabold uppercase tracking-widest text-cyber-300">What happens next</p>
            <p className="mt-2">
              You’ll get a digital ticket with a unique ID, then a 2-step questionnaire that assigns
              your parking + gate (local) or hotel + shuttle (outstation). Your ticket becomes a
              full journey plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}