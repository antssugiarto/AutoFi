"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Footer from "@/app/components/footer";
import AmbientBackground from "@/app/components/ambient-background";
import Button from "@/app/components/button";
import { IconWallet, IconLock, IconShield } from "@/app/components/icons";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import toast from "react-hot-toast";

export default function ConnectPage() {
  const { connected, connecting, wallets } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  const handleConnectClick = () => {
    const phantom = wallets.find((w) => w.adapter.name === "Phantom");
    
    if (phantom && phantom.readyState === WalletReadyState.NotDetected) {
      toast.error("Phantom Wallet not found. Please install it first!");
      window.open("https://phantom.app/", "_blank");
      return;
    }
    
    setVisible(true);
  };

  return (
    <>
      <main className="flex-grow pt-10 pb-20 px-6 flex items-center justify-center relative min-h-screen">
        <AmbientBackground />
        
        <button 
          onClick={() => router.back()}
          className="absolute top-10 left-6 md:left-10 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors z-20 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>

        <div className="w-full max-w-[380px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_30px_rgba(163,166,255,0.15)]">
              <IconWallet size={32} className="text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold font-headline text-on-surface mb-3">
              Connect Wallet
            </h1>
            <p className="text-on-surface-variant text-sm mb-8">
              Securely connect your Solana wallet to access your intelligent portfolio and manage your strategies.
            </p>
            
            <Button 
              size="lg" 
              className="w-full justify-center text-base py-3 shadow-[0_0_20px_rgba(163,166,255,0.2)]"
              onClick={handleConnectClick}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Select Wallet"}
            </Button>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-on-surface-variant/70 font-label">
              <div className="flex items-center gap-1.5">
                <IconLock size={14} /> Secure
              </div>
              <div className="flex items-center gap-1.5">
                <IconShield size={14} /> Non-Custodial
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

