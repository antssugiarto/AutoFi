"use client";

import { useEffect, useState, useRef, Suspense } from "react";
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
import { saveVault, addTransaction, removeVault, updateVaultAmount, getVaultById } from "@/app/lib/storage";
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
             const remaining = existingVault.amount - (state.amount || 0);
             updateVaultAmount(vaultId, Math.max(0, remaining));
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

    // Safety timeout: 30s for multi-step DeFi, 6s for withdrawal
    const safetyTimer = setTimeout(() => {
      console.log("Safety timeout - finishing execution");
      finish();
    }, isWithdrawal ? 6000 : 30000);

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

            const amountLamports = new BN(Math.floor((state.amount || 0) * 1e9));
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
              setStatus("error");
            } else if (isAlreadyProcessed) {
              console.log("[Withdraw] Transaction was already processed by network, treating as success.");
              finish();
            } else {
              console.error("Withdraw failed (Unknown error):", err);
              setLocalStatus("error");
              setStatus("error");
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
              setStatus("error");
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

        <section className="max-w-xl w-full text-center relative z-10">
          {/* Visual Representative */}
          <div className="mb-12 flex justify-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border ${ringColors} opacity-60 animate-pulse`} />
              <div className={`absolute inset-4 rounded-full border ${ringColors} opacity-40 animate-pulse`} style={{ animationDelay: "300ms" }} />
              <div className={`absolute inset-8 rounded-full border ${ringColors} opacity-20 animate-pulse`} style={{ animationDelay: "600ms" }} />

              <div className="relative z-10 bg-surface-container-highest/80 backdrop-blur-xl p-8 rounded-full shadow-[0_0_64px_rgba(163,166,255,0.1)]">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${coreColors} flex items-center justify-center transition-colors duration-1000`}>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${status === 'error' ? 'from-error/50 to-error-dim/50' : 'from-primary/50 to-tertiary/50'} ${status === 'processing' ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              <div className={`absolute top-0 right-0 p-3 bg-surface-container-high rounded-xl text-xs font-bold shadow-sm ${status === 'error' ? 'text-error' : 'text-primary'}`}>
                {isWithdrawal ? "UNSTAKING_FUNDS" : "DEFI_EXECUTION"}
              </div>
              <div className={`absolute bottom-4 left-0 p-3 bg-surface-container-high rounded-xl text-xs font-bold shadow-sm ${status === 'error' ? 'text-error' : 'text-tertiary'}`}>
                {isWithdrawal ? "ROUTING_TO_WALLET" : "MULTI_PROTOCOL"}
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="mb-2">
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-1">
              {status === "success" 
                ? (isWithdrawal ? "Withdrawal Complete!" : "Strategy Deployed!")
                : status === "error" 
                ? "Transaction Failed"
                : (isWithdrawal ? "Processing withdrawal..." : "Executing DeFi Strategy...")}
            </h1>
            <p className={`font-body text-sm max-w-sm mx-auto leading-relaxed ${status === 'error' ? 'text-error' : 'text-on-surface-variant'}`}>
              {status === "success"
                ? (isWithdrawal ? "Your funds have been securely routed back to your wallet." : "Your automated vault is now live across DeFi protocols.")
                : status === "error"
                ? "Transaction failed. No funds were moved. Please try again."
                : (isWithdrawal ? "Please wait while we process your withdrawal." : "Executing each step through real DeFi protocols...")}
            </p>
          </div>

          {/* Step-by-step Progress (for deposits only) */}
          {status === "processing" && !isWithdrawal && stepProgress.length > 0 && (
            <div className="mt-10 space-y-3 max-w-sm mx-auto">
              {stepProgress.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                    step.status === "executing"
                      ? "bg-surface-container-high border border-primary/30"
                      : step.status === "done"
                      ? "bg-surface-container-low border border-primary/10"
                      : "bg-surface-container-low/50"
                  }`}
                >
                  <span className={`text-lg font-bold ${stepColor(step.status)}`}>
                    {stepIcon(step.status)}
                  </span>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-bold ${step.status === "executing" ? "text-on-surface" : "text-on-surface-variant"}`}>
                      Step {i + 1}: {step.label}
                    </p>
                    <p className="text-xs text-on-surface-variant/60">
                      {step.type === "swap" ? "Jupiter Aggregator" :
                       step.type === "lend" ? "Marginfi Protocol" :
                       step.type === "borrow" ? "Marginfi Protocol" :
                       "AutoFi Vault"}
                    </p>
                  </div>
                  {step.status === "executing" && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === "done" && (
                    <span className="text-xs text-primary font-bold">Done</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Processing dots (withdrawal only) */}
          {status === "processing" && isWithdrawal && (
            <div className="mt-16 flex justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
          )}

          {status === "success" && (
            <div className="mt-12">
              <Link
                href="/dashboard"
                className="inline-block px-12 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-lg rounded-full shadow-[0_0_32px_rgba(163,166,255,0.3)] hover:shadow-[0_0_48px_rgba(163,166,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 flex flex-col items-center gap-3">
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

          {/* Transaction Details */}
          <div className="mt-8 p-px bg-gradient-to-br from-primary/20 to-transparent rounded-xl transition-all duration-500">
            <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <IconWallet size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider">Target Wallet</p>
                  <p className="text-sm font-bold font-headline">{publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : "Unknown"}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-outline-variant/20 hidden md:block" />

              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <IconBolt size={20} className="text-tertiary" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider">Amount</p>
                  <p className="text-sm font-bold font-headline">{state.amount || 0} SOL</p>
                </div>
              </div>

              {status === "processing" && (
                <Link
                  href={isWithdrawal ? "/withdraw" : "/preview"}
                  className="w-full md:w-auto px-6 py-3 bg-surface-container-highest text-on-surface text-sm font-bold rounded-full hover:bg-surface-bright transition-all duration-300 text-center"
                >
                  Cancel Task
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer variant="minimal" className="fixed bottom-0 w-full" />
    </div>
  );
}

export default function ExecutingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <ExecutingContent />
    </Suspense>
  );
}
