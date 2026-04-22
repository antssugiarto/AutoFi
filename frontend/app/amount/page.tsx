"use client";

import { useState } from "react";
import Link from "next/link";
import { AutoFiLogo, IconClose, IconArrowForward, IconVerifiedUser, IconCheckCircle, IconTune } from "@/app/components/icons";
import AmbientBackground from "@/app/components/ambient-background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import SettingsModal from "@/app/components/settings-modal";
import { TOKENS } from "@/app/lib/constants";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";

export default function InvestPage() {
  const [selectedToken, setSelectedToken] = useState(TOKENS[1]); // Default USDC
  const [localAmount, setLocalAmount] = useState("");
  const { setAmount, state } = useGlobalState();
  const router = useRouter();
  const { publicKey, disconnect } = useWallet();
  
  const walletAddress = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : null;

  const maxBalance = selectedToken.balance;
  const numericAmount = parseFloat(localAmount) || 0;
  const usdValue = (numericAmount * selectedToken.usdPrice).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const setPercentage = (pct: number) => {
    const value = (maxBalance * pct) / 100;
    setLocalAmount(value.toFixed(2));
    if (pct === 100) {
      toast.success("Amount set to Max balance");
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center overflow-hidden relative">
        {/* Minimal Nav */}
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
              Specify the assets you wish to deploy.
            </p>
          </header>

          {/* Main Input Canvas */}
          <div className="w-full bg-surface-container-low rounded-3xl p-3 sm:p-4 shadow-[0_0_64px_rgba(99,102,241,0.06)] relative overflow-hidden">
            {/* Wallet Assets Selection */}
            <div className="flex flex-col gap-1 mb-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">
                Select Asset From Phantom
              </label>
              <div className="flex flex-col gap-3">
                {TOKENS.map((token) => {
                  const isSelected = selectedToken.symbol === token.symbol;
                  const tokenUsdValue = (token.balance * token.usdPrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                  return (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        setSelectedToken(token);
                        setLocalAmount(""); // Reset amount when switching tokens
                      }}
                      className={`group flex items-center justify-between p-2 rounded-xl transition-all duration-300 text-left active:scale-95 ${
                        isSelected
                          ? "bg-primary/10 ring-1 ring-primary/50 border border-transparent shadow-[0_0_20px_rgba(163,166,255,0.05)]"
                          : "bg-surface-container-highest border border-outline-variant/10 hover:bg-surface-bright"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Token Logo */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-xs shadow-inner"
                          style={{ backgroundColor: token.logoColor }}
                        >
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-headline font-bold text-white text-sm">
                            {token.symbol}
                          </div>
                          <div className="font-label text-[10px] text-on-surface-variant">
                            {token.name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-mono font-bold text-white text-xs">
                            {token.balance.toLocaleString()} {token.symbol}
                          </div>
                          <div className="font-label text-[10px] text-on-surface-variant">
                            ≈ ${tokenUsdValue}
                          </div>
                        </div>
                        {isSelected ? (
                          <IconCheckCircle size={22} className="text-primary drop-shadow-[0_0_8px_rgba(163,166,255,0.5)]" />
                        ) : (
                          <div className="w-[22px] h-[22px] rounded-full border-2 border-outline-variant/30 group-hover:border-outline-variant/50 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Large Numeric Input */}
            <div className="relative flex flex-col items-center py-2">
              <div className="absolute top-0 right-0 py-0.5 px-3 bg-surface-container-highest rounded-full text-[10px] font-bold text-primary-dim uppercase tracking-widest">
                Max: {maxBalance.toLocaleString()} {selectedToken.symbol}
              </div>
              
              <input
                type="number"
                value={localAmount}
                onChange={(e) => setLocalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent border-none text-center font-headline text-6xl md:text-7xl font-black tracking-tighter text-white focus:ring-0 focus:outline-none placeholder:text-surface-variant placeholder:opacity-50 mt-1"
              />
              <div className="font-headline text-lg font-bold text-primary mt-1 mb-1 tracking-widest uppercase">
                {selectedToken.symbol}
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
                  className="px-4 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-label text-xs hover:bg-surface-bright transition-colors active:scale-90"
                >
                  {pct}%
                </button>
              ))}
              <button
                onClick={() => setPercentage(100)}
                className="px-4 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-label text-xs hover:bg-surface-bright transition-colors active:scale-90"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Primary Action CTA */}
          <div className="w-full mt-3 flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                if (numericAmount <= 0) {
                  toast.error("Please enter an amount first!");
                  return;
                }
                if (numericAmount > maxBalance) {
                  toast.error("Amount exceeds your wallet balance!");
                  return;
                }
                setAmount(numericAmount);
                router.push("/preview");
              }}
              className="w-full h-14 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-body font-bold text-base hover:shadow-[0_0_32px_rgba(163,166,255,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              Review Strategy
              <IconArrowForward size={18} />
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


