import CountUp from './CountUp.jsx';

const STATUS_DOT = {
  ok: 'bg-emerald-400',
  warn: 'bg-amber-400',
  critical: 'bg-rose-400',
  info: 'bg-cyber-400',
};

export default function Kpi({ label, value, format, sub, icon, status = 'info', delay = 0, suffix }) {
  const cls = STATUS_DOT[status] ?? STATUS_DOT.info;
  return (
    <div className="panel fade-up relative overflow-hidden rounded-2xl p-4" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{label}</span>
        {icon && <span className="text-lg leading-none">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <CountUp
          value={value}
          format={format}
          className="tabular text-[26px] font-black leading-none tracking-tight text-white"
        />
        {suffix && <span className="text-sm font-bold text-slate-400">{suffix}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className={`h-1.5 w-1.5 rounded-full ${cls}`} />
        {sub}
      </div>
    </div>
  );
}