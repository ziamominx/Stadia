"use client";

import { useEffect, useRef } from "react";
export const number = (value) => new Intl.NumberFormat("en-IN").format(value);
export const clock = (minute) =>
  `${String(19 + Math.floor((30 + minute) / 60)).padStart(2, "0")}:${String((30 + minute) % 60).padStart(2, "0")}`;
export const label = (value) => String(value).replaceAll("_", " ");
export function Badge({ tone = "normal", children }) {
  return (
    <span className={`ops-badge ${tone}`}>
      <span aria-hidden="true">●</span> {children}
    </span>
  );
}
export function Button({ children, variant = "", ...props }) {
  return (
    <button className={`ops-button ${variant}`} {...props}>
      {children}
    </button>
  );
}
export function Heading({ title, code, description, children }) {
  return (
    <section className="ops-heading">
      <div>
        <div className="ops-eyebrow">
          STADIA / OPERATIONS PLATFORM <span>{code}</span>
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="ops-actions">{children}</div>
    </section>
  );
}
export function Metrics({ items }) {
  return (
    <div className="ops-metrics">
      {items.map((item) => (
        <div className={`ops-metric ${item.tone || ""}`} key={item.label}>
          <span className="ops-kicker">{item.label}</span>
          <div className="ops-metric-value">
            {item.value}
            <small>{item.unit}</small>
          </div>
          <span className="ops-mono">{item.detail}</span>
        </div>
      ))}
    </div>
  );
}
export function Panel({ title, meta, children, className = "" }) {
  return (
    <section className={`ops-panel ${className}`}>
      <div className="ops-panel-heading">
        <h2>{title}</h2>
        <span className="ops-mono">{meta}</span>
      </div>
      {children}
    </section>
  );
}
export function Progress({ value, tone = "" }) {
  return (
    <div className={`ops-progress ${tone}`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function Empty({ title, children }) {
  return (
    <div className="ops-empty">
      <span className="ops-empty-symbol">◎</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="ops-loading" role="status">
      <div className="ops-eyebrow">STADIA / EVENT TELEMETRY</div>
      <h1>Connecting to the venue…</h1>
      <p>Loading the shared event state.</p>
      <div className="ops-skeleton" />
      <div className="ops-skeleton" />
    </div>
  );
}
export function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (open && !ref.current.open) ref.current.showModal();
    else if (!open && ref.current.open) ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="ops-modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="ops-modal-heading">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close dialog">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Sparkline({ values, tone = "normal", large = false }) {
  const points = values
    .map(
      (v, i) =>
        `${(i / Math.max(1, values.length - 1)) * 300},${95 - v * 0.85}`,
    )
    .join(" ");
  return (
    <svg
      className={`ops-sparkline ${tone} ${large ? "large" : ""}`}
      viewBox="0 0 300 100"
      role="img"
      aria-label={`Occupancy history: ${values.join(", ")} percent`}
    >
      <path d="M0 30H300M0 60H300M0 90H300" stroke="#e2e3df" fill="none" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="300"
        cy={95 - values.at(-1) * 0.85}
        r="3"
        fill="currentColor"
      />
    </svg>
  );
}
