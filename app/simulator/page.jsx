'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Terminal, ArrowRight } from '../../components/Icons';

export default function SimulatorPage() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('demand_spike');
  const [isSimulating, setIsSimulating] = useState(false);
  const [mitigated, setMitigated] = useState(false);
  const [activeScenarioDetails, setActiveScenarioDetails] = useState(null);

  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => res.json())
      .then(data => {
        setScenarios(data.scenarios || []);
        if (data.scenarios?.length > 0) {
          setActiveScenarioDetails(data.scenarios[0]);
        }
      })
      .catch(console.error);
  }, []);

  const triggerScenario = async (id) => {
    setIsSimulating(true);
    setSelectedScenario(id);
    setMitigated(false);
    try {
      await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id }),
      });
      const sc = scenarios.find(s => s.id === id);
      setActiveScenarioDetails(sc);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const applyMitigation = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Autonomous Mitigation: ${activeScenarioDetails?.title}`,
          actionType: 'STRESS_TEST_MITIGATION',
          impactMetric: '-42% Peak Congestion',
          description: activeScenarioDetails?.orchestratedOutcome
        }),
      });
      setMitigated(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetToBaseline = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      setMitigated(false);
      setSelectedScenario('demand_spike');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[var(--terracotta-primary)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
              Operational Preparedness &amp; Scenario Simulator
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Crisis Stress-Testing Engine
          </h1>
          <p className="text-xs text-[var(--text-secondary)] max-w-xl">
            Model sudden demand surges, hardware turnstile breakdowns, and transit stoppages to evaluate cross-agency mitigation protocols.
          </p>
        </div>

        <button
          onClick={resetToBaseline}
          disabled={isSimulating}
          className="btn-press flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--terracotta-primary)] disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[var(--terracotta-primary)]" />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map(sc => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => triggerScenario(sc.id)}
              className={`card-hover cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between shadow-sm ${
                isSelected
                  ? 'border-[var(--terracotta-primary)] bg-[var(--terracotta-soft)] shadow-md'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--terracotta-primary)]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-[var(--terracotta-primary)]' : 'text-[var(--text-muted)]'}`}>
                    {sc.code}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">{sc.domain}</span>
                </div>
                <h3 className="text-xs font-semibold text-[var(--text-primary)] tracking-tight leading-snug">{sc.title}</h3>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{sc.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono">
                <span className={isSelected ? 'text-[var(--terracotta-primary)] font-bold' : 'text-[var(--text-muted)]'}>
                  {isSelected ? 'ACTIVE DRILL' : 'LOAD SCENARIO'}
                </span>
                <ArrowRight className={`h-3 w-3 ${isSelected ? 'text-[var(--terracotta-primary)]' : 'text-[var(--text-muted)]'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scenario Comparison & Response Deck */}
      {activeScenarioDetails && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-[var(--terracotta-primary)] font-semibold">
                {activeScenarioDetails.code} · {activeScenarioDetails.domain}
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1">{activeScenarioDetails.title}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">{activeScenarioDetails.description}</p>
            </div>

            <div>
              <button
                disabled={isSimulating || mitigated}
                onClick={applyMitigation}
                className="btn-press rounded-full bg-[var(--terracotta-primary)] px-5 py-2 text-xs font-semibold text-white hover:bg-[var(--terracotta-hover)] disabled:opacity-40 flex items-center gap-2 shadow-sm"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>{mitigated ? 'Mitigation Active' : 'Authorize Autonomous Mitigation'}</span>
              </button>
            </div>
          </div>

          {/* Comparative Model: Unmitigated vs Orchestrated */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Unmitigated Shock */}
            <div className="rounded-xl border border-rose-500/20 bg-[var(--bg-elevated)] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                  Unmitigated Shock
                </span>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">WITHOUT ORCHESTRATION</span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {activeScenarioDetails.unmitigatedImpact}
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--text-muted)]">Peak Perimeter Wait</span>
                    <span className="text-rose-500 font-bold">48 - 55 mins</span>
                  </div>
                  <div className="w-full bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[90%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--text-muted)]">Arterial Highway Load</span>
                    <span className="text-rose-500 font-bold">96% Gridlock</span>
                  </div>
                  <div className="w-full bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[96%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--text-muted)]">Core Hotel Surcharge</span>
                    <span className="text-rose-500 font-bold">100% Saturation (2.4x)</span>
                  </div>
                  <div className="w-full bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[100%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Orchestrated Dynamic Equilibrium */}
            <div className={`rounded-xl border p-5 space-y-4 transition ${
              mitigated
                ? 'border-[var(--terracotta-primary)] bg-[var(--terracotta-soft)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'
            }`}>
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  Orchestrated Equilibrium
                </span>
                <span className="text-[10px] font-mono uppercase text-[var(--terracotta-primary)] font-bold">
                  CROSS-AGENCY BALANCED
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {activeScenarioDetails.orchestratedOutcome}
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--text-muted)]">Peak Perimeter Wait</span>
                    <span className="text-[var(--text-primary)] font-bold">12 - 15 mins (-70%)</span>
                  </div>
                  <div className="w-full bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-[var(--terracotta-primary)] rounded-full w-[26%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--text-muted)]">Arterial Highway Load</span>
                    <span className="text-[var(--text-primary)] font-bold">60% Regulated Flow (-36%)</span>
                  </div>
                  <div className="w-full bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-[var(--terracotta-primary)] rounded-full w-[60%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--text-muted)]">Peripheral Hotel Absorption</span>
                    <span className="text-[var(--text-primary)] font-bold">5,800 Rooms Activated</span>
                  </div>
                  <div className="w-full bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-[var(--terracotta-primary)] rounded-full w-[75%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
