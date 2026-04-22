"use client";

import { useEffect } from "react";
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
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!connected) {
      router.replace("/");
    }
  }, [connected, router]);

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
