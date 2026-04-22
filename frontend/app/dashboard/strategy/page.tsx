"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconShield, IconHub, IconTrendingUp, IconVerifiedUser, IconTrackChanges } from "@/app/components/icons";
import AmbientBackground from "@/app/components/ambient-background";
import { getVaults, calculateGrowth, type Vault } from "@/app/lib/storage";

export default function StrategyPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);

  useEffect(() => {
    setVaults(getVaults());
  }, []);

  const hasVaults = vaults.length > 0;

  return (
    <main className="pt-24 pb-12 px-8 flex-1 flex flex-col relative overflow-hidden">
      <AmbientBackground
        fixed={false}
        blobs={[
          { color: "secondary", position: "top-right", size: "lg" },
          { color: "tertiary", position: "bottom-left", size: "md" },
        ]}
      />
      <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
        <header className="mb-8">
          <span className="text-primary tracking-[0.2em] font-bold uppercase mb-2 block text-xs">
            Portfolio Management
          </span>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-white tracking-tight">
            Active Strategy
          </h1>
        </header>

        {hasVaults ? (
          <div className="space-y-8">
            {vaults.map((vault) => {
              const growth = calculateGrowth(vault);
              const profitPercent = vault.amount > 0 ? (growth.profit / vault.amount) * 100 : 0;

              return (
                <div key={vault.id}>
                  {/* Vault Header */}
                  <div className="mb-6 bg-surface-container-low rounded-3xl p-6 md:p-8 border border-outline-variant/10">
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

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Performance Chart */}
                    <div className="lg:col-span-2 bg-surface-container-low rounded-3xl p-6 md:p-8 border border-outline-variant/10 flex flex-col justify-between min-h-[360px]">
                      <div>
                        <h3 className="font-headline font-bold text-lg mb-1">Performance</h3>
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-headline font-extrabold text-white">
                            {profitPercent >= 0 ? "+" : ""}{profitPercent.toFixed(4)}%
                          </span>
                          <span className="text-tertiary text-sm font-bold bg-tertiary/10 px-2 py-1 rounded-md flex items-center gap-1">
                            <IconTrendingUp size={14} /> {vault.expectedAPY}% APY
                          </span>
                        </div>
                      </div>

                      {/* Balance Details */}
                      <div className="mt-8 grid grid-cols-3 gap-6">
                        <div className="bg-surface-container-highest/30 rounded-xl p-4">
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Deposited</p>
                          <p className="text-lg font-bold text-white">{vault.amount.toFixed(4)} SOL</p>
                        </div>
                        <div className="bg-surface-container-highest/30 rounded-xl p-4">
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Current Value</p>
                          <p className="text-lg font-bold text-white">{growth.currentValue.toFixed(4)} SOL</p>
                        </div>
                        <div className="bg-surface-container-highest/30 rounded-xl p-4">
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Profit</p>
                          <p className="text-lg font-bold text-tertiary">+{growth.profit.toFixed(6)} SOL</p>
                        </div>
                      </div>

                      {/* Backtest Recap */}
                      <div className="mt-6 grid grid-cols-4 gap-3">
                        <div className="bg-surface-container-highest/20 rounded-lg p-3 text-center">
                          <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">7d Return</p>
                          <p className="text-sm font-bold text-primary">{vault.shortTermReturn.toFixed(3)}%</p>
                        </div>
                        <div className="bg-surface-container-highest/20 rounded-lg p-3 text-center">
                          <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">30d Return</p>
                          <p className="text-sm font-bold text-secondary">{vault.midTermReturn.toFixed(3)}%</p>
                        </div>
                        <div className="bg-surface-container-highest/20 rounded-lg p-3 text-center">
                          <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">90d Return</p>
                          <p className="text-sm font-bold text-tertiary">{vault.longTermReturn.toFixed(3)}%</p>
                        </div>
                        <div className="bg-surface-container-highest/20 rounded-lg p-3 text-center">
                          <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Score</p>
                          <p className="text-sm font-bold text-white">{vault.finalScore.toFixed(3)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Strategy Metrics Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/5">
                        <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                          <IconHub size={20} />
                          <h3 className="font-bold text-sm uppercase tracking-wider">Execution Steps</h3>
                        </div>
                        <div className="space-y-3">
                          {vault.steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                              <span className="text-sm text-white capitalize">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/5">
                        <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                          <IconShield size={20} />
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
                          <div className="w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full" style={{ width: `${(vault.confidence * 100).toFixed(0)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
