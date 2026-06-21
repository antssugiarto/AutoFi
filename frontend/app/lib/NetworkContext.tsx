"use client";

/**
 * NetworkContext
 *
 * Manages the active Solana network for the application.
 * Users can toggle between Devnet and Mainnet via the UI.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { type SolanaNetwork, NETWORK_CONFIG } from "./constants";

interface NetworkContextType {
  /** Current active network */
  network: SolanaNetwork;
  /** Function to change the network */
  setNetwork: (network: SolanaNetwork) => void;
  /** Whether the current network is Mainnet */
  isMainnet: boolean;
  /** Label for display (e.g. "Devnet" | "Mainnet") */
  networkLabel: string;
  /** The full config object for the current network */
  networkConfig: (typeof NETWORK_CONFIG)[SolanaNetwork];
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<SolanaNetwork>("devnet");

  // Load saved network preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("autofi_network") as SolanaNetwork;
    if (saved && NETWORK_CONFIG[saved]) {
      setNetworkState(saved);
    }
  }, []);

  const setNetwork = (newNetwork: SolanaNetwork) => {
    setNetworkState(newNetwork);
    localStorage.setItem("autofi_network", newNetwork);
  };

  const isMainnet = network === "mainnet-beta";
  const networkLabel = NETWORK_CONFIG[network].label;
  const networkConfig = NETWORK_CONFIG[network];

  return (
    <NetworkContext.Provider
      value={{ network, setNetwork, isMainnet, networkLabel, networkConfig }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

/** Hook to access the current network state from any component. */
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
