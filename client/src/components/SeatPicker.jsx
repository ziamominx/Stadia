import { useState } from 'react';
import { SEAT_ROWS, SEAT_COLS, seatLabel } from '../lib/seats.js';
import { inr } from '../lib/format.js';

export default function SeatPicker({ block, onConfirm, onClose }) {
  const [selected, setSelected] = useState(null);
  const sold = new Set(block.soldSeats ?? []);
  const available = block.available;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="fade-up flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-700/60 bg-navy-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Block {block.block_name} · {inr(block.price)}
            </h3>
            <p className="text-xs text-slate-400">
              {available} seats left · click a seat to select it, then confirm
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-2.5 py-1 text-sm text-slate-300 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 grid grid-cols-[24px_repeat(24,minmax(0,1fr))] gap-1 overflow-y-auto pr-1 max-h-[52vh]">
          <div />
          {Array.from({ length: SEAT_COLS }, (_, c) => (
            <div key={c} className="text-center text-[9px] font-semibold text-slate-500">
              {c + 1}
            </div>
          ))}
          {Array.from({ length: SEAT_ROWS }, (_, r) => (
            <div key={r} className="contents">
              <div className="text-right text-[9px] font-semibold leading-5 text-slate-500">
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
                        ? 'cursor-not-allowed bg-slate-800 text-slate-600'
                        : isSel
                          ? 'bg-saffron-500 text-navy-950 ring-2 ring-saffron-400'
                          : 'bg-pitch-500/70 text-white hover:bg-emerald-400'
                    }`}
                  >
                    {isSold ? '' : c + 1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-3">
          <p className="text-sm text-slate-300">
            {selected ? (
              <>
                Selected: <span className="font-bold text-white">Seat {selected}</span>
              </>
            ) : (
              <span className="text-slate-500">No seat selected</span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              disabled={!selected}
              onClick={() => selected && onConfirm(selected)}
              className="rounded-lg bg-gradient-to-r from-saffron-500 to-pitch-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-saffron-500/20 transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue → ₹{block.price.toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}