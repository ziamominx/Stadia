import { useState } from 'react';
import { api, useApi } from '../api.js';
import Kpi from '../components/Kpi.jsx';
import { AlertTriangle, CheckCircle, RefreshCw, Sliders, Zap, ArrowRight } from '../components/Icons.jsx';

export default function ScenarioSimulator() {
  const { data: scenarios, loading: loadingScenarios } = useApi(api.scenarios);
  const { data: ecosystem, reload: reloadEcosystem } = useApi(api.ecosystem);

  const [selectedScenario, setSelectedScenario] = useState('demand_spike');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [actionError, setActionError] = useState(null);

  const activeScenarioObj = scenarios?.find((s) => s.id === selectedScenario) || scenarios?.[0];

  const triggerScenario = async (scenarioId) => {
    setIsSimulating(true);
    setActionError(null);
    setSelectedScenario(scenarioId);
    try {
      await api.triggerScenario(scenarioId);
      await reloadEcosystem();
      setSimulationResult({
        scenarioId,
        status: 'CRISIS_ACTIVE',
        message: 'Scenario activated. Ecosystem telemetry updated in real-time.',
      });
    } catch (err) {
      setActionError(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const applyAiMitigation = async () => {
    setIsSimulating(true);
    setActionError(null);
    try {
      await api.applyIntervention({
        title: `AI Autonomous Mitigation for ${activeScenarioObj?.title}`,
        actionType: 'STRESS_TEST_MITIGATION',
        impactMetric: '-42% Peak Congestion',
        description: activeScenarioObj?.aiMitigation,
      });
      await reloadEcosystem();
      setSimulationResult({
        scenarioId: selectedScenario,
        status: 'OPTIMIZED',
        message: 'AI mitigation deployed: load rebalanced across peripheral zones and multimodal transit corridors.',
      });
    } catch (err) {
      setActionError(`Mitigation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetToBaseline = async () => {
    setIsSimulating(true);
    setActionError(null);
    try {
      await api.resetOrchestration();
      await reloadEcosystem();
      setSimulationResult(null);
      setSelectedScenario('demand_spike');
    } catch (err) {
      setActionError(`Reset failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  if (loadingScenarios || !scenarios) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-96 animate-pulse rounded-2xl bg-ink-800" />
      </div>
    );
  }

  const isMitigated = simulationResult?.status === 'OPTIMIZED';
  const isCrisisActive = simulationResult?.status === 'CRISIS_ACTIVE';

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyber-400">Stress-testing & crisis preparedness engine</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">What-If Scenario Simulator</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Model sudden demand spikes, rain delays, transit outages and gate failures. Test how AI orchestration re-stabilizes city capacity.
          </p>
        </div>
        <button onClick={resetToBaseline} disabled={isSimulating} className="btn-ghost !px-4 !py-2.5 text-[13px]">
          <RefreshCw className="h-3.5 w-3.5" /> Reset to baseline
        </button>
      </div>

      {actionError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">{actionError}</div>
      )}

      {/* Scenario cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scenarios.map((sc, i) => {
          const isSelected = selectedScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => triggerScenario(sc.id)}
              disabled={isSimulating}
              className={`panel panel-hover fade-up flex flex-col justify-between rounded-2xl p-5 text-left transition ${
                isSelected ? '!border-cyber-400/70 shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_18px_50px_-18px_rgba(14,165,233,0.45)]' : ''
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="chip border-white/15 bg-white/[0.04] text-slate-300">{sc.category}</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-amber-300">{sc.badge}</span>
                </div>
                <h3 className="mt-3 text-sm font-bold leading-snug text-white">{sc.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-slate-400">{sc.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-cyber-300' : 'text-slate-500'}`}>
                  {isSelected ? '● Simulating' : 'Click to test'}
                </span>
                <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? 'text-cyber-300' : 'text-slate-500'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Analysis workspace */}
      {activeScenarioObj && (
        <div className="panel fade-up space-y-6 rounded-2xl p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="live-dot" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-300">Scenario analysis</span>
              </div>
              <h2 className="mt-1.5 text-xl font-black tracking-tight text-white">{activeScenarioObj.title}</h2>
              <p className="mt-1 max-w-2xl text-xs text-slate-400">{activeScenarioObj.description}</p>
            </div>
            <button
              disabled={isSimulating || isMitigated}
              onClick={applyAiMitigation}
              className="btn-primary shrink-0"
            >
              <Zap className="h-4 w-4" />
              {isMitigated ? 'Mitigation active' : 'Execute AI mitigation'}
            </button>
          </div>

          {/* Side-by-side impact model */}
          <div className="grid gap-6 md:grid-cols-2">
            <div
              className={`space-y-4 rounded-2xl border p-5 ${
                isCrisisActive && !isMitigated ? 'border-rose-500/40 bg-rose-500/[0.04]' : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-rose-300">
                  <AlertTriangle className="h-4 w-4" /> Unmitigated shock impact
                </div>
                <span className="chip border-rose-500/40 bg-rose-500/10 text-rose-300">Without orchestration</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">{activeScenarioObj.expectedImpact}</p>
              <div className="space-y-3 pt-2">
                {[
                  ['Average plaza / gate wait time', '48 – 55 mins', 88],
                  ['Corridor traffic congestion', '96% gridlock', 96],
                  ['Core hotel saturation & price spike', '100% saturation (2.4x surge)', 100],
                ].map(([label, value, width]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-slate-400">
                      <span>{label}</span>
                      <span className="text-rose-300">{value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
                      <div className="h-full rounded-full bg-rose-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`space-y-4 rounded-2xl border p-5 ${isMitigated ? 'border-emerald-500/50 bg-emerald-500/[0.05]' : 'border-white/10 bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-300">
                  <CheckCircle className="h-4 w-4" /> AI autonomous mitigation
                </div>
                <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-300">With platform balancing</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">{activeScenarioObj.aiMitigation}</p>
              <div className="space-y-3 pt-2">
                {[
                  ['Average plaza / gate wait time', '12 – 16 mins (-70%)', 28],
                  ['Corridor traffic congestion', '62% smooth flow (-34%)', 62],
                  ['Peripheral accommodation absorption', '5,800 rooms activated', 70],
                ].map(([label, value, width]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-slate-400">
                      <span>{label}</span>
                      <span className="text-emerald-300">{value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live telemetry */}
          {ecosystem && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase tracking-wider text-white">Live telemetry response</span>
                <span className="text-slate-400">
                  Ecosystem health score: <strong className="text-emerald-300">{ecosystem.metrics.ecosystemHealthScore}/100</strong>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Kpi label="Flagged gates" value={ecosystem.metrics.flaggedGatesCount} suffix="/ 8" icon="🚪" status={ecosystem.metrics.flaggedGatesCount ? 'warn' : 'ok'} sub="Above 75% load" />
                <Kpi label="City hotel load" value={ecosystem.metrics.avgHotelSaturation} suffix="%" icon="🏨" status={ecosystem.metrics.avgHotelSaturation > 85 ? 'warn' : 'ok'} sub="Average across zones" delay={0.05} />
                <Kpi label="Transit corridors" value={ecosystem.metrics.avgTransitLoad} suffix="%" icon="🚆" status={ecosystem.metrics.avgTransitLoad > 80 ? 'warn' : 'ok'} sub="Average corridor load" delay={0.1} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
