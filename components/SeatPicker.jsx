'use client';

import { useState } from 'react';
import { SEAT_ROWS, SEAT_COLS, seatLabel } from '../lib/seats.js';
import { inr } from '../lib/format.js';

export default function SeatPicker({ block, onConfirm, onClose }) {
  const [selected, setSelected] = useState(null);
  const sold = new Set(block?.soldSeats ?? []);
  const available = block?.available ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="fade-up flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Block {block?.block_name} · {inr(block?.price)}
            </h3>
            <p className="text-xs text-neutral-400">
              {available} seats left · click a seat to select it, then confirm
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mb-3 grid grid-cols-[24px_repeat(24,minmax(0,1fr))] gap-1 overflow-y-auto pr-1 max-h-[52vh]">
          <div />
          {Array.from({ length: SEAT_COLS }, (_, c) => (
            <div key={c} className="text-center text-[9px] font-semibold text-neutral-500">
              {c + 1}
            </div>
          ))}
          {Array.from({ length: SEAT_ROWS }, (_, r) => (
            <div key={r} className="contents">
              <div className="text-right text-[9px] font-semibold leading-5 text-neutral-500">
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
                        ? 'cursor-not-allowed bg-neutral-900 border border-neutral-800 text-neutral-600'
                        : isSel
                          ? 'bg-emerald-500 text-black ring-2 ring-emerald-400'
                          : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-black'
                    }`}
                  >
                    {isSold ? '' : c + 1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-800 pt-3">
          <p className="text-sm text-neutral-300">
            {selected ? (
              <>
                Selected: <span className="font-bold text-white">Seat {selected}</span>
              </>
            ) : (
              <span className="text-neutral-500">No seat selected</span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              disabled={!selected}
              onClick={() => selected && onConfirm(selected)}
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue → ₹{block?.price?.toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
