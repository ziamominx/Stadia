import { NavLink, Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Matches' },
  { to: '/tourism', label: 'Gap-Day Getaways' },
  { to: '/organizer', label: 'Organizer' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-navy-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-saffron-500 to-pitch-500 text-lg font-black text-white shadow-lg shadow-saffron-500/20">
            ⚽
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight text-white">
              FWC India <span className="text-saffron-500">2026</span>
            </span>
            <span className="block text-[10px] font-medium tracking-wide text-slate-400">
              DY Patil Stadium · Single Ticketing Channel
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}