"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AutoFiLogo } from "./icons";
import { NAV_LINKS } from "@/app/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {
  const pathname = usePathname();
  const { connected, connecting, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const walletAddress = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_0_64px_rgba(99,102,241,0.06)]">
      <div className="flex justify-between items-center px-8 h-16 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link href="/">
          <AutoFiLogo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-10 items-center">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-headline tracking-tight transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Wallet Status / Connect Button */}
        {connected ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs text-on-surface-variant">Connected</span>
              <span className="font-mono text-sm font-bold text-white">{walletAddress}</span>
            </div>
            <button 
              onClick={() => disconnect()}
              className="bg-surface-container-highest hover:bg-surface-variant text-on-surface font-bold px-5 py-2.5 rounded-full transition-all text-sm border border-outline-variant/20"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setVisible(true)}
            disabled={connecting}
            className="bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold px-6 py-2.5 rounded-full active:scale-95 duration-200 transition-all shadow-[0_0_20px_rgba(163,166,255,0.2)] hover:shadow-[0_0_32px_rgba(163,166,255,0.4)] disabled:opacity-70 disabled:active:scale-100"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}

