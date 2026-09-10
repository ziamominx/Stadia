// Vertical event-day journey timeline. stops: [{ time, icon, title, sub, accent? }]
export default function JourneyTimeline({ stops }) {
  return (
    <ol className="relative space-y-0">
      {stops.map((s, i) => {
        const last = i === stops.length - 1;
        return (
          <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
            {!last && (
              <span className="absolute left-[13px] top-7 h-full w-px bg-gradient-to-b from-cyber-400/60 to-cyber-400/10" />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
                s.accent === 'warn'
                  ? 'border-amber-400/60 bg-amber-400/15'
                  : s.accent === 'hot'
                    ? 'border-rose-400/60 bg-rose-400/15'
                    : 'border-cyber-400/50 bg-cyber-400/10'
              }`}
            >
              {s.icon}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-bold text-white">{s.title}</p>
                {s.time && <span className="tabular font-mono text-xs font-bold text-cyber-300">{s.time}</span>}
              </div>
              {s.sub && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{s.sub}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}