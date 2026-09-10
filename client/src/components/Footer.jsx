import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-ink-900/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-black tracking-[0.18em] text-white">
              STADIA<span className="text-cyber-400">.</span>
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              One ticket · Every journey · Zero chaos
            </p>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-500">
              Intelligent hospitality &amp; crowd orchestration for mega-events. Architected as the
              single official ticketing channel — the standard deployment model at major
              international events, where one appointed partner is the system of record.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Visitors</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li><a href="/#matches" className="hover:text-cyber-300">Matches &amp; tickets</a></li>
              <li><a href="/#stadium" className="hover:text-cyber-300">The stadium</a></li>
              <li><a href="/#hospitality" className="hover:text-cyber-300">Hotels &amp; shuttles</a></li>
              <li><Link to="/tourism" className="hover:text-cyber-300">Gap-day getaways</Link></li>
              <li><Link to="/tickets" className="hover:text-cyber-300">My tickets</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Organizers</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li><Link to="/organizer" className="hover:text-cyber-300">Command center</Link></li>
              <li><Link to="/organizer/gates" className="hover:text-cyber-300">Crowd flow &amp; routing</Link></li>
              <li><Link to="/organizer/shuttles" className="hover:text-cyber-300">Shuttle monitor</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Demo</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li>Payments, hotel &amp; broadcast partnerships are mocked.</li>
              <li>© 2026 STADIA concept build.</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}