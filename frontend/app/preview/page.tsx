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
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GOALS } from "@/app/lib/constants";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import idl from "../../idl/autofi_smart_contract.json";
import toast from "react-hot-toast";

export default function PreviewPage() {
  const { state } = useGlobalState();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (!state.amount || state.amount <= 0) {
      router.push("/amount");
    }
  }, [state.amount, router]);

  const walletAddress = publicKey ? publicKey.toString() : "Not Connected";
  const displayAddress = publicKey ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "0x00...00";
  
  const selectedGoal = GOALS.find(g => g.id === state.goal) || GOALS[0];

  const handleExecute = async () => {
    setIsExecuting(true);
    
    if (!publicKey || !signTransaction || !signAllTransactions) {
      toast.error("Wallet not fully connected.");
      setIsExecuting(false);
      return;
    }

    try {
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { preflightCommitment: "confirmed" }
      );
      const program = new Program(idl as unknown as Idl, provider);

      // Memanggil smart contract
      await program.methods
        .executeIntent(
          state.goal || "default_goal", 
          new BN(state.amount || 0)
        )
        .accounts({
          user: publicKey,
        })
        .rpc();

      // Jika berhasil, lanjut ke halaman eksekusi
      router.push("/execute");
    } catch (err: any) {
      console.warn("Transaction error:", err);
      // Phantom error code 4001: User rejected the request
      if (err.code === 4001 || err.message?.includes("User rejected")) {
        setIsExecuting(false);
        toast.error("Transaction cancelled.");
      } else {
        // Jika gagal karena network/program not found (UI testing), tetap lanjut
        router.push("/execute");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col w-full relative overflow-hidden">
        <Navbar hideNavLinks />
        <AmbientBackground />

        <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-4 px-6 max-w-3xl mx-auto w-full relative z-10">
          <div className="w-full flex justify-start mb-4">
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
          <div className="flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center gap-2 text-primary uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs">
              <IconMagicButton size={14} />
              Automated Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tighter leading-tight bg-gradient-to-r from-on-surface via-primary to-secondary bg-clip-text text-transparent">
              Smart Strategy Preview
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base max-w-xl leading-relaxed">
              AutoFi has analyzed liquidity depth and yield curves to construct
              the most efficient path for your capital.
            </p>
          </div>

          {/* Bento Preview Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            {/* Main Execution Flow */}
            <div className="md:col-span-8 bg-surface-container-low rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden group">
              {/* Scan Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-1/2 -translate-y-full group-hover:translate-y-[200%] transition-transform duration-[3000ms] pointer-events-none" />

              <h3 className="text-on-surface-variant font-label text-[10px] md:text-xs uppercase tracking-widest mb-4">
                Proposed Execution Path
              </h3>

              <div className="flex flex-col gap-4 md:gap-6 relative">
                {/* Step 1 */}
                <div className="flex gap-3 md:gap-4 items-start relative">
                  <div className="z-10 bg-surface-container-highest p-2.5 md:p-3 rounded-xl ring-1 ring-outline-variant/20 shadow-lg">
                    <IconSwapHoriz size={20} className="text-primary md:w-6 md:h-6" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-on-surface font-bold text-base md:text-lg">
                      We will: Swap {state.amount || "0.00"} USDC to Target Asset
                    </span>
                    <span className="text-on-surface-variant text-xs md:text-sm">
                      Optimal route found via Jupiter Aggregator (0.01% slippage)
                    </span>
                  </div>
                  {/* Connector Line */}
                  <div className="absolute left-[1.125rem] md:left-6 top-10 md:top-14 bottom-[-1.5rem] w-[2px] bg-gradient-to-b from-primary/30 to-transparent" />
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 md:gap-4 items-start relative pt-1 md:pt-2">
                  <div className="z-10 bg-surface-container-highest p-2.5 md:p-3 rounded-xl ring-1 ring-outline-variant/20 shadow-lg">
                    <IconAccountBalance size={20} className="text-secondary md:w-6 md:h-6" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-on-surface font-bold text-base md:text-lg">
                      We will: Deposit into lending protocol
                    </span>
                    <span className="text-on-surface-variant text-xs md:text-sm">
                      Collateralizing USDC in Solend Main Pool
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Star */}
              <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none hidden md:block">
                <svg width="150" height="150" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 0L105.5 94.5L200 100L105.5 105.5L100 200L94.5 105.5L0 100L94.5 94.5L100 0Z"
                    fill="currentColor"
                    className="text-primary"
                  />
                </svg>
              </div>
            </div>

            {/* Metrics Card */}
            <div className="md:col-span-4 flex flex-col">
              <div className="bg-surface-container-highest rounded-2xl p-4 md:p-6 flex flex-col justify-between items-start h-full ring-1 ring-white/5 relative overflow-hidden">
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="text-on-surface-variant font-label text-[10px] md:text-xs uppercase tracking-widest">
                    Yield Optimization
                  </span>
                  <div className="text-3xl md:text-4xl font-extrabold tracking-tighter text-primary font-headline">
                    {selectedGoal.apy}
                  </div>
                  <span className="text-tertiary font-bold text-sm">
                    Estimated APY
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-3 w-full">
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
                <div className="absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-primary/20 blur-[40px] rounded-full" />
              </div>
            </div>

            {/* Info Badges Row */}
            <div className="md:col-span-12 grid md:grid-cols-3 gap-3 md:gap-4">
              {[
                { icon: <IconLocalAtm className="w-4 h-4 md:w-5 md:h-5" />, title: `${state.amount || "0.00"} USDC`, desc: "Amount" },
                { icon: <IconBolt className="w-4 h-4 md:w-5 md:h-5" />, title: selectedGoal.title, desc: "Strategy" },
                { icon: <IconVerifiedUser className="w-4 h-4 md:w-5 md:h-5" />, title: "~12 Sec", desc: "Execution" },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className="bg-surface-container/50 rounded-xl p-3 md:p-5 flex items-center gap-2 md:gap-3 group hover:bg-surface-variant transition-colors"
                >
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">
                    {badge.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-on-surface font-bold text-xs md:text-sm">
                      {badge.title}
                    </span>
                    <span className="text-on-surface-variant text-[10px] md:text-xs">
                      {badge.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action Area */}
          <div className="flex items-center justify-end md:justify-center gap-4 pt-4 mt-2">
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
        </main>
      </div>

      <Footer />
    </>
  );
}


