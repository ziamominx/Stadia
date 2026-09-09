import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-800/80 bg-[#09090b] py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black font-black text-xs">
            ▲
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">STADIA NEXUS</span>
            <p className="text-[11px] text-neutral-400">Intelligent Mega-Event Hospitality &amp; Crowd Orchestration Platform</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-medium">
          <Link to="/command-center" className="hover:text-white transition">Command Center</Link>
          <Link to="/simulator" className="hover:text-white transition">Stress Simulator</Link>
          <Link to="/journey-planner" className="hover:text-white transition">Trip Companion</Link>
          <Link to="/hospitality-hub" className="hover:text-white transition">Hospitality Hub</Link>
          <Link to="/matches" className="hover:text-white transition">Match Tickets</Link>
        </div>

        <div className="text-right text-[11px] text-neutral-400">
          <span className="text-emerald-400 font-semibold">● System Nominal</span> · HackCelestial 2026
        </div>
      </div>
    </footer>
  );
}