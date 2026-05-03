"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

/**
 * WalletGuard - Protects pages that require a connected wallet.
 * 
 * Redirects to the landing page ("/") if the user:
 *   - Navigates directly without connecting a wallet
 *   - Disconnects their wallet while on a protected page
 * 
 * Uses the same logic as dashboard/layout.tsx for consistency.
 */
export default function WalletGuard({ children }: { children: React.ReactNode }) {
  const { connected, connecting } = useWallet();
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const wasConnected = useRef(false);

  // Track if user was ever connected in this session
  useEffect(() => {
    if (connected) {
      wasConnected.current = true;
      setIsDisconnecting(false);
    }
  }, [connected]);

  useEffect(() => {
    if (!connected && !connecting) {
      if (wasConnected.current) {
        // User was connected and clicked Disconnect → show spinner briefly
        setIsDisconnecting(true);
        const timer = setTimeout(() => {
          router.replace("/");
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Direct page access without wallet → redirect fast
        const timer = setTimeout(() => {
          router.replace("/");
        }, 100);
        return () => clearTimeout(timer);
      }
    } else if (connecting) {
      setIsDisconnecting(false);
    }
  }, [connected, connecting, router]);

  // Show loading spinner during auto-connect or disconnect animation
  if (connecting || isDisconnecting) {
    return (
      <main className="fixed inset-0 z-[100] flex items-center justify-center bg-surface animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
      </main>
    );
  }

  // Waiting for the redirect to happen — render nothing to avoid UI flash
  if (!connected) return null;

  return <>{children}</>;
}
