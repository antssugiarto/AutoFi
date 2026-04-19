"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Button from "./components/button";
import AmbientBackground from "./components/ambient-background";
import {
  IconAutoAwesome,
  IconSync,
  IconBolt,
  IconShield,
  IconArrowForward,
  IconAdd,
  IconWallet,
  IconSwapHoriz,
  IconTrendingUp,
  IconVerifiedUser,
} from "./components/icons";
import { STATS } from "./lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGlobalState } from "./lib/GlobalStateContext";

export default function LandingPage() {
  const { connected, connecting } = useWallet();
  const { state } = useGlobalState();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);
  return (
    <>
      <Navbar />

      <main className="pt-20">
        {/* â”€â”€ Hero Section â”€â”€ */}
        <section className="relative min-h-[700px] md:min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-8 py-12">
          <AmbientBackground
            fixed={false}
            blobs={[
              { color: "secondary", position: "top-left", size: "lg" },
              { color: "tertiary", position: "bottom-right", size: "lg" },
            ]}
          />

          <div className="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-7 flex flex-col items-start gap-8">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest/50 backdrop-blur-md border border-outline-variant/15">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span className="text-tertiary uppercase tracking-widest text-[10px] font-bold">
                  System Status: Active
                </span>
              </div>

              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] text-on-surface">
                Automate Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
                  DeFi Goals
                </span>
              </h1>

              <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
                Set your goal. We handle the rest. The intelligent layer for
                decentralized finance that prioritizes your outcomes over
                complexity.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                {connected ? (
                  <Button size="lg">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <Button size="lg">
                    <Link href="/connect">Connect Wallet</Link>
                  </Button>
                )}
                <Button variant="secondary" size="lg">
                  <Link href="/strategy">Explore Strategies</Link>
                </Button>
              </div>
            </div>

            {/* Hero Visual: Glassmorphism Card Stack */}
            <div className="lg:col-span-5 relative">
              <div className="relative z-10 p-8 rounded-3xl bg-surface-bright/30 backdrop-blur-2xl border border-outline-variant/15 shadow-2xl shadow-primary/5">
                {/* Card Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <IconAutoAwesome size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Active Vault</div>
                      <div className="text-xs text-on-surface-variant">
                        ETH Growth Strategy
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-tertiary">+12.4%</div>
                    <div className="text-xs text-on-surface-variant">APR</div>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-48 w-full bg-surface-container-lowest rounded-xl relative overflow-hidden mb-6 flex items-end gap-1 px-4 pb-4">
                  {[30, 45, 40, 60, 55, 85, 95].map((h, i) => (
                    <div
                      key={i}
                      className="w-full rounded-t-sm transition-all duration-500"
                      style={{
                        height: `${h}%`,
                        backgroundColor: `rgba(163, 166, 255, ${0.2 + i * 0.1})`,
                      }}
                    />
                  ))}
                </div>

                {/* Info Rows */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl">
                    <span className="text-on-surface-variant text-sm">
                      Portfolio Balance
                    </span>
                    <span className="font-headline font-bold text-lg">
                      $42,910.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl">
                    <span className="text-on-surface-variant text-sm">
                      Automation Status
                    </span>
                    <span className="text-primary text-sm font-bold flex items-center gap-1">
                      <IconSync size={14} />
                      Rebalancing
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Glows */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
            </div>
          </div>
        </section>

        {/* â”€â”€ Stats Section â”€â”€ */}
        <section className="py-16 bg-surface-container-low">
          <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mb-2">
                  {stat.value}
                </div>
                <div className="text-on-surface-variant uppercase tracking-widest text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* â”€â”€ Curated Intelligence (Bento Grid) â”€â”€ */}
        <section className="py-24 px-8 max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                Curated Intelligence
              </h2>
              <p className="text-on-surface-variant text-lg">
                Pick a strategy that fits your risk profile. Our engine handles
                the yields, gas, and position management.
              </p>
            </div>
            <Link
              href="/strategy"
              className="text-primary font-bold flex items-center gap-2 group"
            >
              View all strategies
              <IconArrowForward
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strategy 1 â€” Featured */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-surface-container-high p-8 flex flex-col justify-between min-h-[350px]">
              <div className="relative z-10">
                <div className="inline-block px-4 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-6 uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl md:text-3xl font-headline font-bold mb-4">
                  The Blue-Chip Autopilot
                </h3>
                <p className="text-on-surface-variant max-w-md leading-relaxed">
                  Automatically rebalance between ETH, BTC, and top stablecoins
                  to capture market growth while minimizing volatility.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <span className="block text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                      Risk
                    </span>
                    <span className="text-on-surface font-bold">Moderate</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                      Fees
                    </span>
                    <span className="text-on-surface font-bold">0.1%</span>
                  </div>
                </div>
                <Link
                  href="/amount"
                  className="w-14 h-14 rounded-full bg-on-surface text-surface flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <IconAdd size={24} />
                </Link>
              </div>
            </div>

            {/* Strategy 2 */}
            <div className="group relative overflow-hidden rounded-3xl bg-surface-variant p-8 flex flex-col justify-between min-h-[350px]">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                  <IconBolt size={24} className="text-secondary" />
                </div>
                <h3 className="text-xl md:text-2xl font-headline font-bold mb-3">
                  High Yield Aggregator
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Aggressively scans liquidity pools across 12 chains to find
                  the highest temporary yield opportunities.
                </p>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-headline font-extrabold text-secondary mb-4">
                  24.8%{" "}
                  <span className="text-sm font-medium text-on-surface-variant">
                    EST. APR
                  </span>
                </div>
                <Link
                  href="/amount"
                  className="block w-full py-3 rounded-xl bg-surface-container-highest text-on-surface font-bold border border-outline-variant/20 hover:border-secondary/50 transition-all text-center"
                >
                  Invest Now
                </Link>
              </div>
            </div>

            {/* Strategy 3 */}
            <div className="group relative overflow-hidden rounded-3xl bg-surface-container-highest p-8 flex flex-col justify-between min-h-[350px]">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-tertiary/20 rounded-2xl flex items-center justify-center mb-6">
                  <IconShield size={24} className="text-tertiary" />
                </div>
                <h3 className="text-xl md:text-2xl font-headline font-bold mb-3">
                  Stablecoin Sanctuary
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Maximum safety. Strategy focused solely on top-tier audited
                  stablecoin yield generators.
                </p>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-headline font-extrabold text-tertiary mb-4">
                  8.2%{" "}
                  <span className="text-sm font-medium text-on-surface-variant">
                    EST. APR
                  </span>
                </div>
                <Link
                  href="/amount"
                  className="block w-full py-3 rounded-xl bg-surface-container-highest text-on-surface font-bold border border-outline-variant/20 hover:border-tertiary/50 transition-all text-center"
                >
                  Invest Now
                </Link>
              </div>
            </div>

            {/* Strategy 4 â€” Custom Builder */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-low to-surface-dim p-8 flex items-center gap-12 min-h-[350px] border border-outline-variant/10">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-headline font-bold mb-4">
                  Custom Logic Builder
                </h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  Can&apos;t find a strategy that fits? Build your own with our
                  visual node-based automation tool. No coding required.
                </p>
                <Button variant="secondary" size="lg" className="bg-white text-black hover:bg-primary">
                  Launch Builder
                </Button>
              </div>
              <div className="hidden lg:block w-1/3">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <IconWallet size={32} />, color: "text-primary" },
                    { icon: <IconSwapHoriz size={32} />, color: "text-secondary", offset: true },
                    { icon: <IconTrendingUp size={32} />, color: "text-tertiary" },
                    { icon: <IconVerifiedUser size={32} />, color: "text-on-surface", offset: true },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`aspect-square bg-surface-variant rounded-2xl flex items-center justify-center ${item.color} ${item.offset ? "translate-y-6" : ""}`}
                    >
                      {item.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ CTA Section â”€â”€ */}
        <section className="py-24 px-8">
          <div className="max-w-[1200px] mx-auto relative rounded-[2.5rem] bg-gradient-to-br from-primary-container/20 to-secondary-container/20 p-10 md:p-20 overflow-hidden border border-outline-variant/10 text-center">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(163,166,255,0.1),transparent)]" />

            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-on-surface mb-6 max-w-3xl mx-auto relative z-10">
              The Future of Yield is Already Automatic.
            </h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto relative z-10">
              Join over 45,000 users who have automated their financial future.
              Secure, transparent, and non-custodial by design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              {connected ? (
                <Button size="lg" className="shadow-xl">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button size="lg" className="shadow-xl">
                  <Link href="/connect">Connect Wallet Now</Link>
                </Button>
              )}
              <Button variant="secondary" size="lg" className="bg-surface/50 backdrop-blur-md border-outline-variant/20">
                Read the Docs
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

