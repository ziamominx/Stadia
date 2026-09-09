import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import SeatMap from '../components/SeatMap.jsx';
import SeatPicker from '../components/SeatPicker.jsx';
import { kickoffLong, inr } from '../lib/format.js';

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => api.matchSeats(id), [id]);
  const [block, setBlock] = useState(null);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-64 animate-pulse rounded-2xl bg-navy-900" /></div>;
  }
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error.message}</p>
        <Link to="/" className="mt-4 inline-block font-bold text-saffron-500">← Back to matches</Link>
      </div>
    );
  }

  const { match, blocks } = data;
  const totalSeats = blocks.reduce((a, b) => a + b.capacity, 0);
  const soldTotal = blocks.reduce((a, b) => a + b.sold, 0);
  const soldOut = blocks.filter((b) => b.available <= 0).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-white">← All matches</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-saffron-500">{kickoffLong(match.kickoff_time)}</p>
          <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
            {match.home_team} <span className="text-slate-500">vs</span> {match.away_team}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{match.venue} · {match.status}</p>
        </div>
        <div className="flex gap-4 text-center">
          <div className="rounded-xl border border-slate-800 bg-navy-900/70 px-4 py-2">
            <div className="text-lg font-black text-white">{Math.round((soldTotal / totalSeats) * 100)}%</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Sold</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-navy-900/70 px-4 py-2">
            <div className="text-lg font-black text-white">{blocks.length - soldOut}</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Blocks open</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SeatMap blocks={blocks} selectedId={block?.id} onSelect={setBlock} />

        <div>
          {!block ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-navy-900/50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">🎫</div>
              <p className="font-bold text-white">Pick a block on the seat map</p>
              <p className="mt-1 text-sm text-slate-400">
                Blocks fill from {inr(Math.min(...blocks.map((b) => b.price)))} to{' '}
                {inr(Math.max(...blocks.map((b) => b.price)))}. Click a coloured section to see seats.
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Grey blocks are sold out. After choosing your seat you'll create your ticket, then tell
                us if you're local or outstation for your arrival plan.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700/60 bg-navy-900/70 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Block {block.block_name}</h2>
                <button onClick={() => setBlock(null)} className="text-xs font-semibold text-slate-400 hover:text-white">
                  change block
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/5 p-2">
                  <div className="text-sm font-black text-white">{block.available}</div>
                  <div className="text-[10px] text-slate-500">seats left</div>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <div className="text-sm font-black text-saffron-500">{inr(block.price)}</div>
                  <div className="text-[10px] text-slate-500">per seat</div>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <div className="text-sm font-black text-white">{block.sold}</div>
                  <div className="text-[10px] text-slate-500">already sold</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                ↓ Live seat map for this block — green seats are free
              </p>
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