const STEP_STYLE = {
  done: 'border-cyber-400/60 bg-cyber-400/15 text-cyber-300',
  current: 'border-cyber-400 bg-gradient-to-br from-cyber-500 to-volt-500 text-ink-950 shadow-[0_0_18px_rgba(14,165,233,0.55)]',
  upcoming: 'border-white/15 bg-white/[0.03] text-slate-500',
};

export default function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li key={label} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-extrabold transition ${STEP_STYLE[state]}`}
              >
                {state === 'done' ? '✓' : String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`hidden text-[11px] font-bold uppercase tracking-wider md:block ${
                  state === 'current' ? 'text-white' : state === 'done' ? 'text-cyber-300' : 'text-slate-600'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={`h-px w-4 sm:w-8 ${i < current ? 'bg-cyber-400/60' : 'bg-white/10'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}