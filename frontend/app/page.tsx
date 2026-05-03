"use client";

import { useEffect, useState, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "./components/footer";
import Button from "./components/button";
import AmbientBackground from "./components/ambient-background";
import {
  IconAutoAwesome,
  IconSync,
  IconBolt,
  IconShield,
  IconArrowForward,
  IconWallet,
  IconSwapHoriz,
  IconTrendingUp,
  IconVerifiedUser,
  IconSettings,
  AutoFiLogo,
} from "./components/icons";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGlobalState } from "./lib/GlobalStateContext";
import ScrollReveal from "./components/ScrollReveal";

export default function LandingPage() {
  const { connected, connecting, publicKey, disconnect } = useWallet();
  const { state } = useGlobalState();
  const router = useRouter();
  const heroRef = useRef<HTMLElement>(null);
  const [showTopbar, setShowTopbar] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const walletAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowTopbar(heroBottom <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsReady(true);
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const strategies = [
    {
      name: "Aggressive Yield",
      desc: "Maximize returns through recursive staking and high-yield lending loops.",
      apy: "14%",
      risk: "High",
      color: "text-secondary",
      bgColor: "bg-secondary/20",
      borderHover: "hover:border-secondary/50",
      icon: <IconBolt size={24} className="text-secondary" />,
    },
    {
      name: "Stable Growth",
      desc: "Consistent growth using low-volatility lending and delta-neutral strategies.",
      apy: "8%",
      risk: "Medium",
      color: "text-primary",
      bgColor: "bg-primary/20",
      borderHover: "hover:border-primary/50",
      icon: <IconTrendingUp size={24} className="text-primary" />,
    },
    {
      name: "Low Risk Safe",
      desc: "Preserve capital using top-tier liquid staking and blue-chip protocols.",
      apy: "6%",
      risk: "Low",
      color: "text-tertiary",
      bgColor: "bg-tertiary/20",
      borderHover: "hover:border-tertiary/50",
      icon: <IconShield size={24} className="text-tertiary" />,
    },
    {
      name: "Balanced Optimizer",
      desc: "An optimal mix of staking rewards and moderate lending yields.",
      apy: "10%",
      risk: "Medium",
      color: "text-on-surface",
      bgColor: "bg-primary/10",
      borderHover: "hover:border-primary/30",
      icon: <IconSettings size={24} className="text-primary" />,
    },
  ];

  return (
    <>
      {/* ── Scroll-triggered Minimal Topbar ── */}
      <nav
        className={`fixed top-0 w-full z-50 bg-surface border-b border-outline-variant/10 shadow-[0_0_64px_rgba(99,102,241,0.06)] transition-all duration-300 ${
          showTopbar
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-16 w-full max-w-[1200px] items-center justify-between mx-auto px-4 md:px-8">
          {/* Left: Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <AutoFiLogo className="h-9 md:h-10" />
          </Link>

          {/* Right: Connect Wallet */}
          {connected ? (
            <div className="flex shrink-0 items-center gap-4">
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
            <Link
              href="/connect"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dim px-6 py-2.5 text-sm md:px-8 md:py-3 md:text-[15px] font-bold leading-none text-on-primary transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(163,166,255,0.15)] hover:shadow-[0_0_40px_rgba(163,166,255,0.3)]"
            >
              Connect Wallet
            </Link>
          )}
        </div>
      </nav>

      <main>
        {/* ════════════════════════════════════════════
            1. HERO SECTION
           ════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative min-h-[700px] md:min-h-screen flex flex-col overflow-hidden px-4 md:px-8 py-8"
        >
          <div
            className={`pointer-events-none absolute inset-0 z-20 bg-surface transition-opacity duration-700 ${
              isReady ? "opacity-0" : "opacity-100"
            }`}
          />

          <AmbientBackground
            fixed={false}
            blobs={[
              { color: "secondary", position: "top-left", size: "lg" },
              { color: "tertiary", position: "bottom-right", size: "lg" },
            ]}
          />

          <div className="relative z-10 w-full max-w-[1200px] mx-auto flex-1 flex flex-col">
            <div className="flex h-16 items-start">
              <Link href="/" className="flex shrink-0 items-center">
                <AutoFiLogo className="h-9 md:h-10" />
              </Link>
            </div>

            <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-6 md:pt-8">
              {/* Hero Content */}
              <ScrollReveal
                animationClass="spawn-rise"
                delay={160}
                className="lg:col-span-7 flex flex-col items-start gap-7"
              >
                <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.05] text-on-surface">
                  Automate Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
                    Solana Yields
                  </span>{" "}
                  with AI
                </h1>

                <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
                  AutoFi intelligently routes your assets through Jupiter, Marginfi, and top staking protocols to maximize your DeFi returns automatically.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                  {connected ? (
                    <Button size="lg" className="w-full sm:w-auto">
                      <Link href="/dashboard" className="w-full text-center">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full sm:w-auto">
                      <Link href="/connect" className="w-full text-center">Connect Wallet</Link>
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Read More
                  </Button>
                </div>
              </ScrollReveal>

              {/* Hero Visual: Glassmorphism Card Stack */}
              <ScrollReveal
                animationClass="spawn-card"
                delay={280}
                className="lg:col-span-5 relative"
              >
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
                        className={`w-full rounded-t-sm origin-bottom transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,0.85,0.2,1)] ${
                          isReady ? "scale-y-100 opacity-100" : "scale-y-[0.15] opacity-0"
                        }`}
                        style={{
                          height: `${h}%`,
                          backgroundColor: `rgba(163, 166, 255, ${0.2 + i * 0.1})`,
                          transitionDelay: `${420 + i * 55}ms`,
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
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            2. HOW IT WORKS
           ════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 bg-surface-container-low">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <ScrollReveal animationClass="spawn-fade" className="text-center mb-16">
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
                Three simple steps to automate your DeFi journey.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6">
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  desc: "Link your Solana wallet securely to get started in seconds.",
                  icon: <IconWallet size={28} className="text-primary" />,
                  color: "bg-primary/15",
                },
                {
                  step: "02",
                  title: "Set Your Goal",
                  desc: "Define your risk appetite and target returns. Our AI will craft a custom multi-step strategy.",
                  icon: <IconSwapHoriz size={28} className="text-secondary" />,
                  color: "bg-secondary/15",
                },
                {
                  step: "03",
                  title: "One-Click Execute",
                  desc: "Approve the automated sequence and watch your portfolio grow with smart rebalancing.",
                  icon: <IconAutoAwesome size={28} className="text-tertiary" />,
                  color: "bg-tertiary/15",
                },
              ].map((item, index) => (
                <ScrollReveal
                  key={item.step}
                  animationClass="spawn-card"
                  delay={index * 150}
                  className="h-full overflow-visible p-2"
                >
                  <div className="relative group rounded-3xl bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="p-8 h-full relative overflow-hidden rounded-3xl">
                      {/* Step Number */}
                      <div className="absolute top-6 right-6 text-5xl font-headline font-extrabold text-surface-container-highest/80 select-none">
                        {item.step}
                      </div>

                      <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <h3 className="font-headline text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>

                      {/* Hover glow - inside overflow container */}
                      <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            3. FEATURES
           ════════════════════════════════════════════ */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-[1200px] mx-auto">
            <ScrollReveal animationClass="spawn-fade" className="text-center mb-16">
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
                Everything you need for intelligent, hands-free DeFi management.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
              {[
                {
                  title: "AI Yield Harvesting",
                  desc: "Real-time protocol monitoring ensures your capital is always positioned in the highest APY pools.",
                  icon: <IconAutoAwesome size={24} className="text-primary" />,
                  gradient: "from-primary/10 to-surface-container",
                },
                {
                  title: "Multi-Step Routing",
                  desc: "Execute complex DeFi sequences across Jupiter and Marginfi in a single automated transaction.",
                  icon: <IconTrendingUp size={24} className="text-secondary" />,
                  gradient: "from-secondary/10 to-surface-container",
                },
                {
                  title: "Non-Custodial Security",
                  desc: "Your keys, your crypto. All strategies execute through secure, auditable Solana smart contracts.",
                  icon: <IconShield size={24} className="text-tertiary" />,
                  gradient: "from-tertiary/10 to-surface-container",
                },
                {
                  title: "Smart Rebalancing",
                  desc: "AutoFi automatically adjusts your positions as market conditions and lending rates shift.",
                  icon: <IconSync size={24} className="text-primary" />,
                  gradient: "from-primary/10 to-surface-container",
                },
              ].map((feature, index) => (
                <ScrollReveal
                  key={feature.title}
                  animationClass="spawn-card"
                  delay={index * 100}
                  className="h-full overflow-visible p-2"
                >
                  <div className={`group rounded-3xl bg-gradient-to-b ${feature.gradient} border border-outline-variant/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 relative h-full`}>
                    <div className="p-6 h-full relative overflow-hidden rounded-3xl">
                      <div className="w-12 h-12 rounded-2xl bg-surface-container-highest/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="font-headline text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed">{feature.desc}</p>

                      {/* Hover glow */}
                      <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            4. STRATEGY PREVIEW
           ════════════════════════════════════════════ */}
        <section className="py-20 bg-surface-container-low px-4 md:px-8">
          <div className="max-w-[1200px] mx-auto">
            <ScrollReveal animationClass="spawn-fade" className="mb-16">
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                Strategy Preview
              </h2>
              <p className="text-on-surface-variant text-lg max-w-2xl">
                Pick a strategy that matches your risk appetite and let AutoFi handle the rest.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
              {strategies.map((s, index) => (
                <ScrollReveal
                  key={s.name}
                  animationClass="spawn-card"
                  delay={index * 100}
                  className="h-full overflow-visible p-2"
                >
                  <div className={`group relative rounded-3xl bg-surface-container border border-outline-variant/10 ${s.borderHover} transition-all duration-300 hover:-translate-y-1 h-full`}>
                    <div className="p-6 flex flex-col justify-between h-full min-h-[280px] relative overflow-hidden rounded-3xl">
                      <div>
                        <div className={`w-12 h-12 ${s.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                          {s.icon}
                        </div>
                        <h3 className="text-lg font-headline font-bold mb-2">{s.name}</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{s.desc}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-outline-variant/10">
                          <span className="text-xs text-on-surface-variant uppercase tracking-widest">APY</span>
                          <span className={`font-headline font-bold ${s.color}`}>{s.apy}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-on-surface-variant uppercase tracking-widest">Risk</span>
                          <span className="text-on-surface text-sm font-semibold">{s.risk}</span>
                        </div>
                      </div>
                      {/* Hover glow */}
                      <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            5. TRUST & SECURITY
           ════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 px-4 md:px-8">
          <div className="max-w-[1200px] mx-auto">
            <ScrollReveal animationClass="spawn-fade" className="text-center mb-16">
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                Trust & Security
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
                Your assets are protected by Solana's leading security standards.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6">
              {[
                {
                  title: "Non-Custodial",
                  desc: "You always retain full ownership of your assets. AutoFi never has access to your private keys or funds.",
                  icon: <IconWallet size={32} className="text-primary" />,
                  color: "bg-primary/15",
                },
                {
                  title: "Smart Contract Based",
                  desc: "All operations run through transparent, auditable smart contracts on the Solana blockchain.",
                  icon: <IconVerifiedUser size={32} className="text-tertiary" />,
                  color: "bg-tertiary/15",
                },
                {
                  title: "Secure Wallet Integration",
                  desc: "Seamless and secure connection with leading Solana wallets — your data stays private.",
                  icon: <IconShield size={32} className="text-secondary" />,
                  color: "bg-secondary/15",
                },
              ].map((item, index) => (
                <ScrollReveal
                  key={item.title}
                  animationClass="spawn-card"
                  delay={index * 150}
                  className="h-full overflow-visible p-2"
                >
                  <div className="group rounded-3xl bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 relative h-full">
                    <div className="text-center p-8 h-full relative overflow-hidden rounded-3xl">
                      <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <h3 className="font-headline text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>

                      {/* Hover glow */}
                      <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            6. CTA SECTION
           ════════════════════════════════════════════ */}
        <section className="py-16 px-4 md:px-8">
          <ScrollReveal
            animationClass="spawn-rise"
            className="max-w-[1200px] mx-auto relative rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-primary-container/20 to-secondary-container/20 p-8 md:p-20 overflow-hidden border border-outline-variant/10 text-center"
          >
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(163,166,255,0.1),transparent)]" />

            <h2 className="font-headline text-2xl md:text-4xl font-extrabold text-on-surface mb-6 max-w-3xl mx-auto relative z-10">
              Start Growing Your Crypto Today
            </h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of users who have automated their financial future.
              Secure, transparent, and non-custodial by design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 w-full sm:w-auto max-w-sm mx-auto sm:max-w-none">
              {connected ? (
                <Button size="lg" className="shadow-xl w-full sm:w-auto">
                  <Link href="/dashboard" className="w-full text-center">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button size="lg" className="shadow-xl w-full sm:w-auto">
                  <Link href="/connect" className="w-full text-center">Connect Wallet</Link>
                </Button>
              )}
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
