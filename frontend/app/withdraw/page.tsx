"use client";

import { useState, useEffect, Suspense } from "react";
import WalletGuard from "@/app/components/wallet-guard";
import Link from "next/link";
import { IconArrowForward, IconTune, IconBolt, IconLocalAtm, IconCheckCircle } from "@/app/components/icons";
import AmbientBackground from "@/app/components/ambient-background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { getVaults, removeVault, updateVaultAmount, addTransaction, calculateGrowth, type Vault } from "@/app/lib/storage";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useGlobalState } from "@/app/lib/GlobalStateContext";

function WithdrawContent() {
  const [localAmount, setLocalAmount] = useState("");
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

  // Show the full vault value (principal + accrued interest) as available balance.
  // This matches what the dashboard displays and is what the user actually receives.
  // No double-counting risk: the execute page uses an inverse-interest formula
  // (see execute/page.tsx lines 161-180) that adjusts the on-chain withdrawal amount
  // so the smart contract's interest addition results in exactly the requested value.
  const maxBalance = selectedVault ? calculateGrowth(selectedVault).currentValue : 0;
  const numericAmount = parseFloat(localAmount) || 0;
  
  const estGas = numericAmount > 0 ? 0.000005 : 0;
  const receiveAmount = numericAmount > 0 ? (numericAmount - estGas) : 0;

  const setPercentage = (pct: number) => {
    const value = (maxBalance * pct) / 100;
    const roundedDown = Math.floor(value * 1e6) / 1e6;
    setLocalAmount(roundedDown.toString());
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

    setGlobalAmount(numericAmount);
    const isFull = numericAmount >= maxBalance * 0.999;
    router.push(`/execute?action=withdraw&vaultId=${selectedVault.id}&isFull=${isFull}&strategyName=${encodeURIComponent(selectedVault.strategyName)}&token=${selectedVault.token}`);
  };

  if (vaults.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
        <Navbar hideNavLinks />
        <AmbientBackground blobs={[{ color: "primary", position: "center", size: "lg" }]} />
        <div className="relative z-10 text-center">
          <h1 className="font-headline text-3xl font-extrabold text-white mb-4">No Active Vaults</h1>
          <p className="text-on-surface-variant text-sm mb-6">You need an active strategy before you can withdraw.</p>
          <Link href="/strategy" className="px-8 py-3.5 md:px-10 md:py-4 bg-gradient-to-r from-primary to-primary-dim text-on-primary text-[15px] md:text-base font-bold rounded-full">
            Select a Strategy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden relative">
      <Navbar hideNavLinks />
      <AmbientBackground
        blobs={[
          { color: "secondary", position: "top-left", size: "sm" },
          { color: "primary", position: "bottom-right", size: "lg" },
        ]}
      />

      <main className="flex-1 flex flex-col items-center justify-start w-full max-w-xl px-4 md:px-6 relative z-10 pt-20 md:pt-24 pb-4">
        <div className="w-full flex justify-start mb-10">
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

        {/* Header */}
        <header className="text-center mb-2">
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter mb-1">
            Withdraw Funds
          </h1>
          <p className="font-body text-on-surface-variant text-sm max-w-sm mx-auto">
            Specify the SOL you wish to withdraw back to your wallet.
          </p>
        </header>

        {/* Main Input Canvas - Identical to Amount */}
        <div className="w-full bg-surface-container-low rounded-3xl p-3 sm:p-4 shadow-[0_0_64px_rgba(99,102,241,0.06)] relative overflow-hidden">
          
          {/* Vault Balance Display - Replaced Wallet Balance with Vault Balance */}
          <div className="flex flex-col gap-1 mb-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5 ml-1">
              Your Vault Balance
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 ring-1 ring-primary/50 border border-transparent">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-headline font-bold text-white text-sm">
                    {selectedVault?.strategyName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                  </div>
                  <div className="font-label text-[10px] text-on-surface-variant">Active Strategy</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right pr-1">
                <div>
                  <div className="font-headline font-bold text-white text-xs">
                    {maxBalance.toFixed(6)} SOL
                  </div>
                  <div className="font-label text-[10px] text-on-surface-variant uppercase">
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Large Numeric Input - Identical to Amount */}
          <div className="relative flex flex-col items-center py-1">
            <div className="absolute top-0 right-0 py-0.5 px-3 bg-surface-container-highest rounded-full text-xs font-bold text-primary-dim uppercase tracking-widest font-headline">
              Max: {maxBalance.toFixed(6)} SOL
            </div>

            <input
              type="number"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent border-none text-center font-headline text-5xl md:text-6xl font-black tracking-tighter text-white focus:ring-0 focus:outline-none placeholder:text-surface-variant placeholder:opacity-50 mt-1"
            />
            <div className="font-headline text-base font-bold text-primary mb-1 tracking-widest uppercase">
              SOL
            </div>
          </div>

          {/* Quick Amount Ratios - Identical to Amount */}
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

          {/* Fee & Receipt Details - Styled to match current aesthetics, NO HRs */}
          <div className="mt-6 bg-surface-container-highest/30 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Network Fees</span>
              <span className="text-xs font-bold text-white font-headline">{estGas.toFixed(6)} SOL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">You Will Receive</span>
              <span className="text-xs font-bold text-primary font-headline">
                {receiveAmount > 0 ? receiveAmount.toFixed(6) : "0.000000"} SOL
              </span>
            </div>
          </div>

          {/* Primary Action Button - Same as Amount */}
          <div className="w-full mt-4">
            <button
              onClick={handleWithdraw}
              disabled={numericAmount <= 0 || numericAmount > maxBalance}
              className="w-full h-14 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-body font-bold text-base hover:shadow-[0_0_32px_rgba(163,166,255,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function WithdrawPage() {
  return (
    <WalletGuard>
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <WithdrawContent />
    </Suspense>
    </WalletGuard>
  );
}
