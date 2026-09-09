import { Link } from 'react-router-dom';
import { useApi, api } from '../api.js';

export default function Tourism() {
  const { data: spots, loading } = useApi(api.tourism);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-saffron-500">Gap-day getaways</p>
      <h1 className="mt-1 text-3xl font-black text-white">Your matches have gaps — fill them</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        With matches spread across three weeks, there's time to explore. These day trips are all
        within a 2-hour drive of Navi Mumbai — no advance booking needed for the demo.
      </p>

      {loading && <div className="mt-6 h-40 animate-pulse rounded-2xl bg-navy-900" />}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {spots?.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-slate-800 bg-navy-900/70 p-5 transition hover:-translate-y-0.5 hover:border-saffron-500/50"
          >
            <div className="flex items-start justify-between">
              <span className="text-4xl">{s.image_emoji}</span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                {s.distance_from_mumbai_km} km
              </span>
            </div>
            <h2 className="mt-3 text-lg font-extrabold text-white">{s.name}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.description}</p>
            <p className="mt-3 text-[11px] font-semibold text-saffron-500">Best time: {s.best_time}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-800 bg-navy-900/70 p-6 text-center">
        <p className="text-sm text-slate-300">
          Travelling for multiple matches? Your ticket page shows exactly how many gap days you
          have before the next kickoff.
        </p>
        <Link to="/" className="mt-3 inline-block font-bold text-saffron-500">← Back to matches</Link>
      </div>
    </div>
  );
}