"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import AmbientBackground from "@/app/components/ambient-background";
import Button from "@/app/components/button";
import { IconWallet, IconLock, IconShield } from "@/app/components/icons";

export default function ConnectPage() {
  const { connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-6 flex items-center justify-center relative min-h-screen">
        <AmbientBackground />
        
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-surface-container-low p-10 rounded-3xl border border-outline-variant/20 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_30px_rgba(163,166,255,0.15)]">
              <IconWallet size={40} className="text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold font-headline text-on-surface mb-4">
              Connect Wallet
            </h1>
            <p className="text-on-surface-variant mb-10">
              Securely connect your Solana wallet to access your intelligent portfolio and manage your strategies.
            </p>
            
            <Button 
              size="lg" 
              className="w-full justify-center text-lg shadow-[0_0_20px_rgba(163,166,255,0.2)]"
              onClick={() => setVisible(true)}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Select Wallet"}
            </Button>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-on-surface-variant/70 font-label">
              <div className="flex items-center gap-2">
                <IconLock size={16} /> Secure
              </div>
              <div className="flex items-center gap-2">
                <IconShield size={16} /> Non-Custodial
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

