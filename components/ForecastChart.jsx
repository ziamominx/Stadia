'use client';

import React, { useState } from 'react';

export default function ForecastChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const timelinePoints = data.length > 0 ? data : [
    { time: 'T-180m', label: '15:00', actual: 4200, forecast: 4200, capacity: 55000 },
    { time: 'T-150m', label: '15:30', actual: 9800, forecast: 10100, capacity: 55000 },
    { time: 'T-120m', label: '16:00', actual: 18400, forecast: 19000, capacity: 55000 },
    { time: 'T-90m',  label: '16:30', actual: 29500, forecast: 30200, capacity: 55000 },
    { time: 'T-60m',  label: '17:00', actual: 38214, forecast: 41500, capacity: 55000 },
    { time: 'T-30m',  label: '17:30', actual: null,  forecast: 49800, capacity: 55000 },
    { time: 'T-15m',  label: '17:45', actual: null,  forecast: 53200, capacity: 55000 },
    { time: 'KICKOFF', label: '18:00', actual: null, forecast: 54600, capacity: 55000 },
  ];

  const maxVal = 60000;
  const width = 640;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const getX = (idx) => paddingX + (idx / (timelinePoints.length - 1)) * chartW;
  const getY = (val) => paddingY + chartH - (val / maxVal) * chartH;

  // Build SVG path strings
  const forecastPath = timelinePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.forecast)}`)
    .join(' ');

  const actualPoints = timelinePoints.filter((p) => p.actual !== null);
  const actualPath = actualPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.actual)}`)
    .join(' ');

  const capY = getY(55000);

  return (
    <div className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-soft transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)]" />
            STADIUM INGRESS &amp; SURGE RADAR (T-180m → KICKOFF)
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Real-time turnstile telemetry vs. predictive Poisson gate arrival curve
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-emerald-500" />
            <span className="text-[var(--text-secondary)]">Actual Checked-In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[var(--terracotta-primary)] border-dashed" />
            <span className="text-[var(--text-secondary)]">Predicted Surge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-rose-500" />
            <span className="text-[var(--text-secondary)]">Safety Cap (55K)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[21/9] min-h-[220px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[15000, 30000, 45000, 55000].map((level) => (
            <g key={level}>
              <line
                x1={paddingX}
                y1={getY(level)}
                x2={width - paddingX}
                y2={getY(level)}
                stroke="var(--border-subtle)"
                strokeDasharray="2 4"
              />
              <text
                x={paddingX - 6}
                y={getY(level) + 3}
                fill="var(--text-muted)"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                {level / 1000}k
              </text>
            </g>
          ))}

          {/* Safety Capacity Line (Red) */}
          <line
            x1={paddingX}
            y1={capY}
            x2={width - paddingX}
            y2={capY}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Predicted Curve (Terracotta dashed) */}
          <path
            d={forecastPath}
            fill="none"
            stroke="var(--terracotta-primary)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />

          {/* Actual Checked-in Curve (Green solid) */}
          <path
            d={actualPath}
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {timelinePoints.map((p, i) => {
            const cx = getX(i);
            const cy = p.actual !== null ? getY(p.actual) : getY(p.forecast);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={p.time}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={height - paddingY}
                    stroke="var(--text-muted)"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Node point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={p.actual !== null ? '#22c55e' : 'var(--terracotta-primary)'}
                  stroke="var(--bg-surface)"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* X-axis labels */}
                <text
                  x={cx}
                  y={height - paddingY + 16}
                  fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div
            className="pointer-events-none absolute -top-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-xs font-mono shadow-soft transition-all"
            style={{
              left: `${(hoveredIndex / (timelinePoints.length - 1)) * 80 + 5}%`,
            }}
          >
            <div className="text-[var(--text-muted)] text-[10px]">
              {timelinePoints[hoveredIndex].time} ({timelinePoints[hoveredIndex].label})
            </div>
            <div className="text-[var(--text-primary)] font-bold">
              {timelinePoints[hoveredIndex].actual !== null ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Actual: {timelinePoints[hoveredIndex].actual.toLocaleString()}
                </span>
              ) : (
                <span className="text-[var(--terracotta-text)]">
                  Forecast: {timelinePoints[hoveredIndex].forecast.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
