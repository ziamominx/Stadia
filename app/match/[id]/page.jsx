'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi, api } from '../../../lib/api.js';
import { getEventById } from '../../../lib/eventsData.js';
import { BLOCKS_DATA } from '../../../lib/stadiaData.js';
import SeatMap from '../../../components/SeatMap.jsx';
import SeatPicker from '../../../components/SeatPicker.jsx';
import { kickoffLong, inr } from '../../../lib/format.js';
import { Ticket, Lock } from '../../../components/Icons.jsx';

export default function MatchDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { data: apiData, loading, error } = useApi(() => api.matchSeats(id), [id]);
  const [block, setBlock] = useState(null);

  // Check fallback from local event registry (for newly created organizer events)
  const localEvent = typeof window !== 'undefined' ? getEventById(id) : null;

  let match = apiData?.match;
  let blocks = apiData?.blocks;

  if (!match && localEvent) {
    match = {
      id: localEvent.id,
      home_team: localEvent.title,
      away_team: localEvent.subtitle || 'Live Event Experience',
      kickoff_time: `${localEvent.date}T19:30:00.000Z`,
      venue: `${localEvent.venue}, ${localEvent.city}`,
      status: localEvent.status,
    };
    blocks = BLOCKS_DATA.map(b => ({
      ...b,
      price: (b.block_name.startsWith('E') || b.block_name.startsWith('F')) ? (localEvent.vipPrice || 8500) : (localEvent.basePrice || 1500),
      available: Math.max(12, b.capacity - b.sold),
    }));
  }

  if (loading && !localEvent) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl bg-neutral-900" />
      </div>
    );
  }

  // Handle Draft state: hidden from public fans
  if (localEvent && (localEvent.status || '').toLowerCase() === 'draft') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-white">Event in Staged Draft Mode</h1>
        <p className="text-sm text-neutral-400 leading-relaxed">
          &quot;{localEvent.title}&quot; has been created by the Executive Organizer but has not yet been put live to fans.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/matches"
            className="rounded-full border border-neutral-700 bg-[#121217] px-5 py-2.5 text-xs font-bold text-neutral-300 hover:bg-neutral-800"
          >
            ← Public Matches Directory
          </Link>
        </div>
      </div>
    );
  }

  if (!match || !blocks) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">{error?.message || 'Match or Event not found'}</p>
        <Link href="/matches" className="mt-4 inline-block font-bold text-emerald-400">
          ← Back to matches
        </Link>
      </div>
    );
  }

  const totalSeats = blocks?.reduce((a, b) => a + b.capacity, 0) || 1;
  const soldTotal = blocks?.reduce((a, b) => a + b.sold, 0) || 0;
  const soldOut = blocks?.filter((b) => b.available <= 0).length || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 fade-up">
      <Link href="/matches" className="text-sm font-semibold text-slate-400 hover:text-white">
        ← All matches
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-300">
            {kickoffLong(match.kickoff_time)}
          </p>
          <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
            {match.home_team} <span className="text-slate-500">vs</span> {match.away_team}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{match.venue} · {match.status}</p>
        </div>
        <div className="flex gap-4 text-center">
          <div className="rounded-xl border border-slate-800 bg-[#0e0e12] px-4 py-2">
            <div className="text-lg font-black text-white">{Math.round((soldTotal / totalSeats) * 100)}%</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Sold</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0e0e12] px-4 py-2">
            <div className="text-lg font-black text-white">{blocks.length - soldOut}</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Blocks open</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SeatMap blocks={blocks} selectedId={block?.id} onSelect={setBlock} />

        <div>
          {!block ? (
            <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-neutral-500 bg-neutral-900 text-white">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <p className="font-extrabold text-white text-base">Select a Stadium Block to View Seats</p>
                <p className="mt-1 text-xs text-neutral-400">
                  Choose your pitch view. Prices range from {inr(Math.min(...blocks.map((b) => b.price)))} to {inr(Math.max(...blocks.map((b) => b.price)))}.
                </p>
              </div>

              <div className="border-t border-neutral-700 pt-4 text-left">
                <span className="text-[10px] font-mono uppercase font-bold text-neutral-300 tracking-wider">How this demo works</span>
                <p className="mt-2 text-xs leading-relaxed text-neutral-400">Choose a block and seat, enter your details, and generate a pass you can reopen from My Pass. This reservation does not grant real venue entry.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700/60 bg-[#0e0e12] p-5">
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
                  <div className="text-sm font-black text-emerald-400">{inr(block.price)}</div>
                  <div className="text-[10px] text-slate-500">per seat</div>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <div className="text-sm font-black text-white">{block.sold}</div>
                  <div className="text-[10px] text-slate-500">already sold</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                ↓ Live seat map for this block — click any seat to select it
              </p>
            </div>
          )}
        </div>
      </div>

      {block && (
        <SeatPicker
          block={block}
          onClose={() => setBlock(null)}
          onConfirm={(seat) => router.push(`/checkout/${match.id}/${block.id}/${seat}`)}
        />
      )}
    </div>
  );
}
