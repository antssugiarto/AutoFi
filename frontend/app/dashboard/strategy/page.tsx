"use client";

import Link from "next/link";
import { IconShield, IconHub, IconTrendingUp, IconVerifiedUser, IconTrackChanges } from "@/app/components/icons";
import { useGlobalState } from "@/app/lib/GlobalStateContext";

export default function StrategyPage() {
  const { state } = useGlobalState();
  const hasStrategy = state.status === "success" || state.goal !== null;

  return (
    <main className="pt-24 pb-12 px-8 flex-1 flex flex-col relative overflow-hidden">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
        {hasStrategy ? (
          <>
            <header className="mb-10 flex items-center justify-between">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
            Active Vault
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-2">
            The Blue-Chip Autopilot
          </h1>
          <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
            Automatically rebalancing between ETH, BTC, and top stablecoins to capture market growth while minimizing volatility through advanced yield strategies.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-surface-container-low rounded-3xl p-6 md:p-8 border border-outline-variant/10 flex flex-col justify-between min-h-[400px]">
          <div>
            <h3 className="font-headline font-bold text-lg mb-1">Performance (All Time)</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-headline font-extrabold text-white">+12.4%</span>
              <span className="text-tertiary text-sm font-bold bg-tertiary/10 px-2 py-1 rounded-md flex items-center gap-1">
                <IconTrendingUp size={14} /> APR
              </span>
            </div>
          </div>
          
          {/* Mock Chart SVG */}
          <div className="w-full h-48 mt-8 relative flex items-end">
            <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(163,166,255,0.4)" />
                  <stop offset="100%" stopColor="rgba(163,166,255,0)" />
                </linearGradient>
              </defs>
              <path 
                d="M0,100 L0,80 C50,70 100,90 150,60 C200,30 250,50 300,20 C350,-10 400,10 400,10 L400,100 Z" 
                fill="url(#chartGradient)"
              />
              <path 
                d="M0,80 C50,70 100,90 150,60 C200,30 250,50 300,20 C350,-10 400,10" 
                fill="none" 
                stroke="#A3A6FF" 
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex justify-between items-end opacity-30 text-xs text-on-surface-variant font-mono">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
            </div>
          </div>
        </div>

        {/* Strategy Metrics */}
        <div className="space-y-6">
          <div className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
              <IconHub size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Allocation</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Lido (stETH)", pct: "45%", color: "bg-[#00a3ff]" },
                { label: "Aave (USDC)", pct: "35%", color: "bg-[#B6509E]" },
                { label: "Jupiter (JLP)", pct: "20%", color: "bg-[#25C48E]" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold">{item.label}</span>
                    <span className="font-mono text-on-surface-variant">{item.pct}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
              <IconShield size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Risk Profile</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-surface-container-lowest rounded-md text-xs font-bold border border-outline-variant/10 text-white flex items-center gap-1"><IconVerifiedUser size={14} className="text-tertiary" /> Audited Contracts</span>
              <span className="px-3 py-1 bg-surface-container-lowest rounded-md text-xs font-bold border border-outline-variant/10">No Impermanent Loss</span>
              <span className="px-3 py-1 bg-surface-container-lowest rounded-md text-xs font-bold border border-outline-variant/10">Auto-Compound</span>
            </div>
          </div>
        </div>
        </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 mb-5 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
              <IconTrackChanges size={40} />
            </div>
            <h2 className="text-2xl font-headline font-bold text-white mb-3">No Active Strategies</h2>
            <p className="text-sm text-on-surface-variant max-w-md mb-6">
              You haven't set up any automated DeFi strategies yet. Choose a goal and let AutoFi handle the rest.
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

