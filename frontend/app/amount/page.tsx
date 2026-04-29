"use client";

import { useState, useEffect } from "react";
import { IconArrowForward, IconVerifiedUser, IconCheckCircle } from "@/app/components/icons";
import AmbientBackground from "@/app/components/ambient-background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { submitIntent } from "@/app/lib/api";
import { mapGoalToStrategy } from "@/app/lib/goalMapping";
import { getSolBalance } from "@/app/lib/solana";

export default function InvestPage() {
  const [localAmount, setLocalAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(true);
  const { setAmount, setBacktestResult, setStrategyResult, state } = useGlobalState();
  const router = useRouter();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  // Fetch real SOL balance on mount
  useEffect(() => {
    async function fetchBalance() {
      if (publicKey && connection) {
        setIsFetchingBalance(true);
        const balance = await getSolBalance(connection, publicKey);
        setSolBalance(balance);
        setIsFetchingBalance(false);
      } else {
        setSolBalance(0);
        setIsFetchingBalance(false);
      }
    }
    fetchBalance();
  }, [publicKey, connection]);

  const maxBalance = solBalance ?? 0;
  const numericAmount = parseFloat(localAmount) || 0;
  // SOL price estimation (could be fetched from API in production)
  const solUsdPrice = 178.5;
  const usdValue = (numericAmount * solUsdPrice).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const setPercentage = (pct: number) => {
    let value = (maxBalance * pct) / 100;
    if (pct === 100) {
      // Leave 0.005 SOL for transaction fees to prevent WalletSendTransactionError
      value = Math.max(0, maxBalance - 0.005);
    }
    // Always round down to 4 decimal places to prevent exceeding balance due to rounding
    const roundedDown = Math.floor(value * 10000) / 10000;
    setLocalAmount(roundedDown.toString());
    if (pct === 100) {
      toast.success("Amount set to Max (reserved 0.005 SOL for gas)");
    }
  };

  const handleReviewStrategy = async () => {
    if (numericAmount <= 0) {
      toast.error("Please enter an amount first!");
      return;
    }
    if (numericAmount > maxBalance) {
      toast.error("Amount exceeds your wallet balance!");
      return;
    }
    if (!publicKey) {
      toast.error("Wallet not connected!");
      return;
    }

    setIsLoading(true);
    setAmount(numericAmount);

    try {
      const response = await submitIntent({
        wallet: publicKey.toBase58(),
        amount: numericAmount,
        token: "SOL",
        strategy: mapGoalToStrategy(state.goal),
      });

      setStrategyResult(response.strategy);
      setBacktestResult(response.backtest);
      router.push("/preview");
    } catch (err: any) {
      console.error("Intent API error:", err);
      toast.error(err.message || "Failed to analyze strategy. Please try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="fixed inset-0 z-[100] flex items-center justify-center bg-surface animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
      </main>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center overflow-hidden relative">
        <Navbar hideNavLinks />
        <AmbientBackground
          blobs={[
            { color: "secondary", position: "top-left", size: "sm" },
            { color: "primary", position: "bottom-right", size: "lg" },
          ]}
        />

        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-xl px-6 relative z-10 pt-24 pb-4">
          <div className="w-full flex justify-start mb-6">
            <button
              onClick={() => router.push('/strategy')}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
          </div>

          {/* Header */}
          <header className="text-center mb-2">
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter mb-1">
              Enter Amount
            </h1>
            <p className="font-body text-on-surface-variant text-sm max-w-sm mx-auto">
              Specify the SOL you wish to deploy.
            </p>
          </header>

          {/* Main Input Canvas */}
          <div className="w-full bg-surface-container-low rounded-3xl p-3 sm:p-4 shadow-[0_0_64px_rgba(99,102,241,0.06)] relative overflow-hidden">
            {/* Wallet Balance Display */}
            <div className="flex flex-col gap-1 mb-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">
                Your Wallet Balance
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 ring-1 ring-primary/50 border border-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-xs shadow-inner bg-[#9945FF]">
                    S
                  </div>
                  <div>
                    <div className="font-headline font-bold text-white text-sm">SOL</div>
                    <div className="font-label text-[10px] text-on-surface-variant">Solana Native</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    {isFetchingBalance ? (
                      <div className="font-mono font-bold text-white text-xs animate-pulse">Loading...</div>
                    ) : (
                      <>
                        <div className="font-mono font-bold text-white text-xs">
                          {maxBalance.toFixed(4)} SOL
                        </div>
                        <div className="font-label text-[10px] text-on-surface-variant">
                          ≈ ${(maxBalance * solUsdPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </>
                    )}
                  </div>
                  <IconCheckCircle size={22} className="text-primary drop-shadow-[0_0_8px_rgba(163,166,255,0.5)]" />
                </div>
              </div>
            </div>

            {/* Large Numeric Input */}
            <div className="relative flex flex-col items-center py-1">
              <div className="absolute top-0 right-0 py-0.5 px-3 bg-surface-container-highest rounded-full text-[10px] font-bold text-primary-dim uppercase tracking-widest">
                Max: {maxBalance.toFixed(4)} SOL
              </div>

              <input
                type="number"
                value={localAmount}
                onChange={(e) => setLocalAmount(e.target.value)}
                placeholder="0.00"
                disabled={isLoading || isFetchingBalance}
                className="w-full bg-transparent border-none text-center font-headline text-5xl md:text-6xl font-black tracking-tighter text-white focus:ring-0 focus:outline-none placeholder:text-surface-variant placeholder:opacity-50 mt-1 disabled:opacity-50"
              />
              <div className="font-headline text-base font-bold text-primary mb-1 tracking-widest uppercase">
                SOL
              </div>

              <div className="mt-1 font-body text-on-surface-variant text-sm flex items-center gap-2 bg-surface-container px-4 py-1.5 rounded-full border border-outline-variant/10">
                <span>{"≈"} ${usdValue} USD</span>
              </div>
            </div>

            {/* Quick Amount Ratios */}
            <div className="flex justify-center gap-2 mt-2">
              {[25, 50, 75].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setPercentage(pct)}
                  disabled={isLoading || isFetchingBalance}
                  className="px-4 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-label text-xs hover:bg-surface-bright transition-colors active:scale-90 disabled:opacity-50"
                >
                  {pct}%
                </button>
              ))}
              <button
                onClick={() => setPercentage(100)}
                disabled={isLoading || isFetchingBalance}
                className="px-4 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-label text-xs hover:bg-surface-bright transition-colors active:scale-90 disabled:opacity-50"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Primary Action CTA */}
          <div className="w-full mt-3 flex flex-col items-center gap-1.5">
            <button
              onClick={handleReviewStrategy}
              disabled={isLoading || isFetchingBalance}
              className="w-full h-14 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-body font-bold text-base hover:shadow-[0_0_32px_rgba(163,166,255,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Strategy...
                </>
              ) : (
                <>
                  Review Strategy
                </>
              )}
            </button>
            <p className="font-label text-xs text-on-surface-variant flex items-center gap-2">
              <IconVerifiedUser size={14} />
              Automated execution secured by AutoFi Engine
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
