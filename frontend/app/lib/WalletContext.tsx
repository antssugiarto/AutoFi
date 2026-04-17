"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  hasPortfolio: boolean;
  markPortfolioActive: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const router = useRouter();

  // Load state from localStorage on mount (untuk simulasi)
  useEffect(() => {
    const savedPortfolioState = localStorage.getItem("autofi_has_portfolio");
    if (savedPortfolioState === "true") {
      setHasPortfolio(true);
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    // Simulate wallet connection delay (e.g. approving in Phantom/Metamask)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsConnected(true);
    setWalletAddress("0x71C...8e21");
    setIsConnecting(false);

    // Logic Routing Otomatis berdasarkan status porto
    if (hasPortfolio) {
      router.push("/dashboard");
    } else {
      router.push("/goals");
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    router.push("/");
  };

  // Dipanggil setelah user berhasil eksekusi di halaman /executing
  const markPortfolioActive = () => {
    setHasPortfolio(true);
    localStorage.setItem("autofi_has_portfolio", "true");
  };

  return (
    <WalletContext.Provider 
      value={{ 
        isConnected, 
        isConnecting, 
        walletAddress, 
        hasPortfolio, 
        markPortfolioActive, 
        connectWallet, 
        disconnectWallet 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
