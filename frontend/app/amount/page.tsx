"use client";

import { useState } from "react";
import Link from "next/link";
import { AutoFiLogo, IconClose, IconArrowForward, IconVerifiedUser, IconCheckCircle, IconTune } from "@/app/components/icons";
import AmbientBackground from "@/app/components/ambient-background";
import Footer from "@/app/components/footer";
import SettingsModal from "@/app/components/settings-modal";
import { TOKENS } from "@/app/lib/constants";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function InvestPage() {
  const [selectedToken, setSelectedToken] = useState(TOKENS[1]); // Default USDC
  const [localAmount, setLocalAmount] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { setAmount, state } = useGlobalState();
  const router = useRouter();

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
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 max-w-[1440px] mx-auto bg-surface/80 backdrop-blur-xl">
          <Link href="/">
            <AutoFiLogo />
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-white transition-all duration-300 border border-outline-variant/10 hover:border-outline-variant/30"
            >
              <IconTune size={18} />
            </button>
            <Link
              href="/strategy"
              className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition-all duration-300"
            >
              <IconClose size={20} />
            </Link>
          </div>
        </nav>

        <AmbientBackground
          blobs={[
            { color: "secondary", position: "top-left", size: "sm" },
            { color: "primary", position: "bottom-right", size: "lg" },
          ]}
        />

        <main className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl px-6 relative z-10 pt-20">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter mb-4">
              Enter Amount
            </h1>
            <p className="font-body text-on-surface-variant text-lg max-w-md mx-auto">
              Specify the assets you wish to deploy into your automated vault.
            </p>
          </header>

          {/* Main Input Canvas */}
          <div className="w-full bg-surface-container-low rounded-[2rem] p-8 shadow-[0_0_64px_rgba(99,102,241,0.06)] relative overflow-hidden">
            {/* Token Selection */}
            <div className="flex flex-col gap-4 mb-10">
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                Select Token
              </label>
              <div className="grid grid-cols-2 gap-4">
                {TOKENS.map((token) => {
                  const isSelected = selectedToken.symbol === token.symbol;
                  return (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token)}
                      className={`group flex items-center gap-4 p-5 rounded-xl transition-all duration-300 text-left active:scale-95 ${
                        isSelected
                          ? "bg-surface-variant ring-2 ring-primary/40 border border-primary/20"
                          : "bg-surface-container-highest border border-outline-variant/10 hover:bg-surface-bright"
                      }`}
                    >
                      {/* Token Logo */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-sm"
                        style={{ backgroundColor: token.logoColor }}
                      >
                        {token.symbol.charAt(0)}
                      </div>
                      <div className="flex-grow">
                        <div className="font-headline font-bold text-white">
                          {token.symbol}
                        </div>
                        <div className="font-label text-xs text-on-surface-variant">
                          {token.name}
                        </div>
                      </div>
                      {isSelected && (
                        <IconCheckCircle size={18} className="text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Large Numeric Input */}
            <div className="relative flex flex-col items-center py-6">
              <div className="absolute top-0 right-0 py-1 px-3 bg-surface-container-highest rounded-full text-[10px] font-bold text-primary-dim uppercase tracking-widest">
                Max: {maxBalance.toLocaleString()}
              </div>
              <input
                type="number"
                value={localAmount}
                onChange={(e) => setLocalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent border-none text-center font-headline text-7xl md:text-8xl font-black tracking-tighter text-white focus:ring-0 focus:outline-none placeholder:text-surface-variant placeholder:opacity-50"
              />
              <div className="mt-4 font-body text-on-surface-variant text-sm flex items-center gap-2">
                <span>â‰ˆ ${usdValue} USD</span>
              </div>
            </div>

            {/* Quick Amount Ratios */}
            <div className="flex justify-center gap-3 mt-4">
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
          <div className="w-full mt-12 flex flex-col items-center gap-6">
            <button 
              onClick={() => {
                setAmount(numericAmount);
                router.push("/preview");
              }}
              className="w-full h-16 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-body font-bold text-lg hover:shadow-[0_0_32px_rgba(163,166,255,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              Review Strategy
              <IconArrowForward size={20} />
            </button>
            <p className="font-label text-xs text-on-surface-variant flex items-center gap-2">
              <IconVerifiedUser size={14} />
              Automated execution secured by AutoFi Engine
            </p>
          </div>
        </main>

        <Footer className="mt-auto" />
        
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </div>
    </>
  );
}


