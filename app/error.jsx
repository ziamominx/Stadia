'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from '../components/Icons.jsx';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Stadia Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center fade-up">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mb-6 shadow-lg shadow-amber-950/30">
        <AlertTriangle className="h-7 w-7 text-amber-400" />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        Telemetry Stream Recovered
      </span>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
        Telemetry Interruption
      </h1>
      <p className="text-neutral-400 max-w-md mb-8 text-sm leading-relaxed">
        An unexpected state variation occurred while resolving real-time stadium routing. The node is ready for automatic synchronization.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/40"
        >
          Retry Connection
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-neutral-900/80 border border-neutral-800 text-white font-semibold rounded-xl text-sm hover:bg-neutral-800 transition-all"
        >
          Return to Hub
        </Link>
      </div>
    </div>
  );
}
