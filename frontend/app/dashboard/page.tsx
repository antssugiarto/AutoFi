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
import ScrollReveal from "@/app/components/ScrollReveal";
import { useRouter } from "next/navigation";
import { useWallet, useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "../../idl/autofi_smart_contract.json";
import { PublicKey } from "@solana/web3.js";
import { getVaults, getTransactions, calculateGrowth, hardReset, type Vault, type Transaction } from "@/app/lib/storage";
import { getSolBalance } from "@/app/lib/solana";
import { reportActualProfit } from "@/app/lib/performanceTracker";

export default function DashboardPage() {
  const { state, setGoal } = useGlobalState();
  const router = useRouter();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [, setTick] = useState(0); // for re-render growth
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const anchorWallet = useAnchorWallet();

  // Load data on mount and whenever wallet connection changes
  useEffect(() => {
    async function loadData() {
      // 1. Load Local Storage Data
      const loadedVaults = getVaults();
      setVaults(loadedVaults);
      setTransactions(getTransactions());

      // 2. Fetch Real-time Balance (Wait for this before showing UI)
      if (publicKey && connection) {
        try {
          const bal = await getSolBalance(connection, publicKey);
          setAvailableBalance(bal);
        } catch (e) {
          console.error("Failed to fetch SOL balance:", e);
        }
      }

      // 3. Mark as loaded (Triggers smooth fade-in)
      setIsLoaded(true);

      // 4. Background tasks (Don't need to wait)
      loadedVaults.forEach((v) => {
        const g = calculateGrowth(v);
        if (g.daysElapsed > 0.001) {
          reportActualProfit(
            v.strategyName,
            publicKey?.toString() || "anonymous",
            v.amount,
            g.profit,
            g.daysElapsed
          );
        }
      });
    }

    loadData();
  }, [publicKey, connection]);

  // Re-calculate growth every 1s for ticking effect
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (confirm("Clear all local strategy data? This will not affect your on-chain funds but will reset your dashboard view.")) {
      hardReset();
      window.location.reload();
    }
  };

  const handleInitialize = async () => {
    if (!anchorWallet || !connection) return;
    setIsInitializing(true);
    try {
      const provider = new AnchorProvider(connection, anchorWallet, { preflightCommitment: "confirmed" });
      const program = new Program(idl as any, provider);
      
      const [yieldPoolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("yield_pool")],
        program.programId
      );

      await program.methods
        .initializeYieldPool()
        .accounts({
          yieldPool: yieldPoolPda,
          admin: anchorWallet.publicKey,
        } as any)
        .rpc();

      alert("System Initialized Successfully!");
    } catch (e: any) {
      console.error("Initialization failed:", e);
      alert("Initialization failed: " + e.message);
    } finally {
      setIsInitializing(false);
    }
  };



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
    <main className="pt-20 pb-6 px-8 flex-1 flex flex-col relative overflow-hidden">
      <AmbientBackground
        fixed={false}
        blobs={[
          { color: "secondary", position: "top-right", size: "lg" },
          { color: "tertiary", position: "bottom-left", size: "md" },
        ]}
      />

      <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <ScrollReveal animationClass="spawn-rise" delay={100}>
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
          </ScrollReveal>
        </header>

        {!isLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 opacity-0 animate-in fade-in duration-500 delay-200 fill-mode-forwards">
             <div className="w-10 h-10 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {hasVaults ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Total Balance */}
                <ScrollReveal animationClass="spawn-rise" delay={200} className="md:col-span-8 flex">
                  <section className="flex-1 glass-panel p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
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
                        <span className="text-4xl md:text-5xl font-headline font-extrabold text-white text-glow">
                          {(totalStaked + availableBalance).toFixed(6)}
                        </span>
                        <span className="text-on-surface-variant text-lg">SOL</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Staked</p>
                        <p className="text-lg font-bold text-white">{totalStaked.toFixed(6)} SOL</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Available</p>
                        <p className="text-lg font-bold text-white">{availableBalance.toFixed(6)} SOL</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Yield (24h est.)</p>
                        <p className="text-lg font-bold text-tertiary">+{yield24h.toFixed(6)} SOL</p>
                      </div>
                    </div>
                  </section>
                </ScrollReveal>

                {/* Earnings Growth */}
                <ScrollReveal animationClass="spawn-rise" delay={300} className="md:col-span-4 flex">
                  <section className="flex-1 glass-panel p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                      <span className="text-on-surface-variant text-sm font-medium tracking-wide">
                        Earnings Growth
                      </span>
                      <div className="mt-2">
                        <span className="text-2xl font-headline font-bold text-white">
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
                      className="relative z-10 w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl text-white font-medium text-sm"
                    >
                      View Strategy Details
                    </button>
                  </section>
                </ScrollReveal>

                {/* Active Vaults */}
                <section className="md:col-span-12 mt-6">
                  <ScrollReveal animationClass="spawn-rise" delay={400}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-headline font-bold text-white">Active Vaults</h2>
                      <Link href="/strategy" className="text-primary text-sm font-bold hover:underline">+ Add New Vault</Link>
                    </div>
                  </ScrollReveal>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {vaultDetails.map((v, idx) => (
                      <ScrollReveal key={v.id} animationClass="spawn-rise" delay={500 + idx * 100}>
                        <div className="glass-panel p-5 rounded-xl border border-outline-variant/10 overflow-hidden relative group">
                          <div className="flex justify-between items-start mb-5">
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
                              <div className="text-lg font-bold text-white">{v.currentValue.toFixed(6)} SOL</div>
                              <div className="text-xs text-tertiary font-bold flex items-center justify-end gap-1">
                                <IconArrowUpward size={12}/> {v.expectedAPY}% APY
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href="/dashboard/strategy" className="flex-1 py-3 rounded-xl bg-surface-container-highest text-center text-sm font-bold hover:bg-surface-bright transition-colors border border-outline-variant/10">
                              View Details
                            </Link>
                            <Link href={`/withdraw?id=${v.id}`} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dim text-center text-on-primary text-sm font-bold active:scale-95 transition-transform">
                              Withdraw
                            </Link>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </section>

                {/* Activity Feed */}
                <section className="md:col-span-12 mt-4">
                  <ScrollReveal animationClass="spawn-rise" delay={700}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-headline font-bold text-white">Recent Activity</h2>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleInitialize}
                          disabled={isInitializing}
                          className="text-primary/60 text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-50"
                        >
                          {isInitializing ? "Initializing..." : "Initialize System"}
                        </button>
                        <button 
                          onClick={handleReset}
                          className="text-error/60 text-[10px] font-bold uppercase tracking-widest hover:text-error transition-colors"
                        >
                          System Reset
                        </button>
                        <Link href="/dashboard/history" className="text-primary text-sm font-bold hover:underline">View All</Link>
                      </div>
                    </div>
                  </ScrollReveal>

                  {recentTx.length > 0 ? (
                    <div className="space-y-4">
                      {recentTx.map((tx, idx) => (
                        <ScrollReveal key={tx.id} animationClass="spawn-rise" delay={800 + idx * 100}>
                          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
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
                        </ScrollReveal>
                      ))}
                    </div>
                  ) : (
                    <ScrollReveal animationClass="spawn-rise" delay={800}>
                      <p className="text-sm text-on-surface-variant">No transactions yet.</p>
                    </ScrollReveal>
                  )}
                </section>
              </div>
            ) : (
              <ScrollReveal animationClass="spawn-rise" delay={300} className="flex-1 flex flex-col items-center justify-center py-12 text-center">
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
              </ScrollReveal>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
