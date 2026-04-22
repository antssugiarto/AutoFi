"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AmbientBackground from "@/app/components/ambient-background";
import {
  IconArrowUpward,
  IconTrackChanges,
  IconAutorenew,
  IconPayments,
  IconTrendingUp,
} from "@/app/components/icons";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getVaults, getTransactions, calculateGrowth, type Vault, type Transaction } from "@/app/lib/storage";
import { getSolBalance } from "@/app/lib/solana";

export default function DashboardPage() {
  const { state, setGoal } = useGlobalState();
  const router = useRouter();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [, setTick] = useState(0); // for re-render growth

  // Load data on mount
  useEffect(() => {
    setVaults(getVaults());
    setTransactions(getTransactions());
  }, []);

  // Fetch real SOL balance
  useEffect(() => {
    if (publicKey && connection) {
      getSolBalance(connection, publicKey).then(setAvailableBalance);
    }
  }, [publicKey, connection]);

  // Re-calculate growth every 30s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const hasVaults = vaults.length > 0;

  // Calculate portfolio totals
  let totalStaked = 0;
  let totalProfit = 0;
  const vaultDetails = vaults.map((v) => {
    const g = calculateGrowth(v);
    totalStaked += g.currentValue;
    totalProfit += g.profit;
    return { ...v, ...g };
  });

  const totalBalance = totalStaked + availableBalance;
  const yield24h = vaults.reduce((sum, v) => sum + (v.amount * v.expectedAPY / 100 / 365), 0);
  const changePercent = totalStaked > 0 ? (totalProfit / (totalStaked - totalProfit)) * 100 : 0;

  // Recent 2 transactions for activity feed
  const recentTx = transactions.slice(0, 2);

  return (
    <main className="pt-24 pb-12 px-8 flex-1 flex flex-col relative overflow-hidden">
      <AmbientBackground
        fixed={false}
        blobs={[
          { color: "secondary", position: "top-right", size: "lg" },
          { color: "tertiary", position: "bottom-left", size: "md" },
        ]}
      />

      <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <span className="text-primary tracking-[0.2em] font-bold uppercase mb-2 block text-xs">
              Atmosphere Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-white tracking-tight flex items-center gap-4">
              Overview
              {hasVaults && (
                <span className="text-sm font-bold bg-tertiary/10 text-tertiary px-3 py-1.5 rounded-full border border-tertiary/20 tracking-normal inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  {vaults.length} Active Vault{vaults.length > 1 ? "s" : ""}
                </span>
              )}
            </h1>
          </div>
        </header>

        {hasVaults ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Total Balance */}
            <section className="md:col-span-8 glass-panel p-8 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-on-surface-variant text-sm font-medium tracking-wide">
                    Total Balance
                  </span>
                  <div className="flex items-center gap-4">
                    {changePercent > 0 && (
                      <span className="flex items-center gap-1 text-tertiary text-xs bg-tertiary/10 px-2 py-1 rounded-full">
                        <IconArrowUpward size={12} />
                        +{changePercent.toFixed(2)}%
                      </span>
                    )}
                    <Link
                      href="/withdraw"
                      className="px-4 py-1.5 rounded-full bg-surface-container-highest text-white text-xs font-bold hover:bg-surface-bright transition-colors border border-outline-variant/20"
                    >
                      Withdraw
                    </Link>
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl md:text-6xl font-headline font-extrabold text-white text-glow">
                    {totalBalance.toFixed(4)}
                  </span>
                  <span className="text-on-surface-variant text-xl">SOL</span>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Staked</p>
                  <p className="text-lg font-bold text-white">{totalStaked.toFixed(4)} SOL</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Available</p>
                  <p className="text-lg font-bold text-white">{availableBalance.toFixed(4)} SOL</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Yield (24h est.)</p>
                  <p className="text-lg font-bold text-tertiary">+{yield24h.toFixed(6)} SOL</p>
                </div>
              </div>
            </section>

            {/* Earnings Growth */}
            <section className="md:col-span-4 glass-panel p-8 rounded-xl border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-on-surface-variant text-sm font-medium tracking-wide">
                  Earnings Growth
                </span>
                <div className="mt-4">
                  <span className="text-3xl font-headline font-bold text-white">
                    +{totalProfit.toFixed(6)}
                  </span>
                  <p className="text-xs text-on-surface-variant mt-1">SOL Total Profit</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-32 opacity-40">
                <svg className="w-full h-full" viewBox="0 0 400 150">
                  <defs>
                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "#a3a6ff", stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: "#61c2ff", stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,130 C50,120 80,140 120,110 C160,80 200,90 240,60 C280,30 320,50 400,20"
                    fill="none"
                    stroke="url(#gradient-line)"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
              </div>
              <button
                onClick={() => router.push("/dashboard/strategy")}
                className="relative z-10 w-full mt-8 py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl text-white font-medium text-sm"
              >
                View Strategy Details
              </button>
            </section>

            {/* Active Vaults */}
            <section className="md:col-span-12 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-headline font-bold text-white">Active Vaults</h2>
                <Link href="/strategy" className="text-primary text-sm font-bold hover:underline">+ Add New Vault</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vaultDetails.map((v) => (
                  <div key={v.id} className="glass-panel p-6 rounded-xl border border-outline-variant/10 overflow-hidden relative group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/20 shadow-xl group-hover:scale-105 transition-transform duration-500">
                          <IconTrackChanges size={24} />
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-white capitalize">{v.strategyName}</h3>
                          <span className="text-xs text-on-surface-variant capitalize">{v.risk} risk · {v.steps.length} steps</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{v.currentValue.toFixed(4)} SOL</div>
                        <div className="text-xs text-tertiary font-bold flex items-center justify-end gap-1">
                          <IconArrowUpward size={12}/> {v.expectedAPY}% APY
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href="/dashboard/strategy" className="flex-1 py-3 rounded-xl bg-surface-container-highest text-center text-sm font-bold hover:bg-surface-bright transition-colors border border-outline-variant/10">
                        View Details
                      </Link>
                      <Link href="/withdraw" className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dim text-center text-on-primary text-sm font-bold active:scale-95 transition-transform">
                        Withdraw
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Activity Feed */}
            <section className="md:col-span-12 mt-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-headline font-bold text-white">Recent Activity</h2>
                <Link href="/dashboard/history" className="text-primary text-sm font-bold hover:underline">View All</Link>
              </div>

              {recentTx.length > 0 ? (
                <div className="space-y-4">
                  {recentTx.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "Deploy" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"}`}>
                          {tx.type === "Deploy" ? <IconPayments size={20} /> : <IconAutorenew size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{tx.type}: {tx.strategyName}</p>
                          <p className="text-xs text-on-surface-variant">{tx.amount} {tx.token}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.status === "Success" ? "text-tertiary" : "text-error"}`}>{tx.status}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No transactions yet.</p>
              )}
            </section>
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
