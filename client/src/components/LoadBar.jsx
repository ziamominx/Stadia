export default function LoadBar({ load, status, className = '' }) {
  const p = Math.round((load || 0) * 100);
  const color =
    status === 'critical'
      ? 'bg-rose-500'
      : status === 'approaching_capacity'
        ? 'bg-amber-500'
        : 'bg-emerald-500';
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-700/60 ${className}`}>
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${Math.min(100, p)}%` }}
      />
    </div>
  );
}

const STATUS_MAP = {
  ok: ['bg-emerald-500/15 text-emerald-300 border-emerald-500/40', 'OK'],
  approaching_capacity: ['bg-amber-500/15 text-amber-300 border-amber-500/40', '⚠ Approaching capacity'],
  critical: ['bg-rose-500/15 text-rose-300 border-rose-500/40', '🔴 Critical'],
};

export function StatusPill({ status }) {
  const [cls, txt] = STATUS_MAP[status] ?? STATUS_MAP.ok;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {txt}
    </span>
  );
}