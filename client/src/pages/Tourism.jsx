import { Link } from 'react-router-dom';
import { useApi, api } from '../api.js';

export default function Tourism() {
  const { data: spots, loading } = useApi(api.tourism);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">Gap-day getaways</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
        Your matches have gaps — <span className="text-gradient">fill them.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
        With matches spread across three weeks, there’s time to explore. These day trips are all
        within a two-hour drive of Navi Mumbai — no advance booking needed for the demo.
      </p>

      {loading && <div className="mt-8 h-64 animate-pulse rounded-2xl bg-ink-800" />}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {spots?.map((s, i) => (
          <div
            key={s.id}
            className="panel panel-hover fade-up group relative overflow-hidden rounded-2xl p-6"
            style={{ animationDelay: `${Math.min(i, 5) * 0.06}s` }}
          >
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyber-500/10 blur-3xl transition group-hover:bg-cyber-500/20" />
            <div className="flex items-start justify-between">
              <span className="text-5xl drop-shadow-lg">{s.image_emoji}</span>
              <span className="chip tabular border-cyber-400/40 bg-cyber-400/10 text-cyber-300">
                {s.distance_from_mumbai_km} km
              </span>
            </div>
            <h2 className="mt-4 text-xl font-black text-white">{s.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.description}</p>
            <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                Best · {s.best_time}
              </span>
              <span className="text-xs font-extrabold text-cyber-300 opacity-0 transition group-hover:opacity-100">
                Plan a trip →
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="panel mt-12 rounded-2xl p-8 text-center">
        <p className="text-base font-black text-white">Travelling for multiple matches?</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
          Your ticket page shows exactly how many gap days you have before the next kickoff — and
          your journey plan is built around them.
        </p>
        <Link to="/" className="btn-ghost mt-5 !py-2.5 text-sm">← Back to matches</Link>
      </div>
    </div>
  );
}