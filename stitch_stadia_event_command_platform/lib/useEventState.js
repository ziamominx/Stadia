'use client';

// lib/useEventState.js — one poller, one shared state, one action channel.
// Every screen subscribes here; nothing holds local copies of event truth.

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const PollContext = createContext({ state: null, act: () => {}, lastSync: null });

const TOAST_LABELS = {
  spike: 'Demo surge injected — watch West Gate',
  dispatch: 'Actions dispatched to field teams',
  'ground.accept': 'Task accepted — team en route',
  'ground.complete': 'Task completed — relief on station',
  'transport.confirm': 'Route change confirmed — fleet rerouted',
  'task.flag': 'Issue flagged to Executive',
  thresholds: 'Thresholds committed to live state',
  emergency: 'Emergency posture updated',
  broadcast: 'PA broadcast sent to all zones',
  report: 'Manual incident logged',
  reset: 'Simulation reset to baseline',
};

export function PollProvider({ children }) {
  const [state, setState] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [toast, setToast] = useState('');
  const inflight = useRef(false);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      if (inflight.current) return;
      inflight.current = true;
      try {
        const r = await fetch('/api/state', { cache: 'no-store' });
        if (r.ok && alive) {
          setState(await r.json());
          setLastSync(new Date());
        }
      } catch { /* transient — next tick retries */ }
      finally { inflight.current = false; }
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const act = useCallback(async (type, args = {}) => {
    const r = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...args }),
    });
    const j = await r.json();
    // hc002-style confirmation toast on every successful write
    if (j && !j.error && TOAST_LABELS[type]) {
      setToast(TOAST_LABELS[type]);
      setTimeout(() => setToast(''), 3200);
    }
    // immediate refresh so the UI reflects the write without waiting a tick
    try {
      const s = await fetch('/api/state', { cache: 'no-store' });
      if (s.ok) { setState(await s.json()); setLastSync(new Date()); }
    } catch { /* poller will catch up */ }
    return j;
  }, []);

  return <PollContext.Provider value={{ state, act, lastSync, toast, setToast }}>{children}</PollContext.Provider>;
}

export function useEventState() {
  return useContext(PollContext);
}
