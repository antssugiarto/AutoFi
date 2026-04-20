"use client";

import Link from "next/link";
import AmbientBackground from "@/app/components/ambient-background";
import {
  IconArrowUpward,
  IconTrackChanges,
  IconAutorenew,
  IconPayments,
} from "@/app/components/icons";
import { PORTFOLIO, HOLDINGS, ACTIVITY } from "@/app/lib/constants";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { state, setGoal } = useGlobalState();
  const router = useRouter();
  const hasStrategy = state.status === "success" || state.goal !== null;

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
          <header className="mb-8">
            <span className="text-primary tracking-[0.2em] font-bold uppercase mb-2 block text-xs">
              Atmosphere Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-white tracking-tight">
              System Status: Optimal
            </h1>
          </header>

          {/* Bento Grid */}
          {hasStrategy ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Total Balance */}
              <section className="md:col-span-8 glass-panel p-8 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-on-surface-variant text-sm font-medium tracking-wide">
                      Total Balance
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-tertiary text-xs bg-tertiary/10 px-2 py-1 rounded-full">
                        <IconArrowUpward size={12} />
                        +{PORTFOLIO.changePercent}%
                      </span>
                      <Link
                        href="/withdraw"
                        className="px-4 py-1.5 rounded-full bg-surface-container-highest text-white text-xs font-bold hover:bg-surface-bright transition-colors border border-outline-variant/20"
                      >
                        Withdraw
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl md:text-7xl font-headline font-extrabold text-white text-glow">
                      ${PORTFOLIO.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-on-surface-variant text-xl">USD</span>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                      Staked
                    </p>
                    <p className="text-lg font-bold text-white">
                      ${PORTFOLIO.staked.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                      Available
                    </p>
                    <p className="text-lg font-bold text-white">
                      ${PORTFOLIO.available.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                      Yield (24h)
                    </p>
                    <p className="text-lg font-bold text-tertiary">
                      +${PORTFOLIO.yield24h.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
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
                      14.2%
                    </span>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Annual Projected Yield
                    </p>
                  </div>
                </div>

                {/* Chart Line SVG */}
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

                <button className="relative z-10 w-full mt-8 py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl text-white font-medium text-sm">
                  View Detailed Report
                </button>
              </section>

              {/* Active Vaults */}
              <section className="md:col-span-12 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-headline font-bold text-white">
                    Active Vaults
                  </h2>
                  <Link href="/strategy" className="text-primary text-sm font-bold hover:underline">
                    + Add New Vault
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vault 1 */}
                  <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 overflow-hidden relative group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/20 shadow-xl group-hover:scale-105 transition-transform duration-500">
                          <IconTrackChanges size={24} />
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-white">The Blue-Chip Autopilot</h3>
                          <span className="text-xs text-on-surface-variant">Aggressive Growth</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">$24,910.00</div>
                        <div className="text-xs text-tertiary font-bold flex items-center justify-end gap-1"><IconArrowUpward size={12}/> 12.4% APR</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href="/dashboard/strategy" className="flex-1 py-3 rounded-xl bg-surface-container-highest text-center text-sm font-bold hover:bg-surface-bright transition-colors border border-outline-variant/10">
                        View Details
                      </Link>
                      <button 
                        onClick={() => {
                          setGoal(state.goal || "blue_chip");
                          router.push("/amount");
                        }}
                        className="flex-1 py-3 rounded-xl bg-primary/10 text-primary text-center text-sm font-bold hover:bg-primary/20 transition-colors border border-primary/20"
                      >
                        Top Up
                      </button>
                      <Link href="/withdraw" className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dim text-center text-on-primary text-sm font-bold active:scale-95 transition-transform">
                        Withdraw
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activity Feed */}
              <section className="md:col-span-12 mt-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-headline font-bold text-white">
                    Atmospheric Pulse
                  </h2>
                  <Link href="/dashboard/history" className="text-primary text-sm font-bold hover:underline">
                    View All Activities
                  </Link>
                </div>

                <div className="space-y-4">
                  {ACTIVITY.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.accentColor === "tertiary"
                              ? "bg-tertiary/10 text-tertiary"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {item.icon === "autorenew" ? (
                            <IconAutorenew size={20} />
                          ) : (
                            <IconPayments size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-xs text-on-surface-variant">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${item.value ? "text-tertiary" : "text-white"}`}>
                          {item.value || item.status}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {item.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
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


