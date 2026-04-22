"use client";

import { useState } from "react";
import Link from "next/link";
import { AutoFiLogo, IconClose, IconArrowForward, IconTune, IconBolt, IconLocalAtm } from "@/app/components/icons";
import AmbientBackground from "@/app/components/ambient-background";
import Footer from "@/app/components/footer";
import SettingsModal from "@/app/components/settings-modal";
import { PORTFOLIO } from "@/app/lib/constants";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState({ id: "blue-chip", name: "The Blue-Chip Autopilot", balance: 24910.00 });

  const maxBalance = selectedVault.balance;
  const numericAmount = parseFloat(amount) || 0;
  
  // Simulated estimation
  const estGas = 0.0012 * numericAmount;
  const receiveAmount = numericAmount - estGas;

  const setPercentage = (pct: number) => {
    const value = (maxBalance * pct) / 100;
    setAmount(value.toFixed(2));
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center overflow-hidden relative">
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
              href="/dashboard"
              className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition-all duration-300"
            >
              <IconClose size={20} />
            </Link>
          </div>
        </nav>

        <AmbientBackground
          blobs={[
            { color: "primary", position: "top-left", size: "md" },
            { color: "tertiary", position: "bottom-right", size: "lg" },
          ]}
        />

        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-6 relative z-10 pt-20">
          <header className="text-center mb-12">
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter mb-4 text-white">
              Withdraw Funds
            </h1>
            <p className="font-body text-on-surface-variant text-lg max-w-md mx-auto">
              Select the amount you want to withdraw from your automated vault.
            </p>
          </header>

          <div className="w-full bg-surface-container-low rounded-[2rem] p-8 shadow-[0_0_64px_rgba(255,110,132,0.04)] relative overflow-hidden">
            {/* Asset Selection Dropdown */}
            <div className="flex flex-col gap-4 mb-10 relative">
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                From Strategy
              </label>
              
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-5 rounded-xl bg-surface-variant border border-outline-variant/20 hover:border-outline-variant/50 transition-colors flex items-center justify-between group"
              >
                <div className="text-left">
                  <div className="font-headline font-bold text-white text-lg">
                    {selectedVault.name}
                  </div>
                  <div className="font-label text-xs text-on-surface-variant">
                    Specific Vault Strategy
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-bold text-white">${selectedVault.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs text-on-surface-variant">Available</div>
                  </div>
                  <IconArrowForward size={16} className={`text-on-surface-variant transition-transform duration-300 ${isDropdownOpen ? "rotate-90" : ""}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {[
                    { id: "blue-chip", name: "The Blue-Chip Autopilot", balance: 24910.00 },
                    { id: "stablecoin", name: "Stablecoin Sanctuary", balance: 18000.00 },
                  ].map((vault) => (
                    <button
                      key={vault.id}
                      onClick={() => {
                        setSelectedVault(vault);
                        setIsDropdownOpen(false);
                        setAmount("");
                      }}
                      className="w-full p-4 text-left hover:bg-surface-variant transition-colors flex justify-between items-center border-b border-outline-variant/10 last:border-b-0"
                    >
                      <span className="font-bold text-white">{vault.name}</span>
                      <span className="font-mono text-sm text-tertiary">${vault.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="relative flex flex-col items-center py-6 border-b border-outline-variant/10">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent border-none text-center font-headline text-7xl md:text-8xl font-black tracking-tighter text-white focus:ring-0 focus:outline-none placeholder:text-surface-variant placeholder:opacity-50"
              />
              <div className="mt-4 font-body text-on-surface-variant text-sm font-bold">
                USD
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-8">
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

            {/* Estimation Details */}
            {numericAmount > 0 && (
              <div className="mt-8 bg-surface-container-highest/50 rounded-xl p-5 space-y-3 border border-outline-variant/10 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant flex items-center gap-2"><IconBolt size={14}/> Network Fees (Est.)</span>
                  <span className="text-white">${estGas.toFixed(2)}</span>
                </div>
                <div className="h-px bg-outline-variant/20 w-full" />
                <div className="flex justify-between">
                  <span className="text-on-surface-variant text-sm font-bold">You will receive</span>
                  <span className="text-tertiary font-bold">${receiveAmount > 0 ? receiveAmount.toFixed(2) : "0.00"} USDC</span>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="w-full mt-12 flex flex-col items-center gap-6">
            <Link href="/execute?action=withdraw" className="w-full">
              <button 
                disabled={numericAmount <= 0 || numericAmount > maxBalance}
                className="w-full h-16 rounded-full bg-surface-bright hover:bg-surface-variant border border-outline-variant/20 text-white font-body font-bold text-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
              >
                Initiate Withdrawal
                <IconArrowForward size={20} />
              </button>
            </Link>
            <p className="font-label text-xs text-on-surface-variant flex items-center gap-2">
              <IconLocalAtm size={14} />
              Funds will be routed back to your connected wallet
            </p>
          </div>
        </main>

      </div>
      <Footer />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}


