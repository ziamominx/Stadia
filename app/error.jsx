'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Stadia Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 text-2xl font-bold">
        !
      </div>
      <h1 className="text-2xl font-black tracking-tight text-[#1c1917] mb-3">
        Telemetry Interruption
      </h1>
      <p className="text-[#78716c] max-w-md mb-8 text-sm leading-relaxed">
        An unexpected condition occurred while resolving stadium routing state. The system is attempting self-recovery.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-[#c25e3e] hover:bg-[#b84c2a] text-white font-semibold rounded-xl text-sm transition-all shadow-sm shadow-[#c25e3e]/20"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-white border border-[#e7e5e4] text-[#1c1917] font-semibold rounded-xl text-sm hover:bg-[#f5f5f4] transition-all"
        >
          Return to Hub
        </Link>
      </div>
    </div>
  );
}
