"use client";

/**
 * Providers
 *
 * Sets up Solana Wallet Adapter with a dynamic NetworkProvider.
 * The endpoint is determined by the NetworkContext, allowing the
 * user to switch between Devnet and Mainnet from the UI.
 */

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { NetworkProvider, useNetwork } from "./lib/NetworkContext";
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Inner component to consume useNetwork and provide the correct endpoint
 * to ConnectionProvider.
 */
function InnerProviders({ children }: { children: React.ReactNode }) {
  const { networkConfig } = useNetwork();

  // ConnectionProvider requires a full URL (http:// or https://).
  // If the rpcEndpoint is a relative path (e.g. "/api/rpc"), prepend the origin.
  const endpoint = useMemo(() => {
    const raw = networkConfig.rpcEndpoint;
    if (raw.startsWith("/")) {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";
      return `${origin}${raw}`;
    }
    return raw;
  }, [networkConfig.rpcEndpoint]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <InnerProviders>{children}</InnerProviders>
    </NetworkProvider>
  );
}
