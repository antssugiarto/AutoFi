"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import MobileNav from "@/app/components/mobile-nav";
import Footer from "@/app/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected, connecting } = useWallet();
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const wasConnected = useRef(false);

  // Track if they were ever connected in this session
  useEffect(() => {
    if (connected) {
      wasConnected.current = true;
      setIsDisconnecting(false); // Reset just in case
    }
  }, [connected]);

  useEffect(() => {
    // If not connected and not trying to connect
    if (!connected && !connecting) {
      if (wasConnected.current) {
        // Case 1: User was connected and clicked Disconnect
        setIsDisconnecting(true);
        const timer = setTimeout(() => {
          router.replace("/");
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Case 2: User refreshed or loaded page directly without wallet
        // Wait a tiny bit for auto-connect to potentially kick in, then redirect instantly
        const timer = setTimeout(() => {
          router.replace("/");
        }, 100);
        return () => clearTimeout(timer);
      }
    } else if (connecting) {
      // If auto-connecting kicks in, make sure we don't get stuck in disconnect UI
      setIsDisconnecting(false);
    }
  }, [connected, connecting, router]);

  // Show loader ONLY if actively connecting (auto-connect on refresh) OR doing the manual disconnect animation
  if (connecting || isDisconnecting) {
    return (
      <main className="fixed inset-0 z-[100] flex items-center justify-center bg-surface animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
      </main>
    );
  }

  // If completely disconnected and just waiting for the 100ms redirect to happen, show nothing to avoid UI flash
  if (!connected) return null;

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="md:ml-64 flex flex-col">
        <div className="min-h-screen flex flex-col w-full">
          {children}
        </div>
        <Footer />
      </div>
      <MobileNav />
    </>
  );
}
