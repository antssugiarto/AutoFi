"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconShield, IconHub, IconTrendingUp, IconVerifiedUser, IconTrackChanges, IconHistory } from "@/app/components/icons";
import AmbientBackground from "@/app/components/ambient-background";
import ScrollReveal from "@/app/components/ScrollReveal";
import { getVaults, calculateGrowth, updateVault, addTransaction, type Vault } from "@/app/lib/storage";
import { checkRebalance, RebalanceSuggestion } from "@/app/lib/rebalanceTracker";
import { fetchPerformanceHistory } from "@/app/lib/performanceTracker";

interface PerformanceRecord {
  checkedAt: number;
  expectedProfit: number;
  actualProfit: number;
  accuracy: number;
  daysElapsed: number;
}

export default function StrategyPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [rebalanceSuggestion, setRebalanceSuggestion] = useState<RebalanceSuggestion | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceRecord[]>([]);
  const [isRebalancing, setIsRebalancing] = useState(false);


  useEffect(() => {
    const activeVaults = getVaults();
    setVaults(activeVaults);

    if (activeVaults.length > 0) {
      const v = activeVaults[0];
      
      // 1. Check for rebalance
      checkRebalance(v.strategyName, v.tier || "aggressive").then(suggestion => {
        if (suggestion.triggered) {
          setRebalanceSuggestion(suggestion);
        }
      });

      // 2. Fetch performance history
      fetchPerformanceHistory(v.strategyName).then(data => {
        if (data && data.records) {
          setPerformanceHistory(data.records);
        }
      });
    }

    setIsLoaded(true);
  }, []);

  const hasVaults = vaults.length > 0;

  const handleAutoRebalance = async () => {
    if (!rebalanceSuggestion?.optimalStrategy || vaults.length === 0) return;
    setIsRebalancing(true);
    
    // Simulate some AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const v = vaults[0];
    const optimal = rebalanceSuggestion.optimalStrategy;
    
    const updatedVault: Vault = {
      ...v,
      strategyName: optimal.name,
      expectedAPY: optimal.expectedAPY,
      risk: optimal.risk,
      steps: optimal.steps,
      // We keep the original deployedAt or reset? 
      // Rebalance usually means redeploying capital.
      deployedAt: Date.now(), 
    };
    
    updateVault(updatedVault);
    
    addTransaction({
      type: "Rebalance",
      strategyName: `${v.strategyName} → ${optimal.name}`,
      amount: v.amount,
      token: "SOL",
      timestamp: Date.now(),
      status: "Success"
    });

    setVaults([updatedVault]);
    setRebalanceSuggestion(null);
    setIsRebalancing(false);
  };

  return (
    <main className="pt-20 pb-6 px-8 flex-1 flex flex-col relative overflow-hidden">
      <AmbientBackground
        fixed={false}
        blobs={[
          { color: "secondary", position: "top-right", size: "lg" },
          { color: "tertiary", position: "bottom-left", size: "md" },
        ]}
      />
      <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col">
        <header className="mb-4">
          <ScrollReveal animationClass="spawn-rise" delay={100}>
            <span className="text-primary tracking-[0.2em] font-bold uppercase mb-2 block text-xs">
              Portfolio Management
            </span>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-white tracking-tight">
              Active Strategy
            </h1>
          </ScrollReveal>
        </header>

        {!isLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 opacity-0 animate-in fade-in duration-500 delay-200 fill-mode-forwards">
            <div className="w-10 h-10 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
          </div>
        ) : hasVaults ? (
          <div className="space-y-8">
            {vaults.map((vault, idx) => {
              const growth = calculateGrowth(vault);
              const profitPercent = vault.amount > 0 ? (growth.profit / vault.amount) * 100 : 0;

              return (
                <div key={vault.id}>
                  {/* Vault Header */}
                  <ScrollReveal animationClass="spawn-rise" delay={200 + idx * 100}>
                    <div className="mb-4 bg-surface-container-low rounded-3xl p-5 md:p-6 border border-outline-variant/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-widest">
                          Active Vault
                        </div>
                        <span className="text-xs text-on-surface-variant">
                          Deployed {new Date(vault.deployedAt).toLocaleDateString()} · {growth.daysElapsed.toFixed(1)} days ago
                        </span>
                      </div>
                      <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-white mb-2 capitalize">
                        {vault.strategyName}
                      </h2>
                      <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
                        {vault.steps.join(" → ")}
                      </p>
                    </div>
                  </ScrollReveal>

                  {/* Rebalance Alert */}
                  {rebalanceSuggestion && (
                    <ScrollReveal animationClass="spawn-rise" delay={250 + idx * 100}>
                      <div className="mb-4 bg-gradient-to-r from-secondary/20 to-primary/10 border border-secondary/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-700">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary animate-pulse">
                            <IconHub size={24} />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm md:text-base">Optimization Opportunity!</h4>
                            <p className="text-on-surface-variant text-xs md:text-sm">
                              {rebalanceSuggestion.reason}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleAutoRebalance}
                          disabled={isRebalancing}
                          className="px-6 py-2 bg-secondary text-white text-xs font-bold rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                        >
                          {isRebalancing ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Rebalancing...
                            </>
                          ) : (
                            "Auto-Rebalance"
                          )}
                        </button>
                      </div>
                    </ScrollReveal>
                  )}

                  <ScrollReveal animationClass="spawn-rise" delay={300 + idx * 100}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-4">
                      {/* Performance Chart (Left Column) */}
                      <div className="lg:col-span-2 bg-surface-container-high rounded-3xl p-5 md:p-6 border border-outline-variant/5 flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4 text-white">
                            <IconTrendingUp size={20} className="text-primary" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Performance</h3>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-headline font-extrabold text-white">
                              {profitPercent >= 0 ? "+" : ""}{profitPercent.toFixed(4)}%
                            </span>
                            <span className="text-tertiary text-sm font-bold bg-tertiary/10 px-2 py-1 rounded-md flex items-center gap-1">
                              <IconTrendingUp size={14} /> {vault.expectedAPY}% APY
                            </span>
                          </div>

                          {/* Balance Details */}
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="text-center">
                              <p className="text-sm text-on-surface-variant capitalize">Deposited</p>
                              <p className="text-sm font-bold text-white">{vault.amount.toFixed(4)} SOL</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-on-surface-variant capitalize">Current Value</p>
                              <p className="text-sm font-bold text-white">{growth.currentValue.toFixed(4)} SOL</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-on-surface-variant capitalize">Profit</p>
                              <p className="text-sm font-bold text-tertiary">+{growth.profit.toFixed(6)} SOL</p>
                            </div>
                          </div>

                          {/* Backtest Recap */}
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            <div className="text-center">
                              <p className="text-sm text-on-surface-variant capitalize">7d Return</p>
                              <p className="text-sm font-bold text-primary">{vault.shortTermReturn.toFixed(3)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-on-surface-variant capitalize">30d Return</p>
                              <p className="text-sm font-bold text-secondary">{vault.midTermReturn.toFixed(3)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-on-surface-variant capitalize">90d Return</p>
                              <p className="text-sm font-bold text-tertiary">{vault.longTermReturn.toFixed(3)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-on-surface-variant capitalize">Score</p>
                              <p className="text-sm font-bold text-white">{vault.finalScore.toFixed(3)}</p>
                            </div>
                          </div>
                        </div>

                        <hr className="my-5 border-outline-variant/10" />

                        {/* Performance History */}
                        <div className="h-[155px]">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-3 text-white font-bold text-sm uppercase tracking-wider">
                              <IconHistory size={20} className="text-primary" />
                              Performance History
                            </h3>
                          </div>
                          
                          <div className="overflow-x-auto overflow-y-auto max-h-[115px] pr-2">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="text-on-surface-variant border-b border-outline-variant/10">
                                <th className="pb-3 capitalize text-sm text-on-surface-variant font-medium">Check Date</th>
                                <th className="pb-3 capitalize text-sm text-on-surface-variant font-medium">Expected Profit</th>
                                <th className="pb-3 capitalize text-sm text-on-surface-variant font-medium">Actual Profit</th>
                                <th className="pb-3 capitalize text-sm text-on-surface-variant font-medium">Accuracy</th>
                                <th className="pb-3 capitalize text-sm text-on-surface-variant font-medium text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-variant/5">
                                {performanceHistory.length > 0 ? (
                                  performanceHistory.map((record, i) => (
                                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                                      <td className="py-3 text-on-surface-variant text-sm">
                                        {new Date(record.checkedAt).toLocaleDateString()}
                                      </td>
                                      <td className="py-3 font-mono text-sm">
                                        {record.expectedProfit.toFixed(6)} SOL
                                      </td>
                                      <td className="py-3 font-mono text-tertiary text-sm">
                                        +{record.actualProfit.toFixed(6)} SOL
                                      </td>
                                      <td className="py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden max-w-[60px]">
                                            <div 
                                              className={`h-full ${record.accuracy >= 0.8 ? 'bg-primary' : record.accuracy >= 0.5 ? 'bg-secondary' : 'bg-error'} rounded-full`} 
                                              style={{ width: `${(record.accuracy * 100).toFixed(0)}%` }} 
                                            />
                                          </div>
                                          <span className="text-sm font-bold">{(record.accuracy * 100).toFixed(0)}%</span>
                                        </div>
                                      </td>
                                      <td className="py-3 text-right">
                                        <span className={`px-2 py-1 ${record.accuracy >= 0.8 ? 'bg-tertiary/10 text-tertiary' : record.accuracy >= 0.5 ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'} text-[10px] font-bold rounded-md`}>
                                          {record.accuracy >= 0.8 ? 'STABLE' : record.accuracy >= 0.5 ? 'ADJUSTED' : 'DEVIATED'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr className="group hover:bg-white/5 transition-colors">
                                    <td className="py-6 text-center text-on-surface-variant text-xs italic" colSpan={5}>
                                      No performance records yet. AI is monitoring your strategy...
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Strategy Metrics Sidebar (Right Column) */}
                      <div className="bg-surface-container-high rounded-3xl p-5 md:p-6 border border-outline-variant/5 flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4 text-white">
                            <IconHub size={20} className="text-primary" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Execution Steps</h3>
                          </div>
                          <div className="space-y-3">
                            {vault.steps.map((step, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                                <span className="text-sm text-on-surface-variant capitalize">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <hr className="my-5 border-outline-variant/10" />

                        <div className="h-[155px]">
                          <div className="flex items-center gap-3 mb-4 text-white">
                            <IconShield size={20} className="text-primary" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Risk Profile</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-on-surface-variant">Risk Level</span>
                              <span className="font-bold text-white capitalize">{vault.risk}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-on-surface-variant">Confidence</span>
                              <span className="font-bold text-primary">{(vault.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden mt-2 relative">
                              <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full" style={{ width: `${(vault.confidence * 100).toFixed(0)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 mb-5 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
              <IconTrackChanges size={40} />
            </div>
            <h2 className="text-2xl font-headline font-bold text-white mb-3">No Active Strategies</h2>
            <p className="text-sm text-on-surface-variant max-w-md mb-6">
              You haven&apos;t set up any automated DeFi strategies yet. Choose a goal and let AutoFi handle the rest.
            </p>
            <Link
              href="/strategy"
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dim text-white text-sm font-bold rounded-full shadow-[0_0_24px_rgba(163,166,255,0.3)] hover:shadow-[0_0_32px_rgba(163,166,255,0.5)] transition-all"
            >
              Select a Strategy
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
