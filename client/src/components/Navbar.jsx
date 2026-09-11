import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const NAV = [
  { to: '/matches', label: 'Matches', navlink: true },
  { to: '/journey-planner', label: 'Journey Planner', navlink: true },
  { to: '/hospitality-hub', label: 'Hospitality', navlink: true },
];

const DASH_LINKS = [
  { to: '/organizer', label: 'Dashboard' },
  { to: '/command-center', label: 'Ecosystem' },
  { to: '/simulator', label: 'Simulator' },
];

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyber-500 to-volt-500 shadow-[0_0_22px_rgba(14,165,233,0.5)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink-950" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15.5c2.5 3 4.5 4.5 8 4.5s5.5-1.5 8-4.5" />
          <path d="M4 8.5C6.5 5.5 8.5 4 12 4s5.5 1.5 8 4.5" />
          <path d="M4 8.5v7c2.5 3 4.5 4.5 8 4.5s5.5-1.5 8-4.5v-7" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[17px] font-black tracking-[0.18em] text-white">
          STADIA<span className="text-cyber-400">.</span>
        </span>
        <span className="mt-0.5 hidden text-[8.5px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:block">
          One ticket · Every journey · Zero chaos
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-[13px] font-semibold transition hover:bg-white/5 ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/tickets"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-[13px] font-semibold transition hover:bg-white/5 ${
                isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            My Tickets
          </NavLink>
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white">
              Command Center
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-44 pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="glass overflow-hidden rounded-xl border border-white/10 py-1 shadow-xl shadow-black/40">
                {DASH_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-[13px] font-semibold transition hover:bg-white/5 hover:text-white ${
                        isActive ? 'text-cyber-300' : 'text-slate-400'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/#matches" className="btn-primary hidden !px-4 !py-2 text-[13px] sm:inline-flex">
            Book Tickets
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.07] bg-ink-900/95 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((l) => (
              <a
                key={l.label}
                href={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <NavLink
              to="/tickets"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              My Tickets
            </NavLink>
            <p className="px-3 pt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-600">Command Center</p>
            {DASH_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-white/5 hover:text-white ${
                    isActive ? 'text-cyber-300' : 'text-slate-300'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/#matches" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">
              Book Tickets
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}