"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import idl from "../idl/autofi_smart_contract.json";

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
            const res = await fetch("http://localhost:3001/intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    goal: "maximize_profit",
                    amount: 1000,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch strategy from backend.");
            }

            const strategy = await res.json();
            setResult(strategy);

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
        <div style={{ padding: "20px" }}>
            <WalletMultiButton/>

            <button onClick={handleExecute} disabled={isExecuting}>
                {isExecuting ? "Executing..." : "Execute"}
            </button>

            {result && (
                <div>
                    <h3>Strategy:</h3>
                    {result.steps.map((step: string, i: number) => (
                        <p key={i}>{step}</p>
                    ))}
                </div>
            )}
        </div>
    );
}
