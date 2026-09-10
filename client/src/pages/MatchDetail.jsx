import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import SeatMap from '../components/SeatMap.jsx';
import SeatPicker from '../components/SeatPicker.jsx';
import Stepper from '../components/Stepper.jsx';
import { kickoffLong, kickoffDate, kickoffTime, inr, teamFlag } from '../lib/format.js';

function Crest({ name, size = 'h-16 w-16 text-2xl' }) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-ink-700 to-ink-950 shadow-[inset_0_0_22px_rgba(0,0,0,0.5)]`}
    >
      {teamFlag(name)}
    </span>
  );
}

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => api.matchSeats(id), [id]);
  const [block, setBlock] = useState(null);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-ink-800" /></div>;
  }
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error.message}</p>
        <Link to="/" className="mt-4 inline-block font-bold text-cyber-300">← Back to matches</Link>
      </div>
    );
  }

  const { match, blocks } = data;
  const totalSeats = blocks.reduce((a, b) => a + b.capacity, 0);
  const soldTotal = blocks.reduce((a, b) => a + b.sold, 0);
  const soldPct = Math.round((soldTotal / totalSeats) * 100);
  const soldOut = blocks.filter((b) => b.available <= 0).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-white">← All matches</Link>
        <Stepper steps={['Match', 'Seats', 'Travel', 'Confirm']} current={0} />
      </div>

      {/* match header */}
      <div className="panel fade-up relative mt-6 overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-96 rounded-full bg-cyber-500/12 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-400/50 to-transparent" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Crest name={match.home_team} />
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Home</p>
              <p className="mt-0.5 text-2xl font-black text-white sm:text-3xl">{match.home_team}</p>
            </div>
            <div className="flex flex-col items-center px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">vs</span>
              <span className="mt-1 text-lg font-black text-cyber-400">·</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Away</p>
              <p className="mt-0.5 text-2xl font-black text-white sm:text-3xl">{match.away_team}</p>
            </div>
            <Crest name={match.away_team} />
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="tabular chip border-cyber-400/40 bg-cyber-400/10 font-mono text-cyber-300">
              {kickoffDate(match.kickoff_time)} · {kickoffTime(match.kickoff_time)}
            </span>
            <span className="text-xs font-semibold text-slate-400">{match.venue}</span>
            <div className="mt-1 flex gap-2">
              <span className={`chip ${soldPct >= 95 ? 'border-rose-400/40 bg-rose-400/10 text-rose-300' : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'}`}>
                {soldPct}% sold
              </span>
              <span className="chip border-white/15 text-slate-400">{blocks.length - soldOut} blocks open</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <SeatMap blocks={blocks} selectedId={block?.id} onSelect={setBlock} />

        <div>
          {!block ? (
            <div className="panel fade-up rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyber-400/30 bg-cyber-400/10 text-2xl">
                🎫
              </div>
              <p className="text-lg font-black text-white">Pick a block on the seat map</p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
                Blocks run from <b className="text-amber-300">{inr(Math.min(...blocks.map((b) => b.price)))}</b> to{' '}
                <b className="text-amber-300">{inr(Math.max(...blocks.map((b) => b.price)))}</b>. Click a coloured
                section to open its live seat grid.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Total seats</p>
                  <p className="tabular mt-1 text-lg font-black text-white">{totalSeats.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Already sold</p>
                  <p className="tabular mt-1 text-lg font-black text-cyber-300">{soldTotal.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-slate-500">
                Grey blocks are sold out. After choosing your seat you’ll create your ticket, then
                tell us if you’re local or outstation for your personalised arrival plan.
              </p>
            </div>
          ) : (
            <div className="panel fade-up rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white">Block {block.block_name}</h2>
                <button onClick={() => setBlock(null)} className="text-xs font-bold text-slate-400 transition hover:text-white">
                  change block
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[0.04] p-3">
                  <div className="tabular text-lg font-black text-emerald-300">{block.available}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">seats left</div>
                </div>
                <div className="rounded-xl bg-amber-400/[0.08] p-3">
                  <div className="tabular text-lg font-black text-amber-300">{inr(block.price)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">per seat</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3">
                  <div className="tabular text-lg font-black text-white">{block.sold}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">sold</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-cyber-400/25 bg-cyber-400/[0.06] px-4 py-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyber-300">1 seat selected</p>
                  <p className="tabular mt-0.5 text-base font-black text-white">{inr(block.price)}</p>
                </div>
                <button
                  onClick={() => setBlock(null)}
                  className="btn-primary !px-5 !py-2.5 text-[13px]"
                >
                  Choose seat →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {block && (
        <SeatPicker
          block={block}
          onClose={() => setBlock(null)}
          onConfirm={(seat) => navigate(`/checkout/${match.id}/${block.id}/${seat}`)}
        />
      )}
    </div>
  );
}