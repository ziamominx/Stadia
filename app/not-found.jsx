'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center fade-up">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 text-2xl font-black font-mono shadow-lg shadow-emerald-950/40">
        404
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
        Telemetry Dispatch Grid
      </span>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
        Sector Not Located
      </h1>
      <p className="text-neutral-400 max-w-md mb-8 text-sm leading-relaxed">
        The requested stadium sector, match coordinate, or navigation corridor could not be located in the current tournament dispatch grid.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/40"
        >
          Return to Hub
        </Link>
        <Link
          href="/command-center"
          className="px-6 py-2.5 bg-neutral-900/80 border border-neutral-800 text-white font-semibold rounded-xl text-sm hover:bg-neutral-800 transition-all"
        >
          Operations Center
        </Link>
        <Link
          href="/matches"
          className="px-6 py-2.5 bg-neutral-900/80 border border-neutral-800 text-neutral-300 font-semibold rounded-xl text-sm hover:bg-neutral-800 hover:text-white transition-all"
        >
          Matches
        </Link>
      </div>
    </div>
  );
}
