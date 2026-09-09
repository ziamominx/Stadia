import React, { useState } from 'react';
import { api, useApi } from '../api.js';
import { Sliders, AlertTriangle, Zap, CheckCircle, RefreshCw, ArrowRight, Shield, Hotel, Train } from '../components/Icons.jsx';

export default function ScenarioSimulator() {
  const { data: scenarios, loading: loadingScenarios } = useApi(api.scenarios);
  const { data: ecosystem, reload: reloadEcosystem } = useApi(api.ecosystem);

  const [selectedScenario, setSelectedScenario] = useState('demand_spike');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const activeScenarioObj = scenarios?.find(s => s.id === selectedScenario) || scenarios?.[0];

  const triggerScenario = async (scenarioId) => {
    setIsSimulating(true);
    setSelectedScenario(scenarioId);
    try {
      await api.triggerScenario(scenarioId);
      await reloadEcosystem();
      setSimulationResult({
        scenarioId,
        status: 'CRISIS_ACTIVE',
        message: 'Scenario activated. Ecosystem telemetry updated in real-time.'
      });
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const applyAiMitigation = async () => {
    setIsSimulating(true);
    try {
      await api.applyIntervention({
        title: `AI Autonomous Mitigation for ${activeScenarioObj?.title}`,
        actionType: 'STRESS_TEST_MITIGATION',
        impactMetric: '-42% Peak Congestion',
        description: activeScenarioObj?.aiMitigation
      });
      await reloadEcosystem();
      setSimulationResult({
        scenarioId: selectedScenario,
        status: 'OPTIMIZED',
        message: 'AI mitigation deployed: Load rebalanced across peripheral zones and multimodal transit corridors.'
      });
    } catch (err) {
      alert(`Mitigation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetToBaseline = async () => {
    setIsSimulating(true);
    try {
      await api.resetOrchestration();
      await reloadEcosystem();
      setSimulationResult(null);
      setSelectedScenario('demand_spike');
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  if (loadingScenarios || !scenarios) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse rounded-3xl bg-neutral-900/60 border border-neutral-800" />
      </div>
    );
  }

  const isMitigated = simulationResult?.status === 'OPTIMIZED';
  const isCrisisActive = simulationResult?.status === 'CRISIS_ACTIVE';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Stress-Testing & Crisis Preparedness Engine
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            What-If Scenario Simulator
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Model sudden demand spikes, rain delays, transit outages, and gate failures. Test how AI orchestration re-stabilizes city capacity.
          </p>
        </div>

        <button
          onClick={resetToBaseline}
          disabled={isSimulating}
          className="flex items-center gap-2 rounded-full border border-neutral-800 bg-[#111114] px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset to Baseline
        </button>
      </div>

      {/* Scenario Selection Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map(sc => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => triggerScenario(sc.id)}
              className={`cursor-pointer rounded-3xl border p-5 transition-all shadow-xl flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500/80 bg-[#141816] ring-1 ring-emerald-500/50'
                  : 'border-neutral-800/80 bg-[#111114] hover:border-neutral-700 hover:bg-neutral-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-300">
                    {sc.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">{sc.badge}</span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-white leading-snug">{sc.title}</h3>
                <p className="mt-2 text-xs text-neutral-400 line-clamp-2">{sc.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-400">
                  {isSelected ? '● Simulating' : 'Click to Test'}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulation Workspace & Comparison Deck */}
      {activeScenarioObj && (
        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Scenario Analysis</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">{activeScenarioObj.title}</h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">{activeScenarioObj.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={isSimulating || isMitigated}
                onClick={applyAiMitigation}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition shadow-lg disabled:opacity-40"
              >
                <Zap className="h-3.5 w-3.5 text-black" />
                {isMitigated ? 'Mitigation Active' : 'Execute AI Mitigation'}
              </button>
            </div>
          </div>

          {/* Side-by-Side Impact Model: Unmitigated vs AI-Orchestrated */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Unmitigated Crisis State */}
            <div className={`rounded-2xl border p-5 space-y-4 ${
              isCrisisActive && !isMitigated
                ? 'border-rose-500/40 bg-rose-950/10'
                : 'border-neutral-800 bg-neutral-900/40'
            }`}>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Unmitigated Shock Impact
                  </span>
                </div>
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                  WITHOUT ORCHESTRATION
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {activeScenarioObj.expectedImpact}
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-1">
                    <span>Average Plaza / Gate Wait Time</span>
                    <span className="text-rose-400 font-bold">48 - 55 mins</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[88%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-1">
                    <span>Corridor Traffic Congestion</span>
                    <span className="text-rose-400 font-bold">96% Gridlock</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[96%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-1">
                    <span>Core Hotel Saturation & Price Spike</span>
                    <span className="text-rose-400 font-bold">100% Saturation (2.4x Surge)</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[100%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI-Orchestrated Optimization State */}
            <div className={`rounded-2xl border p-5 space-y-4 ${
              isMitigated
                ? 'border-emerald-500/50 bg-emerald-950/15'
                : 'border-neutral-800 bg-neutral-900/40'
            }`}>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    AI Autonomous Mitigation
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  WITH PLATFORM BALANCING
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {activeScenarioObj.aiMitigation}
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-1">
                    <span>Average Plaza / Gate Wait Time</span>
                    <span className="text-emerald-400 font-bold">12 - 16 mins (-70%)</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[28%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-1">
                    <span>Corridor Traffic Congestion</span>
                    <span className="text-emerald-400 font-bold">62% Smooth Flow (-34%)</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[62%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-1">
                    <span>Peripheral Accommodation Absorption</span>
                    <span className="text-emerald-400 font-bold">5,800 Rooms Activated</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[70%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry Feed from Ecosystem */}
          {ecosystem && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Live Telemetry Response</span>
                <span className="text-neutral-400">Ecosystem Health Score: <strong className="text-emerald-400">{ecosystem.metrics.ecosystemHealthScore}/100</strong></span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-neutral-800 bg-[#111114] p-3">
                  <div className="text-[10px] uppercase text-neutral-400 font-semibold">Flagged Gates</div>
                  <div className="text-lg font-black text-white mt-1">{ecosystem.metrics.flaggedGatesCount} / 8</div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-[#111114] p-3">
                  <div className="text-[10px] uppercase text-neutral-400 font-semibold">City Hotel Load</div>
                  <div className="text-lg font-black text-white mt-1">{ecosystem.metrics.avgHotelSaturation}%</div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-[#111114] p-3">
                  <div className="text-[10px] uppercase text-neutral-400 font-semibold">Transit Corridors</div>
                  <div className="text-lg font-black text-white mt-1">{ecosystem.metrics.avgTransitLoad}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
