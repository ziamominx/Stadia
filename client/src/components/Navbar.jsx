import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Activity, Sliders, Navigation, Hotel, Shield, ArrowRight } from './Icons.jsx';

export default function Navbar() {
  const navItems = [
    { to: '/command-center', label: 'Command Center', icon: Activity },
    { to: '/simulator', label: 'Stress Simulator', icon: Sliders },
    { to: '/journey-planner', label: 'Trip Companion', icon: Navigation },
    { to: '/hospitality-hub', label: 'Hospitality Hub', icon: Hotel },
    { to: '/matches', label: 'Tickets & Match', icon: Shield },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-neutral-800/90 bg-[#0e0e12]/80 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
        {/* Brand Monogram & Title */}
        <Link to="/" className="flex items-center gap-3 pl-1 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-black text-sm shadow-md transition group-hover:scale-105">
            ▲
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                STADIA <span className="text-neutral-400 font-normal">NEXUS</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">Mega-Event Hospitality Orchestrator</span>
          </div>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-inner'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5 opacity-70" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Action CTA */}
        <div className="flex items-center gap-2">
          <Link
            to="/command-center"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-neutral-200 hover:shadow-lg hover:shadow-white/10"
          >
            Launch Twin
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}