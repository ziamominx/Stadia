import { useState } from 'react';
import { SEAT_ROWS, SEAT_COLS, seatLabel } from '../lib/seats.js';
import { inr } from '../lib/format.js';

function viewOf(price) {
  if (price >= 4000) return { label: 'Pitchside · Excellent', cls: 'text-amber-300 border-amber-400/40 bg-amber-400/10' };
  if (price >= 3000) return { label: 'Premium · Excellent', cls: 'text-violet-300 border-violet-400/40 bg-violet-400/10' };
  if (price >= 2400) return { label: 'Grandstand · Great', cls: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10' };
  return { label: 'Upper tier · Good', cls: 'text-sky-300 border-sky-400/40 bg-sky-400/10' };
}

export default function SeatPicker({ block, onConfirm, onClose }) {
  const [selected, setSelected] = useState(null);
  const sold = new Set(block.soldSeats ?? []);
  const available = block.available;
  const view = viewOf(block.price);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="fade-up glass flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-white/10 shadow-2xl shadow-black sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Block {block.block_name}</h3>
              <span className={`chip ${view.cls}`}>{view.label}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              <span className="tabular font-bold text-cyber-300">{available}</span> seats left ·
              <span className="tabular ml-1 font-bold text-amber-300">{inr(block.price)}</span> per seat
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* seat grid */}
        <div className="mb-3 grid grid-cols-[26px_repeat(24,minmax(0,1fr))] gap-1 overflow-y-auto px-5 pb-3 pr-4" style={{ maxHeight: '52vh' }}>
          <div />
          {Array.from({ length: SEAT_COLS }, (_, c) => (
            <div key={c} className="text-center text-[9px] font-bold text-slate-600">{c + 1}</div>
          ))}
          {Array.from({ length: SEAT_ROWS }, (_, r) => (
            <div key={r} className="contents">
              <div className="text-right text-[9px] font-bold leading-5 text-slate-600">
                {String.fromCharCode(65 + r)}
              </div>
              {Array.from({ length: SEAT_COLS }, (_, c) => {
                const label = seatLabel(r + 1, c + 1);
                const isSold = sold.has(label);
                const isSel = selected === label;
                return (
                  <button
                    key={c}
                    disabled={isSold}
                    onClick={() => setSelected(label)}
                    title={label}
                    className={`h-5 w-full rounded-[4px] text-[8px] font-bold transition ${
                      isSold
                        ? 'cursor-not-allowed bg-white/[0.04] text-slate-700'
                        : isSel
                          ? 'bg-cyan-400 text-ink-950 shadow-[0_0_12px_rgba(34,211,238,0.8)] ring-2 ring-cyan-300'
                          : 'bg-emerald-500/45 text-white hover:bg-emerald-400 hover:shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    }`}
                  >
                    {isSold ? '' : c + 1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* sticky footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] bg-ink-900/90 px-5 py-3.5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Your selection</p>
            <p className="text-sm font-black text-white">
              {selected ? (
                <>Seat <span className="text-cyan-300">{selected}</span></>
              ) : (
                <span className="text-slate-500">No seat selected</span>
              )}
              <span className="tabular ml-2 font-mono text-cyber-300">{inr(block.price)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              disabled={!selected}
              onClick={() => selected && onConfirm(selected)}
              className="btn-primary !py-2.5 disabled:opacity-40"
            >
              Continue · {inr(block.price)} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}