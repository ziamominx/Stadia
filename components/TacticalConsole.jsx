'use client';

import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertCircle, ArrowRight } from './Icons';

export default function TacticalConsole({ onActionDispatched }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [notification, setNotification] = useState(null);

  const dispatch = async (actionKey, payload) => {
    setLoadingAction(actionKey);
    try {
      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch');

      setNotification({
        type: 'success',
        text: `Directive Executed: ${payload.title} (${payload.impactMetric})`
      });
      if (onActionDispatched) onActionDispatched();
      setTimeout(() => setNotification(null), 4500);
    } catch (err) {
      setNotification({
        type: 'error',
        text: `Dispatch Failed: ${err.message}`
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const directives = [
    {
      key: 'shuttle_deploy',
      title: 'Dispatch 16 Rapid Shuttles',
      target: 'MMRDA Municipal Transport',
      impact: '-28% Highway Congestion',
      desc: 'Mobilizes dedicated electric express buses between Belapur Metro hub and South concourse.',
      actionType: 'TRANSIT_FLEET_DISPATCH'
    },
    {
      key: 'gate_diversion',
      title: 'Push Third-Party Gate Diversion',
      target: 'BookMyShow & FIFA Apps',
      impact: '-42% North Plaza Density',
      desc: 'Transmits push notifications and real-time pass reassignments to West Gates G & H for local ticket holders.',
      actionType: 'TICKETING_APP_DIRECTIVE'
    },
    {
      key: 'hotel_overflow',
      title: 'Release Kharghar Buffer Inventory',
      target: 'Hospitality Consortium PMS',
      impact: '+3,400 Rooms Released',
      desc: 'Activates partner hotel blocks in Kharghar Green Corridor with complimentary metro shuttle transit passes.',
      actionType: 'HOTEL_PMS_BUFFER_RELEASE'
    },
    {
      key: 'early_ingress',
      title: 'Broadcast Early Ingress Vouchers',
      target: 'Third-Party Ticketing Wallet',
      impact: '-35% Peak Gate Queue',
      desc: 'Credits ₹250 concessions voucher to ticket holders scanning turnstiles in the T-3h to T-2h arrival window.',
      actionType: 'DEMAND_NUDGE_BROADCAST'
    }
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-soft transition-colors">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[var(--terracotta-text)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">Tactical Interventions</h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">DIRECT DISPATCH</span>
      </div>

      {notification && (
        <div className={`rounded-xl border px-3 py-2 text-xs flex items-center justify-between transition-all ${
          notification.type === 'success'
            ? 'border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] text-[var(--terracotta-text)]'
            : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
        }`}>
          <span className="font-medium">{notification.text}</span>
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--terracotta-primary)] shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          )}
        </div>
      )}

      <div className="space-y-2.5">
        {directives.map(dir => {
          const isPending = loadingAction === dir.key;
          return (
            <div
              key={dir.key}
              className="card-hover rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">{dir.title}</div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">Destination: {dir.target}</div>
                </div>
                <span className="rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-mono text-[var(--terracotta-text)] font-semibold">
                  {dir.impact}
                </span>
              </div>

              <p className="text-[11px] text-[var(--text-secondary)] leading-normal">{dir.desc}</p>

              <div className="pt-1">
                <button
                  disabled={isPending}
                  onClick={() => dispatch(dir.key, {
                    title: dir.title,
                    actionType: dir.actionType,
                    impactMetric: dir.impact,
                    description: dir.desc
                  })}
                  className="btn-press w-full rounded-lg bg-[var(--terracotta-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--terracotta-hover)] disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>{isPending ? 'Deploying...' : 'Authorize Directive'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
