"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import idl from "../idl/autofi_smart_contract.json";
import Button from "./components/button";
import { IconAutoAwesome } from "./components/icons";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
    const [result, setResult] = useState<any>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const { publicKey, connected } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();

    const provider = useMemo(() => {
        if (!anchorWallet) {
            return null;
        }

        return new AnchorProvider(
            connection,
            anchorWallet,
            AnchorProvider.defaultOptions()
        );
    }, [anchorWallet, connection]);

    const program = useMemo(() => {
        if (!provider) {
            return null;
        }

        return new Program(idl as Idl, provider);
    }, [provider]);

    const handleExecute = async () => {
        if (!connected || !publicKey || !program) {
            alert("Please connect your wallet first.");
            return;
        }

        setIsExecuting(true);

        try {
            // Optional: call your backend (from friend's logic)
            try {
                const res = await fetch("http://localhost:3001/intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        goal: "maximize_profit",
                        amount: 1000,
                    }),
                });
                if (res.ok) {
                    const strategy = await res.json();
                    setResult(strategy);
                }
            } catch (e) {
                console.warn("Backend not running, proceeding with contract execution only.");
            }

            // Call the smart contract (matches execute_intent in lib.rs)
            await program.methods
                .executeIntent("maximize_profit", new BN(1000))
                .accounts({
                    user: publicKey,
                })
                .rpc();

            console.log("Transaction success!");
            alert("Transaction success!");
        } catch (error) {
            console.error("Execute failed:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Transaction failed. Check console for details."
            );
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto px-6 py-12 relative">
            <div className="lg:col-span-7 flex flex-col gap-6 relative z-10">
                <div className="flex justify-between items-center w-full mb-4">
                     <WalletMultiButton />
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface">
                    AutoFi DeFi Automation
                </h1>
                <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
                    Set your goal. We handle the rest. The intelligent layer for
                    decentralized finance that prioritizes your outcomes over
                    complexity.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                    {connected ? (
                        <>
                            <Button size="lg" onClick={handleExecute} disabled={isExecuting}>
                                {isExecuting ? "Executing Contract..." : "Execute Contract"}
                            </Button>
                            <Button variant="secondary" size="lg">
                                <Link href="/dashboard">Go to Dashboard</Link>
                            </Button>
                        </>
                    ) : (
                        <div className="text-sm text-on-surface-variant flex items-center">
                            Please connect your wallet to execute the contract.
                        </div>
                    )}
                    <Button variant="secondary" size="lg">
                        <Link href="/goals">Explore Strategies</Link>
                    </Button>
                </div>
            </div>

            {/* Hero Visual: Glassmorphism Card Stack */}
            <div className="lg:col-span-5 relative">
                <div className="relative z-10 p-8 rounded-3xl bg-surface-bright/30 backdrop-blur-2xl border border-outline-variant/15 shadow-2xl shadow-primary/5">
                    {/* Card Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <IconAutoAwesome size={20} className="text-primary" />
                            </div>
                            <div>
                                <div className="text-sm font-bold">Active Vault</div>
                                <div className="text-xs text-on-surface-variant">
                                    ETH Growth Strategy
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-tertiary">+12.4%</div>
                            <div className="text-xs text-on-surface-variant">APR</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
