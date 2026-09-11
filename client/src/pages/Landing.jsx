import { Link } from 'react-router-dom';
import { useApi, api } from '../api.js';
import { kickoffDate, kickoffTime, pct, teamFlag, clockTime, timeBefore, shortName } from '../lib/format.js';
import LiveBadge from '../components/LiveBadge.jsx';
import CountUp from '../components/CountUp.jsx';
import LiveGeospatialLayersHome from './LiveGeospatialLayersHome.jsx';
import StadiumLayout from '../components/StadiumLayout.jsx';

function IntelCard({ delay, label, value, sub, accent = 'cyan' }) {
  const styles = {
    cyan: 'border-cyber-400/40 bg-cyber-400/[0.07]',
    amber: 'border-amber-400/40 bg-amber-400/[0.07]',
    rose: 'border-rose-400/40 bg-rose-400/[0.07]',
    emerald: 'border-emerald-400/40 bg-emerald-400/[0.07]',
  };
  return (
    <div
      className={`float-y panel pointer-events-none w-52 rounded-xl px-4 py-3 shadow-2xl shadow-black/50 ${styles[accent]}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="tabular mt-0.5 text-xl font-black text-white">{value}</p>
      {sub && <p className="text-[10px] font-semibold text-slate-400">{sub}</p>}
    </div>
  );
}

const FLOW_STEPS = [
  { icon: '🎫', label: 'Book ticket' },
  { icon: '🧭', label: 'Identify visitor' },
  { icon: '🚗', label: 'Travel mode' },
  { icon: '🅿️', label: 'Assign parking / hotel / shuttle' },
  { icon: '🚪', label: 'Assign gate' },
  { icon: '🗺️', label: 'Generate route' },
  { icon: '📡', label: 'Monitor crowd' },
  { icon: '⚡', label: 'Predict & reroute' },
];

export default function Landing() {
  const { data: matches, loading } = useApi(api.matches);
  const { data: dashboard } = useApi(api.dashboard);
  const { data: forecast } = useApi(api.gateForecastSummary);
  const { data: hotels } = useApi(api.hotels);

  const totalTickets = matches?.reduce((a, m) => a + m.tickets_sold, 0) ?? 0;
  const gateC = dashboard?.gates.find((g) => shortName(g.name) === 'C');
  const parkingP3 = dashboard?.parking.find((p) => shortName(p.name) === 'P3');
  const peakGate = forecast?.gates ? [...forecast.gates].sort((a, b) => b.peakPct - a.peakPct)[0] : null;
  const peakTime = peakGate && forecast?.match
    ? clockTime(timeBefore(forecast.match.kickoff_time, peakGate.peakMinutesBefore))
    : null;
  const rerouted = dashboard?.rerouted ?? 0;

  const marqueeItems = [
    'FIFA Women’s World Cup India',
    'DY Patil Stadium · Nerul',
    'Navi Mumbai',
    `${matches?.length ?? 9} matches`,
    `${(totalTickets / 1000).toFixed(1)}K+ tickets`,
    `${hotels?.length ?? 12} partner hotels`,
    '4 shuttle zones',
    'One ticket · every journey · zero chaos',
  ];

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.07]">
        {/* Stadium hero background — faint, bounded to this hero section only. */}
        <div className="absolute inset-0 h-full w-full" style={{ backgroundImage: 'url(/stadium-hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.10, filter: 'grayscale(30%) contrast(108%)', zIndex: 0 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 to-transparent z-[1]" />
        <div className="absolute -top-40 left-1/4 h-[480px] w-[720px] rounded-full bg-cyber-500/15 blur-[130px] z-[2]" />
        <div className="absolute -bottom-52 right-0 h-[420px] w-[560px] rounded-full bg-violet-500/10 blur-[130px] z-[2]" />
        <HeroFlow />

        <div className="relative z-[3] mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <p className="fade-up inline-flex flex-wrap items-center gap-2 rounded-full border border-cyber-400/35 bg-cyber-400/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-cyber-300">
              <span className="live-dot" /> FIFA Women’s World Cup · India 2026
            </p>
            <h1 className="fade-up delay-100 mt-6 text-[42px] font-black leading-[1.02] tracking-tight text-white sm:text-7xl">
              The event is big.
              <br />
              <span className="text-gradient text-glow">Your journey shouldn’t be.</span>
            </h1>
            <p className="fade-up delay-200 mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              One intelligent platform connecting tickets, travel, hospitality and crowd
              movement — so 55,000 fans arrive, and leave, without the chaos.
            </p>
            <p className="fade-up delay-300 mt-3 max-w-xl text-xs leading-relaxed text-slate-500">
              Architected as the tournament’s single official ticketing channel — the standard
              deployment model at mega-events, where one appointed partner is the system of record.
            </p>
            <div className="fade-up delay-300 mt-8 flex flex-wrap gap-3">
              <a href="#matches" className="btn-primary">Explore Matches</a>
              <a href="#how" className="btn-ghost">How STADIA works</a>
            </div>

            {matches && (
              <div className="fade-up delay-400 mt-12 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { v: matches.length, l: 'Matches', fmt: (n) => n },
                  { v: totalTickets, l: 'Tickets live', fmt: (n) => `${(n / 1000).toFixed(1)}K+` },
                  { v: hotels?.length ?? 12, l: 'Partner hotels', fmt: (n) => n },
                  { v: 4, l: 'Shuttle zones', fmt: (n) => n },
                ].map((s, i) => (
                  <div key={s.l} className="panel rounded-xl p-3 text-center">
                    <div className="tabular text-2xl font-black text-white">
                      <CountUp value={s.v} format={s.fmt} />
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* floating live-intelligence cards */}
          <div className="pointer-events-none absolute right-8 top-24 hidden w-60 flex-col gap-4 lg:flex xl:right-16">
            {gateC && (
              <IntelCard delay={0.4} accent="amber" label="Gate C · live load" value={pct(gateC.load)} sub="approaching capacity" />
            )}
            {parkingP3 && (
              <IntelCard delay={1.1} accent="rose" label="Parking P3 · live" value={pct(parkingP3.load)} sub="smart rerouting active" />
            )}
            {peakTime && (
              <IntelCard delay={1.8} label="Predicted peak" value={peakTime} sub={`${peakGate.peakPct}% · gate ${shortName(peakGate.name)}`} />
            )}
            <IntelCard delay={2.5} accent="emerald" label="Visitors rerouted" value={<CountUp value={rerouted} />} sub="load-aware routing" />
          </div>
        </div>
      </section>

      {/* ── LIVE EVENT STRIP ────────────────────────────────────────── */}
      <section className="marquee relative overflow-hidden border-b border-white/[0.07] bg-ink-900/80 py-3">
        <div className="marquee-track items-center gap-10">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10">
              {marqueeItems.map((item, i) => (
                <span key={i} className="flex items-center gap-10 whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  {i === 0 && <span className="flex items-center gap-2 text-emerald-300"><span className="live-dot" /> Live event</span>}
                  {item}
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">How it works</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
          Every ticket becomes a <span className="text-gradient">managed journey</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          STADIA is ticketing plus live crowd orchestration: the platform knows how you’re
          arriving, where you’re going, and how to get you there — then keeps the two visitor
          crowds on physically separate corridors so they never collide.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-y-3">
          {FLOW_STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className="panel flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition hover:border-cyber-400/40">
                <span className="text-lg">{s.icon}</span>
                <span className="whitespace-nowrap text-xs font-bold text-slate-200">{s.label}</span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <span className="mx-1.5 text-cyber-400/60 sm:mx-2">→</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="panel panel-hover relative overflow-hidden rounded-2xl p-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyber-500/15 blur-3xl" />
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyber-400/15 text-2xl">🏠</span>
              <div>
                <h3 className="text-lg font-black text-white">Local fans</h3>
                <p className="text-xs text-slate-500">Personal vehicle or public transit</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-slate-300">
              <p>• Vehicle → load-aware <b className="text-cyber-300">parking zone</b> (P1–P5) near your seat block</p>
              <p>• Transit → nearest <b className="text-cyber-300">gate</b> + rail hint</p>
              <p>• Entry &amp; exit via <b className="text-cyber-300">North / West gates</b> (A, B, G, H)</p>
              <p>• Parking → gate → seat, mapped on your ticket</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-cyber-300">
              <span className="chip border-cyber-400/40 bg-cyber-400/10">Corridor · North/West</span>
            </div>
          </div>

          <div className="panel panel-hover relative overflow-hidden rounded-2xl p-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-500/15 blur-3xl" />
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-400/15 text-2xl">✈️</span>
              <div>
                <h3 className="text-lg font-black text-white">Outstation &amp; international fans</h3>
                <p className="text-xs text-slate-500">Hotels, shuttles, airport transfers</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-slate-300">
              <p>• Pick a <b className="text-rose-300">partner hotel</b> — 10% off, commission tracked</p>
              <p>• Auto-assigned <b className="text-rose-300">shuttle zone + departure slot</b></p>
              <p>• Entry &amp; exit via <b className="text-rose-300">East / South gates</b> (C, D, E, F)</p>
              <p>• Hotel → shuttle drop → gate → seat, all on one ticket</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-rose-300">
              <span className="chip border-rose-400/40 bg-rose-400/10">Corridor · East/South</span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-cyber-400/25 bg-cyber-400/[0.06] p-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-cyber-300">Why a single ticketing channel?</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Mega-events run on a single official ticketing partner — the way BookMyShow or Paytm
            Insider hold exclusive rights for specific large events in India. STADIA is architected
            to be that single system of record: every ticket, and therefore every visitor’s
            location and travel data, flows through one platform. That centralisation is what makes
            real-time crowd orchestration possible — split ticket sources across multiple vendors
            and the crowd model breaks down.
          </p>
        </div>
      </section>

      {/* ── STADIUM ─────────────────────────────────────────────────── */}
      <section id="stadium" className="border-y border-white/[0.07] bg-ink-900/50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">The stadium</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Two corridors. One stadium.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
              DY Patil Stadium, Nerul. Eight gates are split into two physically separate
              corridors — local fans approach from the North and West, outstation fans from the
              East and South — so the two crowds never share a choke point. STADIA watches every
              approach path live and predicts where congestion will build before it happens.
            </p>
            <ul className="mt-6 grid max-w-md grid-cols-2 gap-3 text-sm">
              <li className="panel rounded-xl p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyber-300">Local corridor</p>
                <p className="mt-1 font-mono text-lg font-bold text-white">A · B · G · H</p>
                <p className="text-[11px] text-slate-500">North / West · parking + rail</p>
              </li>
              <li className="panel rounded-xl p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-300">Outstation corridor</p>
                <p className="mt-1 font-mono text-lg font-bold text-white">C · D · E · F</p>
                <p className="text-[11px] text-slate-500">East / South · shuttle drop</p>
              </li>
            </ul>
            <Link to="/organizer/gates" className="btn-ghost mt-6 !py-2.5 text-sm">
              Watch the crowd flow live →
            </Link>
          </div>

          {/* Stadium-only schematic: gates A–H and the two corridors, themed */}
          <StadiumLayout />
        </div>
      </section>

      {/* ── MATCH TIMELINE ──────────────────────────────────────────── */}
      <section id="matches" className="border-y border-white/[0.07] bg-ink-900/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">Fixtures</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Match timeline</h2>
            <p className="mt-2 text-sm text-slate-400">3 weeks · 9 fixtures · all at DY Patil Stadium, Nerul</p>
          </div>
          <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
            <span className="live-dot" /> Live availability
          </span>
        </div>

        {loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-ink-800" />
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches?.map((m, i) => {
            const soldFrac = Math.min(1, m.tickets_sold / 55000);
            const soldOut = soldFrac >= 0.999;
            const seatsLeft = Math.max(0, 55000 - m.tickets_sold);
            return (
              <Link
                key={m.id}
                to={`/match/${m.id}`}
                className="panel panel-hover fade-up group relative overflow-hidden rounded-2xl p-5"
                style={{ animationDelay: `${(i % 3) * 0.08}s` }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-400/50 to-transparent" />
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  <span>{kickoffDate(m.kickoff_time)}</span>
                  <span className="tabular font-mono text-cyber-300">{kickoffTime(m.kickoff_time)}</span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <TeamBadge name={m.home_team} />
                  <span className="flex flex-col items-center">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-600">vs</span>
                    <span className="mt-1 h-px w-8 bg-white/10" />
                  </span>
                  <TeamBadge name={m.away_team} align="right" />
                </div>

                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400">Capacity</span>
                    {soldOut ? (
                      <span className="font-extrabold text-rose-400">SOLD OUT</span>
                    ) : (
                      <span className="tabular font-bold text-slate-300">
                        {seatsLeft.toLocaleString('en-IN')} seats left
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`grow-x h-full rounded-full ${soldOut ? 'bg-rose-500' : 'bg-gradient-to-r from-cyber-500 to-volt-400'}`}
                      style={{ width: `${Math.max(2, soldFrac * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right text-[10px] text-slate-600">{pct(soldFrac)} sold</div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">{m.venue.split(',')[0]}</span>
                  <span className="text-xs font-extrabold text-cyber-300 opacity-0 transition group-hover:opacity-100">
                    View match →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        </div>
      </section>

      {/* ── LIVE GEOSPATIAL LAYERS ────────────────────────────────── */}
      <LiveGeospatialLayersHome />

      {/* ── HOSPITALITY ─────────────────────────────────────────────── */}
      <section id="hospitality" className="border-t border-white/[0.07] bg-ink-900/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">Hospitality</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Stay, ride, explore
              </h2>
            </div>
            <Link to="/tourism" className="btn-ghost !py-2.5 text-sm">Gap-day getaways →</Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="panel panel-hover rounded-2xl p-6">
              <span className="text-3xl">🏨</span>
              <h3 className="mt-3 text-lg font-black text-white">{hotels?.length ?? 12} partner hotels</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Vashi, Belapur, Seawoods, Nerul and the airport belt — each with a shuttle zone and
                a 10% event discount tracked on your ticket.
              </p>
              <p className="mt-3 text-xs font-bold text-cyber-300">Shuttle included →</p>
            </div>
            <div className="panel panel-hover rounded-2xl p-6">
              <span className="text-3xl">🚐</span>
              <h3 className="mt-3 text-lg font-black text-white">4 shuttle corridors</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Fixed routes and time slots to the East and South gates — the outstation corridor
                stays clear of local traffic the whole way in.
              </p>
              <p className="mt-3 text-xs font-bold text-cyber-300">3 departure slots per match →</p>
            </div>
            <div className="panel panel-hover rounded-2xl p-6">
              <span className="text-3xl">⛰️</span>
              <h3 className="mt-3 text-lg font-black text-white">Gap-day getaways</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Multi-day gaps between matches? Your ticket tells you exactly how many free days you
                have — and where to spend them.
              </p>
              <p className="mt-3 text-xs font-bold text-cyber-300">Lonavla · Matheran · Alibaug →</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ORGANIZER TEASER ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-cyber-400/25 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-8 sm:p-12">
          <div className="bg-grid absolute inset-0 opacity-60" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyber-500/15 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-300">
                For organizers
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                STADIA knows where the crowd is, where it will build, and what to do next.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Live gate load, capacity forecasting, parking intelligence and crowd-flow
                simulation — one command center for the entire match day.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/organizer" className="btn-primary">Open Command Center</Link>
                <Link to="/organizer/gates" className="btn-ghost">Crowd flow map</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Gates flagged', v: dashboard?.gates.filter((g) => g.status !== 'ok').length ?? '—', sub: '≥ 80% load' },
                { l: 'Peak prediction', v: peakGate ? `${peakGate.peakPct}%` : '—', sub: peakGate ? `gate ${shortName(peakGate.name)}` : '' },
                { l: 'Visitors rerouted', v: <CountUp value={rerouted} />, sub: 'load-aware' },
                { l: 'Parking live', v: parkingP3 ? pct(parkingP3.load) : '—', sub: 'P3 zone' },
              ].map((s) => (
                <div key={s.l} className="panel rounded-xl p-4 text-center">
                  <div className="tabular text-xl font-black text-white">{s.v}</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{s.l}</div>
                  <div className="mt-0.5 text-[10px] text-slate-600">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Link to="/#matches" className="panel panel-hover rounded-2xl p-5 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">Explore matches</p>
                <p className="mt-2 text-lg font-black text-white">See the full fixture list</p>
                <p className="text-[10px] text-slate-500">Nine matches across 3 weeks</p>
              </Link>
              <Link to="/#matches" className="panel panel-hover rounded-2xl p-5 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-rose-400">Book more tickets</p>
                <p className="mt-2 text-lg font-black text-white">Pick your next match</p>
                <p className="text-[10px] text-slate-500">Book once, plan the whole journey</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TeamBadge({ name, align = 'left' }) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-3 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-ink-700 to-ink-900 text-lg shadow-inner">
        {teamFlag(name)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-base font-extrabold text-white">{name}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {name.slice(0, 3).toUpperCase()}
        </p>
      </div>
    </div>
  );
}

function StadiumPlan() {
  const gates = [
    { letter: 'A', angle: -90, side: 'local' },
    { letter: 'B', angle: -45, side: 'local' },
    { letter: 'C', angle: 0, side: 'outstation' },
    { letter: 'D', angle: 45, side: 'outstation' },
    { letter: 'E', angle: 90, side: 'outstation' },
    { letter: 'F', angle: 135, side: 'outstation' },
    { letter: 'G', angle: 180, side: 'local' },
    { letter: 'H', angle: -135, side: 'local' },
  ];
  const CX = 200;
  const CY = 170;
  const R_OUT = 140;
  const R_IN = 92;
  const polar = (r, deg) => {
    const t = (deg * Math.PI) / 180;
    return [CX + r * Math.cos(t), CY + r * Math.sin(t)];
  };
  return (
    <div className="panel relative overflow-hidden rounded-2xl p-6">
      <div className="scanline" />
      <svg viewBox="0 0 400 340" className="w-full" role="img" aria-label="Stadium gate plan">
        <defs>
          <radialGradient id="pitch-grad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0f7a3f" />
            <stop offset="100%" stopColor="#0b5c30" />
          </radialGradient>
        </defs>
        <ellipse cx={CX} cy={CY} rx={72} ry={40} fill="url(#pitch-grad)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <line x1={CX - 72} y1={CY} x2={CX + 72} y2={CY} stroke="rgba(255,255,255,0.15)" />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize="9" fontWeight="800" fill="rgba(255,255,255,0.75)" letterSpacing="2">
          DY PATIL STADIUM
        </text>
        {gates.map((g) => {
          const [x, y] = polar(R_OUT, g.angle);
          const [lx, ly] = polar(R_OUT + 24, g.angle);
          const color = g.side === 'local' ? '#38bdf8' : '#fb7185';
          return (
            <g key={g.letter}>
              <circle cx={x} cy={y} r={7} fill={color} stroke="#030509" strokeWidth="2">
                <animate attributeName="opacity" values="1;0.55;1" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <text x={lx} y={ly + 3.5} textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>
                {g.letter}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-5 text-[10px] font-bold uppercase tracking-widest">
        <span className="text-cyber-300">● Local · N/W</span>
        <span className="text-rose-300">● Outstation · E/S</span>
      </div>
    </div>
  );
}

function HeroFlow() {
  const lines = [
    { d: 'M -40 800 C 260 640, 400 500, 580 450', color: '#38bdf8' },
    { d: 'M -40 860 C 320 680, 460 540, 640 480', color: '#38bdf8' },
    { d: 'M -40 720 C 240 580, 360 460, 540 420', color: '#38bdf8' },
    { d: 'M 1480 800 C 1180 640, 1040 500, 860 450', color: '#fb7185' },
    { d: 'M 1480 860 C 1120 680, 980 540, 800 480', color: '#fb7185' },
    { d: 'M 1480 720 C 1200 580, 1080 460, 900 420', color: '#fb7185' },
  ];
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {lines.map((l, i) => (
        <path key={i} d={l.d} fill="none" stroke={l.color} strokeWidth={i % 3 === 0 ? 2.4 : 1.4} className="flow-line" />
      ))}
      {lines.map((l, i) => (
        <circle key={`c${i}`} r="3" fill={l.color} opacity="0.9">
          <animateMotion dur={`${7 + i * 2}s`} repeatCount="indefinite" path={l.d} />
        </circle>
      ))}
    </svg>
  );
}