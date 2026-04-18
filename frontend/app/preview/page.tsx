"use client";

import Link from "next/link";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import AmbientBackground from "@/app/components/ambient-background";
import {
  IconMagicButton,
  IconSwapHoriz,
  IconAccountBalance,
  IconVerifiedUser,
  IconBolt,
  IconLocalAtm,
} from "@/app/components/icons";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GOALS } from "@/app/lib/constants";

export default function PreviewPage() {
  const { state } = useGlobalState();
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!state.amount || state.amount <= 0) {
      router.push("/amount");
    }
  }, [state.amount, router]);

  const walletAddress = publicKey ? publicKey.toString() : "Not Connected";
  const displayAddress = publicKey ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "0x00...00";
  
  const selectedGoal = GOALS.find(g => g.id === state.goal) || GOALS[0];

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto relative">
        <AmbientBackground />

        <section className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary uppercase tracking-[0.2em] font-bold text-xs">
              <IconMagicButton size={16} />
              Automated Intelligence
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold font-headline tracking-tighter leading-tight bg-gradient-to-r from-on-surface via-primary to-secondary bg-clip-text text-transparent">
              Smart Strategy Preview
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
              AutoFi has analyzed liquidity depth and yield curves to construct
              the most efficient path for your capital.
            </p>
          </div>

          {/* Bento Preview Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Execution Flow */}
            <div className="md:col-span-8 bg-surface-container-low rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
              {/* Scan Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-1/2 -translate-y-full group-hover:translate-y-[200%] transition-transform duration-[3000ms] pointer-events-none" />

              <h3 className="text-on-surface-variant font-label text-sm uppercase tracking-widest mb-8">
                Proposed Execution Path
              </h3>

              <div className="flex flex-col gap-8 relative">
                {/* Step 1 */}
                <div className="flex gap-6 items-start relative">
                  <div className="z-10 bg-surface-container-highest p-3 rounded-xl ring-1 ring-outline-variant/20 shadow-lg">
                    <IconSwapHoriz size={24} className="text-primary" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-on-surface font-bold text-xl">
                      We will: Swap {state.amount || "0.00"} USDC to Target Asset
                    </span>
                    <span className="text-on-surface-variant text-sm">
                      Optimal route found via Jupiter Aggregator (0.01% slippage)
                    </span>
                  </div>
                  {/* Connector Line */}
                  <div className="absolute left-6 top-14 bottom-[-2rem] w-[2px] bg-gradient-to-b from-primary/30 to-transparent" />
                </div>

                {/* Step 2 */}
                <div className="flex gap-6 items-start relative pt-4">
                  <div className="z-10 bg-surface-container-highest p-3 rounded-xl ring-1 ring-outline-variant/20 shadow-lg">
                    <IconAccountBalance size={24} className="text-secondary" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-on-surface font-bold text-xl">
                      We will: Deposit into lending protocol
                    </span>
                    <span className="text-on-surface-variant text-sm">
                      Collateralizing USDC in Solend Main Pool
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Star */}
              <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 0L105.5 94.5L200 100L105.5 105.5L100 200L94.5 105.5L0 100L94.5 94.5L100 0Z"
                    fill="currentColor"
                    className="text-primary"
                  />
                </svg>
              </div>
            </div>

            {/* Metrics Card */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-container-highest rounded-2xl p-8 flex flex-col justify-between items-start h-full ring-1 ring-white/5 relative overflow-hidden">
                <div className="flex flex-col gap-2">
                  <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
                    Yield Optimization
                  </span>
                  <div className="text-5xl font-extrabold tracking-tighter text-primary font-headline">
                    {selectedGoal.apy}
                  </div>
                  <span className="text-tertiary font-bold text-sm">
                    Estimated APY
                  </span>
                </div>
                <div className="mt-8 flex flex-col gap-4 w-full">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Risk Level</span>
                    <span className="text-secondary font-bold">{selectedGoal.risk}</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-low rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-secondary w-2/3 h-full" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-on-surface-variant">Confidence Score</span>
                    <span className="text-primary font-bold">{selectedGoal.confidence}</span>
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[40px] rounded-full" />
              </div>
            </div>

            {/* Info Badges Row */}
            <div className="md:col-span-12 grid md:grid-cols-3 gap-6">
              {[
                { icon: <IconVerifiedUser size={20} />, title: "Smart Audited", desc: "Verified secure protocol" },
                { icon: <IconBolt size={20} />, title: "Instant Setup", desc: "~12 seconds execution" },
                { icon: <IconLocalAtm size={20} />, title: "Zero Fee Intro", desc: "Protocol fees waived" },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className="bg-surface-container/50 rounded-xl p-6 flex items-center gap-4 group hover:bg-surface-variant transition-colors"
                >
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">
                    {badge.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-on-surface font-bold text-sm">
                      {badge.title}
                    </span>
                    <span className="text-on-surface-variant text-xs">
                      {badge.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action Area */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-outline-variant/10">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface font-bold text-sm">
                  Connected Wallet
                </span>
                <span className="text-on-surface-variant text-xs font-mono">
                  {displayAddress}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center w-full md:w-auto">
              <Link
                href="/amount"
                className="flex-1 md:flex-none px-8 py-4 text-on-surface font-bold hover:bg-surface-variant rounded-full transition-colors text-center"
              >
                Back to Edit
              </Link>
              <Link
                href="/execute"
                className="flex-1 md:flex-none px-12 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-lg rounded-full shadow-[0_0_32px_rgba(163,166,255,0.3)] hover:shadow-[0_0_48px_rgba(163,166,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 text-center"
              >
                Confirm &amp; Execute
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}


