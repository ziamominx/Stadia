'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#c25e3e]/10 text-[#c25e3e] flex items-center justify-center mb-6 text-2xl font-bold font-mono">
        404
      </div>
      <h1 className="text-3xl font-black tracking-tight text-[#1c1917] mb-3">
        Page Not Found
      </h1>
      <p className="text-[#78716c] max-w-md mb-8 text-sm leading-relaxed">
        The requested stadium sector, match coordinate, or route could not be located in the current tournament dispatch grid.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#c25e3e] hover:bg-[#b84c2a] text-white font-semibold rounded-xl text-sm transition-all shadow-sm shadow-[#c25e3e]/20"
        >
          Return to Hub
        </Link>
        <Link
          href="/admin"
          className="px-6 py-2.5 bg-white border border-[#e7e5e4] text-[#1c1917] font-semibold rounded-xl text-sm hover:bg-[#f5f5f4] transition-all"
        >
          Admin Panel
        </Link>
      </div>
    </div>
  );
}
