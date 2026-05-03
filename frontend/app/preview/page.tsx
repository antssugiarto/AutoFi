"use client";

import Link from "next/link";
import WalletGuard from "@/app/components/wallet-guard";
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
  IconTrendingUp,
  IconShield,
  IconAutoAwesome,
} from "@/app/components/icons";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GOALS } from "@/app/lib/constants";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import idl from "../../idl/autofi_smart_contract.json";
import toast from "react-hot-toast";

/* ── Step icon mapping for backend strategy steps ── */
const STEP_ICONS: Record<string, typeof IconSwapHoriz> = {
  swap: IconSwapHoriz,
  stake: IconTrendingUp,
  lend: IconAccountBalance,
  borrow: IconBolt,
  default: IconAutoAwesome,
};

function getStepIcon(step: string) {
  const lower = step.toLowerCase();
  if (lower.includes("swap")) return STEP_ICONS.swap;
  if (lower.includes("stake")) return STEP_ICONS.stake;
  if (lower.includes("lend")) return STEP_ICONS.lend;
  if (lower.includes("borrow")) return STEP_ICONS.borrow;
  return STEP_ICONS.default;
}

const STEP_COLORS = ["text-primary", "text-secondary", "text-tertiary", "text-primary"];

/* ── Risk level color mapping ── */
function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case "low": return "text-tertiary";
    case "medium": return "text-secondary";
    case "high": return "text-error";
    default: return "text-on-surface-variant";
  }
}

/* ── Confidence bar color ── */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "from-tertiary to-primary";
  if (confidence >= 0.5) return "from-secondary to-primary";
  return "from-error to-secondary";
}

