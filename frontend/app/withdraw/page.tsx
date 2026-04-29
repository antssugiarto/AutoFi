"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AutoFiLogo, IconClose, IconArrowForward, IconTune, IconBolt, IconLocalAtm } from "@/app/components/icons";
import AmbientBackground from "@/app/components/ambient-background";
import Footer from "@/app/components/footer";
import { getVaults, removeVault, updateVaultAmount, addTransaction, calculateGrowth, type Vault } from "@/app/lib/storage";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useGlobalState } from "@/app/lib/GlobalStateContext";

function WithdrawContent() {
  const [amount, setAmount] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAmount: setGlobalAmount } = useGlobalState();
  const targetId = searchParams.get("id");

  useEffect(() => {
    let loaded = getVaults();
    if (targetId) {
      loaded = loaded.filter(v => v.id === targetId);
    }
    setVaults(loaded);
    if (loaded.length > 0) setSelectedVault(loaded[0]);
  }, [targetId]);

  const vaultGrowth = selectedVault ? calculateGrowth(selectedVault) : null;
  const maxBalance = selectedVault ? selectedVault.amount : 0;
  const numericAmount = parseFloat(amount) || 0;
  
  // Calculate proportional profit based on how much principal is being withdrawn
  const proportionalProfit = selectedVault && numericAmount > 0 
    ? (numericAmount / selectedVault.amount) * (vaultGrowth?.profit || 0)
    : 0;
    
  const estGas = numericAmount > 0 ? 0.000005 : 0; // Realistic Solana fixed fee
  const receiveAmount = numericAmount + proportionalProfit - estGas;

  const setPercentage = (pct: number) => {
    const value = (maxBalance * pct) / 100;
    // Round down to 6 decimal places to prevent exceeding maxBalance
    const roundedDown = Math.floor(value * 1e6) / 1e6;
    setAmount(roundedDown.toString());
  };

  const handleWithdraw = () => {
    if (!selectedVault) {
      toast.error("No vault selected");
      return;
    }
    if (numericAmount <= 0) {
      toast.error("Enter an amount first");
      return;
    }
    if (numericAmount > maxBalance) {
      toast.error("Amount exceeds vault balance");
      return;
    }

    // Pass amount to execute page via global state
    setGlobalAmount(numericAmount);
    
    // Pass context via URL so execute page can mutate state ONLY on success
    const isFull = numericAmount >= maxBalance * 0.999;
    router.push(`/execute?action=withdraw&vaultId=${selectedVault.id}&isFull=${isFull}&strategyName=${encodeURIComponent(selectedVault.strategyName)}&token=${selectedVault.token}`);
  };

  if (vaults.length === 0) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
          <AmbientBackground blobs={[{ color: "primary", position: "center", size: "lg" }]} />
          <div className="relative z-10 text-center">
            <h1 className="font-headline text-3xl font-extrabold text-white mb-4">No Active Vaults</h1>
            <p className="text-on-surface-variant text-sm mb-6">You need an active strategy before you can withdraw.</p>
            <Link href="/strategy" className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dim text-white text-sm font-bold rounded-full">
              Select a Strategy
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center overflow-hidden relative">
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 max-w-[1440px] mx-auto bg-surface/80 backdrop-blur-xl">
          <Link href="/"><AutoFiLogo /></Link>
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition-all duration-300"
          >
            <IconClose size={20} />
          </Link>
        </nav>

        <AmbientBackground
          blobs={[
            { color: "primary", position: "top-left", size: "md" },
            { color: "tertiary", position: "bottom-right", size: "lg" },
          ]}
        />

        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-xl px-6 relative z-10 pt-24 pb-4">
          <div className="w-full flex justify-start mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
          </div>

          <header className="text-center mb-2">
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter mb-1 text-white">
              Withdraw Funds
            </h1>
            <p className="font-body text-on-surface-variant text-sm max-w-sm mx-auto">
              Select the vault and amount you want to withdraw.
            </p>
          </header>

          <div className="w-full bg-surface-container-low rounded-3xl p-3 sm:p-4 shadow-[0_0_64px_rgba(255,110,132,0.06)] relative overflow-hidden">
            {/* Vault Selector */}
            <div className="flex flex-col gap-1 mb-2 relative z-30">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">
                From Strategy
              </label>
              <button
                onClick={() => vaults.length > 1 && setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full p-3 rounded-xl bg-primary/10 ring-1 ring-primary/50 border border-transparent ${vaults.length > 1 ? "hover:bg-primary/20 cursor-pointer" : "cursor-default"} transition-colors flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-xs shadow-inner bg-primary">
                    <IconBolt size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-headline font-bold text-white text-sm capitalize">{selectedVault?.strategyName || "Select Vault"}</div>
                    <div className="font-label text-[10px] text-on-surface-variant capitalize">{selectedVault?.risk || ""} risk · {selectedVault?.steps.length || 0} steps</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="font-bold text-white text-sm">{(maxBalance + (vaultGrowth?.profit || 0)).toFixed(6)} SOL</div>
                    <div className="text-[10px] text-on-surface-variant">Available (incl. Yield)</div>
                  </div>
                  {vaults.length > 1 && (
                    <IconArrowForward size={14} className={`text-on-surface-variant transition-transform duration-300 ${isDropdownOpen ? "rotate-90" : ""}`} />
                  )}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl z-40 overflow-hidden">
                  {vaults.map((vault) => {
                    const g = calculateGrowth(vault);
                    return (
                      <button
                        key={vault.id}
                        onClick={() => { setSelectedVault(vault); setIsDropdownOpen(false); setAmount(""); }}
                        className="w-full p-3 text-left hover:bg-surface-variant transition-colors flex justify-between items-center border-b border-outline-variant/10 last:border-b-0"
                      >
                        <span className="font-bold text-white text-sm capitalize">{vault.strategyName}</span>
                        <span className="font-mono text-sm text-tertiary">{g.currentValue.toFixed(4)} SOL</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="relative flex flex-col items-center py-1 mt-2">
              <div className="absolute top-0 right-0 py-0.5 px-3 bg-surface-container-highest rounded-full text-[10px] font-bold text-primary-dim uppercase tracking-widest">
                Max: {maxBalance.toFixed(4)} SOL
              </div>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent border-none text-center font-headline text-5xl md:text-6xl font-black tracking-tighter text-white focus:ring-0 focus:outline-none placeholder:text-surface-variant placeholder:opacity-50 mt-1"
              />
              <div className="font-headline text-base font-bold text-primary mb-1 tracking-widest uppercase">
                SOL
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-2">
              {[25, 50, 75].map((pct) => (
                <button key={pct} onClick={() => setPercentage(pct)} className="px-4 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-label text-xs hover:bg-surface-bright transition-colors active:scale-90">
                  {pct}%
                </button>
              ))}
              <button onClick={() => setPercentage(100)} className="px-4 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-label text-xs hover:bg-surface-bright transition-colors active:scale-90">
                MAX
              </button>
            </div>

            {numericAmount > 0 && (
              <div className="mt-3 bg-surface-container-highest/50 rounded-xl p-3 space-y-2 border border-outline-variant/10">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1.5"><IconBolt size={12}/> Network Fees (Est.)</span>
                  <span className="text-white font-mono">{estGas.toFixed(6)} SOL</span>
                </div>
                <div className="h-px bg-outline-variant/20 w-full" />
                  <div className="flex justify-between items-center text-sm font-bold mt-4 pt-4 border-t border-outline-variant/30">
                    <span className="text-white">You will receive (est.)</span>
                    <span className="text-primary text-xl">
                      {receiveAmount > 0 ? receiveAmount.toFixed(6) : "0.000000"} SOL
                    </span>
                  </div>
            )}
          </div>

          <div className="w-full mt-3 flex flex-col items-center gap-1.5">
            <button
              onClick={handleWithdraw}
              disabled={numericAmount <= 0 || numericAmount > maxBalance}
              className="w-full h-14 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-body font-bold text-base hover:shadow-[0_0_32px_rgba(163,166,255,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              Initiate Withdrawal
            </button>
            <p className="font-label text-xs text-on-surface-variant flex items-center gap-2">
              <IconLocalAtm size={14} />
              Funds will be routed back to your connected wallet
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default function WithdrawPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <WithdrawContent />
    </Suspense>
  );
}
