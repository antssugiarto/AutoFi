"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AutoFiLogo } from "./icons";
import { NAV_LINKS } from "@/app/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useNetwork } from "@/app/lib/NetworkContext";

export default function Navbar({ hideNavLinks = false }: { hideNavLinks?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { connected, connecting, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { isMainnet, networkLabel, setNetwork } = useNetwork();

  const walletAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  const handleDisconnect = async () => {
    await disconnect();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant/10 shadow-[0_0_64px_rgba(99,102,241,0.06)]">
      <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <AutoFiLogo className="h-9 md:h-10" />
        </Link>

        {/* Desktop Navigation */}
        {!hideNavLinks && (
          <div className="hidden md:flex gap-10 items-center">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
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
        )}

        {/* Wallet Status / Connect Button */}
        {connected ? (
          <div className="flex items-center gap-2 md:gap-3">
            {/* Network Badge — Clickable Switcher */}
            <button
              onClick={() => setNetwork(isMainnet ? "devnet" : "mainnet-beta")}
              title={`Click to switch to ${isMainnet ? "Devnet" : "Mainnet"}`}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold
                border transition-all duration-300 hover:scale-105 cursor-pointer
                ${
                  isMainnet
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                }
              `}
            >
              {/* Animated status dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isMainnet ? "bg-emerald-400" : "bg-primary"
                }`}
              />
              <span className="hidden sm:inline">{networkLabel}</span>
            </button>

            {/* Wallet Address - Mobile & Tablet only (Plain Text) */}
            <div className="flex md:hidden items-center">
              <span className="text-xs font-bold font-headline text-on-surface-variant tracking-tight">
                {walletAddress}
              </span>
            </div>

            {/* Wallet Address - Desktop (with full address) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest border border-outline-variant/20">
              <span className="text-xs font-bold font-headline text-on-surface-variant tracking-tight">
                {walletAddress}
              </span>
            </div>

            <button
              onClick={handleDisconnect}
              className="bg-surface-container-highest hover:bg-red-900/40 hover:text-red-400 hover:border-red-500/30 text-on-surface font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all text-xs md:text-sm border border-outline-variant/20"
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