export default function PreviewPage() {
  const { state } = useGlobalState();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasBackendData = state.strategyResult && state.backtestResult;
  const [liveAPY, setLiveAPY] = useState<string>("");
  const [liveConfidence, setLiveConfidence] = useState<number>(0);

  useEffect(() => {
    if (hasBackendData) {
      // Add instant noise for the first render
      const noise = (Math.random() * 0.1 - 0.05);
      const initialAPY = (state.strategyResult!.expectedAPY + noise).toFixed(2);
      
      setLiveAPY(initialAPY);
      setLiveConfidence(state.backtestResult!.confidence);
    }
  }, [hasBackendData, state.strategyResult, state.backtestResult]);

  // Live Market Noise Effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasBackendData) {
        // Add tiny ±0.05% fluctuation to the display
        const noise = (Math.random() * 0.1 - 0.05);
        const currentBase = state.strategyResult!.expectedAPY;
        setLiveAPY((currentBase + noise).toFixed(2));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [hasBackendData, state.strategyResult]);


  useEffect(() => {
    if (!state.amount || state.amount <= 0) {
      router.push("/amount");
    }
  }, [state.amount, router]);

  if (!isMounted) return null;

  const walletAddress = publicKey ? publicKey.toString() : "Not Connected";
  const displayAddress = publicKey ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "0x00...00";
  
  const selectedGoal = GOALS.find(g => g.id === state.goal) || GOALS[0];

  // Use backend data if available, otherwise fallback to mock
  const strategyName = hasBackendData ? state.strategyResult!.name : selectedGoal.title;
  const strategySteps = hasBackendData ? state.strategyResult!.steps : ["swap SOL → USDC", "lend USDC"];
  const expectedAPYDisplay = hasBackendData ? `${liveAPY}%` : selectedGoal.apy;
  const risk = hasBackendData ? state.strategyResult!.risk : selectedGoal.risk;
  const confidenceDisplay = hasBackendData ? liveConfidence : 0.88;


  const handleExecute = () => {
    setIsExecuting(true);
    // Redirect to the execution page which handles the new smart contract logic
    router.push("/execute");
  };

  return (
    <WalletGuard>
    <>
    <div className="h-screen overflow-hidden flex flex-col w-full relative bg-surface">
      <div className="h-16 shrink-0 relative z-50">
        <Navbar hideNavLinks />
      </div>
      <AmbientBackground />

      <main className="flex-1 flex flex-col w-full relative z-10 overflow-y-auto pt-4 md:pt-8 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="w-full max-w-3xl mx-auto px-4 md:px-6 flex flex-col items-center justify-start">
          <div className="w-full flex justify-start mb-10">
            <button
              onClick={() => router.push('/amount')}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
          </div>

        <section className="flex flex-col gap-4 md:gap-6 w-full">
          {/* Header */}
          <header className="text-left max-w-xl">
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tighter mb-1 text-white">
              Strategy Preview
            </h1>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed">
              {hasBackendData
                ? `AutoFi engine selected "${strategyName}" strategy based on your intent.`
                : "AutoFi has analyzed liquidity depth and yield curves to construct the most efficient path for your capital."
              }
            </p>
          </header>
          
          {/* Info Badges Row (Top) */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { icon: <IconLocalAtm className="w-4 h-4 md:w-5 md:h-5" />, title: `${state.amount || "0.00"} ${hasBackendData ? "SOL" : "USDC"}`, desc: "Amount" },
              { icon: <IconBolt className="w-4 h-4 md:w-5 md:h-5" />, title: hasBackendData ? strategyName : selectedGoal.title, desc: "Strategy" },
            ].map((badge) => (
              <div
                key={badge.title}
                className="bg-surface-container-low rounded-xl p-3 md:p-5 flex items-center gap-2 md:gap-3 transition-colors border border-white/5 shadow-lg"
              >
                <span className="text-on-surface-variant transition-colors">
                  {badge.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-on-surface font-bold text-xs md:text-sm capitalize">
                    {badge.title}
                  </span>
                  <span className="text-on-surface-variant text-[10px] md:text-xs">
                    {badge.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bento Preview Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 -mt-1 md:-mt-2">
            {/* Main Execution Flow */}
            <div className="md:col-span-8 bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden group border border-white/5">

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconMagicButton size={16} className="text-primary" />
                  <h3 className="text-white font-bold font-label text-[10px] md:text-xs uppercase tracking-widest">
                    Proposed Execution Path
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:gap-5 relative">
                {strategySteps.map((step, index) => {
                  const StepIcon = getStepIcon(step);
                  const color = STEP_COLORS[index % STEP_COLORS.length];
                  const isLast = index === strategySteps.length - 1;

                  return (
                    <div key={index} className="flex gap-3 md:gap-4 items-start relative">
                      <div className={`z-10 bg-surface-container-highest p-2.5 md:p-3 rounded-xl ring-1 ring-outline-variant/20 shadow-lg`}>
                        <StepIcon size={20} className={`${color} md:w-6 md:h-6`} />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-on-surface font-bold text-base md:text-lg capitalize">
                          Step {index + 1}: {step}
                        </span>
                        <span className="text-on-surface-variant text-xs md:text-sm">
                          {index === 0 && state.amount ? `Deploying ${state.amount} ${hasBackendData ? "SOL" : "USDC"}` : "Automated via AutoFi Engine"}
                        </span>
                      </div>
                      {/* Connector Line */}
                      {!isLast && (
                        <div className="absolute left-[1.125rem] md:left-6 top-10 md:top-14 bottom-[-1rem] w-[2px] bg-gradient-to-b from-primary/30 to-transparent" />
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Metrics Card */}
            <div className="md:col-span-4 flex flex-col">
              <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-4 md:p-6 flex flex-col justify-between items-start h-full border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="flex flex-col gap-1 md:gap-2">
                  <div className="flex items-center gap-2">
                    <IconVerifiedUser size={14} className="text-tertiary" />
                    <span className="text-white font-bold font-label text-[10px] md:text-xs uppercase tracking-widest">
                      Yield Optimization
                    </span>
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold tracking-tighter text-primary font-headline">
                    {expectedAPYDisplay}
                  </div>
                  <span className="text-tertiary font-bold text-sm">
                    Expected APY
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-3 w-full">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Risk Level</span>
                    <span className={`font-bold capitalize ${getRiskColor(risk)}`}>{risk}</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-low rounded-full overflow-hidden">
                    <div className={`bg-gradient-to-r ${getConfidenceColor(confidenceDisplay)} h-full transition-all duration-1000`} style={{ width: `${Math.min(100, (risk.toLowerCase() === 'low' ? 33 : risk.toLowerCase() === 'medium' ? 66 : 100))}%` }} />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-on-surface-variant">Confidence</span>
                    <span className="text-primary font-bold">{(confidenceDisplay * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-low rounded-full overflow-hidden">
                    <div className={`bg-gradient-to-r ${getConfidenceColor(confidenceDisplay)} h-full transition-all duration-1000`} style={{ width: `${(confidenceDisplay * 100).toFixed(0)}%` }} />
                  </div>
                </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                BACKTEST RESULTS — Multi-Window Analysis
               ═══════════════════════════════════════════ */}
            {hasBackendData && state.backtestResult && (
              <div className="md:col-span-12 bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden border border-white/5">
                <div className="flex items-center gap-2 mb-5">
                  <IconTrendingUp size={18} className="text-tertiary" />
                  <h3 className="text-white font-bold font-label text-[10px] md:text-xs uppercase tracking-widest">
                    Backtest Results — Multi-Window Analysis
                  </h3>
                </div>

                {/* 3 Window Cards + Final Score */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Short Term */}
                  <div className="bg-surface-container-highest/30 rounded-xl p-4 border border-outline-variant/10 transition-all">
                    <div className="text-xs font-label text-on-surface-variant mb-2">
                      Short Term
                    </div>
                    <div className="text-2xl md:text-3xl font-headline font-extrabold text-primary tracking-tight">
                      {state.backtestResult.shortTermReturn >= 0 ? "+" : ""}{state.backtestResult.shortTermReturn.toFixed(4)}%
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1">7 Days</div>
                  </div>

                  {/* Mid Term */}
                  <div className="bg-surface-container-highest/30 rounded-xl p-4 border border-outline-variant/10 transition-all">
                    <div className="text-xs font-label text-on-surface-variant mb-2">
                      Mid Term
                    </div>
                    <div className="text-2xl md:text-3xl font-headline font-extrabold text-secondary tracking-tight">
                      {state.backtestResult.midTermReturn >= 0 ? "+" : ""}{state.backtestResult.midTermReturn.toFixed(4)}%
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1">30 Days</div>
                  </div>

                  {/* Long Term */}
                  <div className="bg-surface-container-highest/30 rounded-xl p-4 border border-outline-variant/10 transition-all">
                    <div className="text-xs font-label text-on-surface-variant mb-2">
                      Long Term
                    </div>
                    <div className="text-2xl md:text-3xl font-headline font-extrabold text-tertiary tracking-tight">
                      {state.backtestResult.longTermReturn >= 0 ? "+" : ""}{state.backtestResult.longTermReturn.toFixed(4)}%
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1">90 Days</div>
                  </div>

                  {/* Final Score */}
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 blur-2xl rounded-full" />
                    <div className="text-xs font-label text-on-surface-variant mb-2 relative z-10">
                      Composite Score
                    </div>
                    <div className="text-2xl md:text-3xl font-headline font-extrabold text-white tracking-tight relative z-10">
                      {state.backtestResult.finalScore.toFixed(4)}
                    </div>
                    <div className="text-xs text-primary font-bold mt-1 relative z-10">Weighted Average</div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Footer Action Area */}
          <div className="flex items-center justify-end md:justify-center gap-4 mt-0">
            {/* Action Buttons */}
            <div className="flex justify-center w-full">
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full md:w-auto md:min-w-[300px] px-8 py-3.5 md:px-12 md:py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-base md:text-lg rounded-full shadow-[0_0_32px_rgba(163,166,255,0.3)] hover:shadow-[0_0_48px_rgba(163,166,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 text-center disabled:opacity-50 disabled:pointer-events-none"
              >
                {isExecuting ? "Check Wallet..." : "Confirm & Execute"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
    </div>
  </>
  </WalletGuard>
);
}
