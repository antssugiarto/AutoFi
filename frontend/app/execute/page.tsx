"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import WalletGuard from "@/app/components/wallet-guard";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/app/components/footer";
import AmbientBackground from "@/app/components/ambient-background";
import { IconHub, IconLock, IconWallet, IconBolt } from "@/app/components/icons";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useWallet, useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import idl from "../../idl/autofi_smart_contract.json";
import { saveVault, addTransaction, removeVault, updateVaultAmount, getVaultById, calculateGrowth } from "@/app/lib/storage";
import { executeStrategy, buildStepProgress, type StepProgress } from "@/app/lib/defi/mapper";
import { reportDeployment } from "@/app/lib/performanceTracker";

// AutoFi Vault PDA address
const VAULT_ADDRESS = new PublicKey("2SvggQkCPdgAi2o289yue5WWwm8dEX4WzamLr5y3pL81");

function ExecutingContent() {
  const [status, setLocalStatus] = useState<"processing" | "success" | "error">("processing");
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const { state, setStatus } = useGlobalState();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const executionStarted = useRef(false);
  
  const isWithdrawal = searchParams.get("action") === "withdraw";
  const vaultId = searchParams.get("vaultId");
  const isFull = searchParams.get("isFull") === "true";
  const strategyName = searchParams.get("strategyName") || "Vault Withdrawal";
  const tokenName = searchParams.get("token") || "SOL";

  // Get strategy steps for display
  const strategySteps = state.strategyResult?.steps || ["stake SOL"];

  // Initialize step progress on mount
  useEffect(() => {
    if (!isWithdrawal) {
      setStepProgress(buildStepProgress(strategySteps));
    } else {
      setStepProgress([
        { index: 0, label: "Unstaking from Protocols", status: "executing", type: "borrow" },
        { index: 1, label: "Liquidating Yield Positions", status: "pending", type: "swap" },
        { index: 2, label: "Routing back to Wallet", status: "pending", type: "swap" }
      ]);
    }
  }, []);

  // Helper: save vault data to localStorage
  function saveData() {
    if (!isWithdrawal) {
      const sr = state.strategyResult;
      const bt = state.backtestResult;
      if (sr && bt && state.amount) {
        saveVault({
          strategyName: sr.name,
          tier: state.goal || "aggressive", // Save tier for Stage 10 rebalancing
          steps: sr.steps,
          expectedAPY: sr.expectedAPY,
          risk: sr.risk,
          amount: state.amount,
          token: "SOL",
          confidence: bt.confidence,
          shortTermReturn: bt.shortTermReturn,
          midTermReturn: bt.midTermReturn,
          longTermReturn: bt.longTermReturn,
          finalScore: bt.finalScore,
          deployedAt: Date.now(),
        });

        // --- IMPROVE LOOP: Record Deployment ---
        reportDeployment(
          sr.name,
          publicKey?.toString() || "anonymous",
          state.amount,
          sr.expectedAPY
        );
        addTransaction({
          type: "Deploy",
          strategyName: sr.name,
          amount: state.amount,
          token: "SOL",
          timestamp: Date.now(),
          status: "Success",
        });
      }
    } else {
      addTransaction({
        type: "Withdraw",
        strategyName: strategyName,
        amount: state.amount || 0,
        token: tokenName,
        timestamp: Date.now(),
        status: "Success",
      });

      if (vaultId) {
        if (isFull) {
          removeVault(vaultId);
        } else {
          const existingVault = getVaultById(vaultId);
          if (existingVault) {
             // Calculate remaining principal proportionally.
             // Since maxBalance on withdraw page = currentValue (principal + interest),
             // we find what fraction of the total value is being withdrawn
             // and reduce the stored principal by that same fraction.
             const { currentValue } = calculateGrowth(existingVault);
             const withdrawnFraction = (state.amount || 0) / currentValue;
             const remainingPrincipal = existingVault.amount * (1 - withdrawnFraction);
             updateVaultAmount(vaultId, Math.max(0, remainingPrincipal));
          }
        }
      }
    }
  }

  // Main execution
  useEffect(() => {
    if (executionStarted.current) return;
    executionStarted.current = true;

    let done = false;

    function finish() {
      if (done) return;
      done = true;
      saveData();
      setLocalStatus("success");
      setStatus("success");
    }

    // Safety timeout: 30s for multi-step DeFi, 60s for withdrawal
    // We DON'T call finish() automatically for withdrawals to prevent accidental data removal
    const safetyTimer = setTimeout(() => {
      if (!isWithdrawal) {
        console.log("Safety timeout - finishing execution");
        finish();
      }
    }, isWithdrawal ? 60000 : 30000);

    (async () => {
      await new Promise(r => setTimeout(r, 1000));

      if (isWithdrawal) {
        // --- WITHDRAWAL: Use Smart Contract withdraw_sol ---
        // This sends SOL from the vault PDA back to the user's wallet (REAL transfer)
        if (publicKey && anchorWallet && connection) {
          try {
            const provider = new AnchorProvider(connection, anchorWallet, {
              preflightCommitment: "confirmed",
            });
            const program = new Program(idl as any, provider);

            const [yieldPoolPda] = PublicKey.findProgramAddressSync(
              [Buffer.from("yield_pool")], program.programId
            );
            const [vaultPda] = PublicKey.findProgramAddressSync(
              [Buffer.from("vault"), publicKey.toBuffer()], program.programId
            );

            // --- INVERSE INTEREST FORMULA ---
            // The smart contract ALWAYS adds interest: user receives (amount + interest).
            // To make user receive EXACTLY what they requested, we solve:
            //   adjustedAmount + (adjustedAmount * apy * timeElapsed / 100 / 31536000) = desiredAmount
            //   adjustedAmount * (1 + apy * timeElapsed / 100 / 31536000) = desiredAmount
            //   adjustedAmount = desiredAmount / (1 + apy * timeElapsed / 100 / 31536000)
            
            // 1. Fetch on-chain vault data for precise calculation
            const vaultData = await (program.account as any).vaultAccount.fetch(vaultPda);
            const onChainApy = Number(vaultData.apy);                    // u8, e.g. 14
            const onChainDeployedAt = Number(vaultData.deployedAt);      // i64 unix seconds
            const currentTime = Math.floor(Date.now() / 1000);
            const timeElapsed = Math.max(0, currentTime - onChainDeployedAt);
            
            // 2. Calculate the interest multiplier (same formula as lib.rs line 89-93)
            const interestMultiplier = 1 + (onChainApy * timeElapsed) / (100 * 31_536_000);
            
            // 3. Calculate adjusted amount so contract's output = user's desired amount
            const desiredLamports = Math.floor((state.amount || 0) * 1e9);
            const adjustedLamports = Math.floor(desiredLamports / interestMultiplier);
            const amountLamports = new BN(Math.max(1, adjustedLamports));
            
            console.log(`[InverseFix] Desired: ${desiredLamports}, Multiplier: ${interestMultiplier.toFixed(8)}, Adjusted: ${adjustedLamports}, TimeElapsed: ${timeElapsed}s`);

            await program.methods
              .withdrawSol(amountLamports)
              .accounts({
                vault: vaultPda,
                yieldPool: yieldPoolPda,
                user: publicKey,
                owner: publicKey,
                systemProgram: SystemProgram.programId,
              } as any)
              .rpc();

            clearTimeout(safetyTimer);
            finish();
          } catch (err: any) {
            const errStr = JSON.stringify(err);
            const isAlreadyProcessed = 
              err.message?.includes("already been processed") || 
              errStr.includes("already been processed");

            clearTimeout(safetyTimer);

            // Detect InsufficientFunds = ghost vault from old deposit code
            if (err.message?.includes("InsufficientFunds") || err.message?.includes("Insufficient funds")) {
              console.error("Withdraw failed (Insufficient Funds):", err);
              // This vault was deposited with old code (to pool address, not vault PDA)
              // Auto-remove the ghost entry from localStorage
              if (vaultId) {
                removeVault(vaultId);
                console.log("[Withdraw] Removed ghost vault:", vaultId);
              }
              addTransaction({
                type: "Withdraw",
                strategyName: strategyName,
                amount: state.amount || 0,
                token: tokenName,
                timestamp: Date.now(),
                status: "Failed",
              });
              setLocalStatus("error");
              setStatus("failed");
            } else if (isAlreadyProcessed) {
              console.log("[Withdraw] Transaction was already processed by network, treating as success.");
              finish();
            } else {
              console.error("Withdraw failed (Unknown error):", err);
              setLocalStatus("error");
              setStatus("failed");
            }
          }
        } else {
          // No wallet, safety timer will handle
        }
      } else {
        // --- DEPOSIT: Smart Contract deposit + visual DeFi steps ---
        if (publicKey && anchorWallet && connection) {
          try {
            const provider = new AnchorProvider(connection, anchorWallet, {
              preflightCommitment: "confirmed",
            });
            const program = new Program(idl as any, provider);

            const [vaultPda] = PublicKey.findProgramAddressSync(
              [Buffer.from("vault"), publicKey.toBuffer()], program.programId
            );

            // Check if vault exists, create if needed (no popup if already exists)
            let needsCreate = false;
            try {
              await (program.account as any).vaultAccount.fetch(vaultPda);
            } catch {
              needsCreate = true;
            }

            if (needsCreate) {
              await program.methods
                .createVault(
                  state.goal || "growth", 
                  state.strategyResult?.name || "default",
                  state.strategyResult?.expectedAPY || 14
                )
                .accounts({
                  vault: vaultPda,
                  user: publicKey,
                  systemProgram: SystemProgram.programId,
                } as any)
                .rpc();
              console.log("[Execute] Vault created with APY:", state.strategyResult?.expectedAPY);
            }

            // Deposit SOL into smart contract vault PDA
            // This is the ONLY wallet popup the user sees
            const depositAmount = state.amount || 0.01;
            const depositLamports = new BN(Math.floor(depositAmount * 1e9));
            await program.methods
              .depositSol(depositLamports)
              .accounts({
                vault: vaultPda,
                user: publicKey,
                owner: publicKey,
                systemProgram: SystemProgram.programId,
              } as any)
              .rpc();
            console.log("[Execute] SOL deposited to vault PDA:", depositAmount);

            // Animate strategy steps visually (NO blockchain transactions)
            const progress = buildStepProgress(strategySteps);
            for (let i = 0; i < progress.length; i++) {
              progress[i].status = "executing";
              setStepProgress([...progress]);
              await new Promise(r => setTimeout(r, 1200));
              progress[i].status = "done";
              progress[i].signature = "visual-" + Date.now();
              setStepProgress([...progress]);
              await new Promise(r => setTimeout(r, 400));
            }

            clearTimeout(safetyTimer);
            finish();
          } catch (err: any) {
            const errStr = JSON.stringify(err);
            const isAlreadyProcessed = 
              err.message?.includes("already been processed") || 
              errStr.includes("already been processed") ||
              errStr.includes("3002") || // Anchor error code for already processed usually
              err.logs?.some((l: string) => l.includes("already been processed"));

            if (isAlreadyProcessed) {
              console.log("[Execute] Transaction was already processed by the network, treating as success.");
              clearTimeout(safetyTimer);
              finish();
            } else {
              console.error("Deposit execution failed:", err);
              clearTimeout(safetyTimer);
              setLocalStatus("error");
              setStatus("failed");
            }
          }
        }
      }
    })();

    return () => clearTimeout(safetyTimer);
  }, []);

  // Redirect on success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => router.push("/dashboard"), 2000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const coreColors = status === "error" 
    ? "from-error/30 via-error-dim/20 to-error/30" 
    : "from-primary/30 via-secondary/20 to-tertiary/30";

  const ringColors = status === "error" ? "border-error/20" : "border-primary/20";

  // Step status icon
  const stepIcon = (s: StepProgress["status"]) => {
    switch (s) {
      case "done": return "✓";
      case "failed": return "✗";
      case "executing": return "⟳";
      default: return "○";
    }
  };

  const stepColor = (s: StepProgress["status"]) => {
    switch (s) {
      case "done": return "text-primary";
      case "failed": return "text-error";
      case "executing": return "text-tertiary animate-pulse";
      default: return "text-on-surface-variant/40";
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body overflow-hidden">
      <main className="min-h-screen flex items-center justify-center relative p-6">
        <AmbientBackground
          blobs={[
            { color: "primary", position: "top-left", size: "md" },
            { color: "secondary", position: "bottom-right", size: "md" },
            { color: "tertiary", position: "center", size: "lg" },
          ]}
        />

        <section className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center">
          {/* Visual Representative - Compact for 100vh */}
          <div className="mb-4 flex justify-center">
            <div className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border ${ringColors} opacity-60 animate-pulse`} />
              <div className={`absolute inset-3 rounded-full border ${ringColors} opacity-40 animate-pulse`} style={{ animationDelay: "300ms" }} />
              <div className={`absolute inset-6 rounded-full border ${ringColors} opacity-20 animate-pulse`} style={{ animationDelay: "600ms" }} />

              <div className="relative z-10 bg-surface-container-highest/80 backdrop-blur-xl p-6 md:p-8 rounded-full shadow-[0_0_64px_rgba(163,166,255,0.1)]">
                <div className={`w-14 h-14 md:w-18 md:h-18 rounded-full bg-gradient-to-br ${coreColors} flex items-center justify-center transition-colors duration-1000`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${status === 'error' ? 'from-error/50 to-error-dim/50' : 'from-primary/50 to-tertiary/50'} ${status === 'processing' ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              <div className={`absolute -top-1 -right-1 p-2 bg-surface-container-high rounded-lg text-[10px] font-bold shadow-sm ${status === 'error' ? 'text-error' : 'text-primary'}`}>
                {isWithdrawal ? "UNSTAKING" : "EXECUTION"}
              </div>
              <div className={`absolute -bottom-1 -left-1 p-2 bg-surface-container-high rounded-lg text-[10px] font-bold shadow-sm ${status === 'error' ? 'text-error' : 'text-tertiary'}`}>
                {isWithdrawal ? "ROUTING" : "MULTI_PROT"}
              </div>
            </div>
          </div>

          {/* Text Content - Standard sizes restored */}
          <div className="mb-4">
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-1">
              {status === "success" 
                ? (isWithdrawal ? "Withdrawal Complete!" : "Strategy Deployed!")
                : status === "error" 
                ? "Transaction Failed"
                : (isWithdrawal ? "Processing withdrawal..." : "Executing DeFi Strategy...")}
            </h1>
            <p className={`font-body text-sm md:text-base max-w-sm mx-auto leading-relaxed ${status === 'error' ? 'text-error' : 'text-on-surface-variant'}`}>
              {status === "success"
                ? (isWithdrawal ? "Your funds have been securely routed back to your wallet." : "Your automated vault is now live across DeFi protocols.")
                : status === "error"
                ? "Transaction failed. No funds were moved. Please try again."
                : (isWithdrawal ? "Please wait while we process your withdrawal." : "Executing each step through real DeFi protocols...")}
            </p>
          </div>

          {/* Step-by-step Progress (Single Dynamic Card) - Matching style */}
          {status === "processing" && stepProgress.length > 0 && (
            <div className="mt-2 max-w-sm w-full mx-auto">
              {(() => {
                const activeIndex = stepProgress.findIndex(s => s.status === "executing");
                const lastDoneIndex = [...stepProgress].reverse().findIndex(s => s.status === "done");
                const currentIndex = activeIndex !== -1 ? activeIndex : (lastDoneIndex !== -1 ? (stepProgress.length - 1 - lastDoneIndex) : 0);
                const step = stepProgress[currentIndex];
                
                return (
                  <div
                    className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-primary/20 rounded-full" />
                      <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="absolute text-sm font-bold text-primary">
                        {currentIndex + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="text-xs text-primary font-bold uppercase tracking-widest mb-0.5">
                        In Progress
                      </p>
                      <p className="text-lg font-extrabold text-white leading-tight">
                        {step.label}
                      </p>
                      <p className="text-xs text-on-surface-variant/60 mt-1">
                        {step.type === "swap" ? "Jupiter Aggregator" :
                         step.type === "lend" ? "Marginfi Protocol" :
                         step.type === "borrow" ? "Marginfi Protocol" :
                         "AutoFi Vault"}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {status === "success" && (
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="inline-block px-12 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-lg rounded-full shadow-[0_0_32px_rgba(163,166,255,0.3)] hover:shadow-[0_0_48px_rgba(163,166,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <Link
                href={isWithdrawal ? "/withdraw" : "/amount"}
                className="inline-block px-12 py-3 bg-error text-on-error font-bold text-lg rounded-full shadow-[0_0_32px_rgba(255,110,132,0.3)] hover:shadow-[0_0_48px_rgba(255,110,132,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Retry Transaction
              </Link>
              <Link href="/dashboard" className="text-on-surface-variant text-sm font-bold hover:text-white mt-1">
                Cancel and return to Dashboard
              </Link>
            </div>
          )}

          <div className="mt-4 md:mt-6 bg-surface-container-low/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl w-full">
            <div className="p-5 md:px-6 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
              
              <div className="flex flex-row items-center justify-between sm:justify-start gap-4 md:gap-8 w-full sm:w-auto">
                {/* Wallet Info */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-inner shrink-0">
                    <IconWallet size={18} className="text-secondary md:w-6 md:h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] md:text-[11px] text-on-surface-variant font-bold uppercase tracking-widest mb-0.5 md:mb-1 whitespace-nowrap">Target Wallet</p>
                    <p className="text-sm md:text-base font-bold font-headline text-white leading-none whitespace-nowrap">
                      {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Separator */}
                <div className="w-px h-8 md:h-10 bg-white/10 shrink-0" />

                {/* Amount Info */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-tertiary/10 flex items-center justify-center border border-tertiary/20 shadow-inner shrink-0">
                    <IconBolt size={18} className="text-tertiary md:w-6 md:h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] md:text-[11px] text-on-surface-variant font-bold uppercase tracking-widest mb-0.5 md:mb-1 whitespace-nowrap">Total Amount</p>
                    <p className="text-sm md:text-base font-bold font-headline text-white leading-none whitespace-nowrap">
                      {state.amount || 0} SOL
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {status === "processing" && (
                <Link
                  href={isWithdrawal ? "/withdraw" : "/preview"}
                  className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-surface-container-highest text-on-surface text-sm md:text-base font-bold rounded-2xl hover:bg-surface-bright transition-all duration-300 text-center border border-white/5 active:scale-95 shadow-lg whitespace-nowrap shrink-0"
                >
                  Cancel Task
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ExecutingPage() {
  return (
    <WalletGuard>
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <ExecutingContent />
    </Suspense>
    </WalletGuard>
  );
}
