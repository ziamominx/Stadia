export default function LiveBadge({ label = 'Live', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-300 ${className}`}
    >
      <span className="live-dot" />
      {label}
    </span>
  );
}