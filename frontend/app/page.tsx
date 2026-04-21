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
      desc: "High returns with optimized DeFi allocation",
      apy: "10% – 18%",
      risk: "Medium-High",
      color: "text-secondary",
      bgColor: "bg-secondary/20",
      borderHover: "hover:border-secondary/50",
      icon: <IconBolt size={24} className="text-secondary" />,
    },
    {
      name: "Stable Growth",
      desc: "Steady returns with low volatility",
      apy: "6% – 10%",
      risk: "Low – Medium",
      color: "text-primary",
      bgColor: "bg-primary/20",
      borderHover: "hover:border-primary/50",
      icon: <IconTrendingUp size={24} className="text-primary" />,
    },
    {
      name: "Low Risk Safe",
      desc: "Protect your funds with minimal exposure",
      apy: "3% – 6%",
      risk: "Low",
      color: "text-tertiary",
      bgColor: "bg-tertiary/20",
      borderHover: "hover:border-tertiary/50",
      icon: <IconShield size={24} className="text-tertiary" />,
    },
    {
      name: "Balanced Optimizer",
      desc: "Smart balance between risk and reward",
      apy: "8% – 12%",
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
        className={`fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_0_64px_rgba(99,102,241,0.06)] transition-all duration-300 ${
          showTopbar
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-16 w-[calc(100%-2rem)] max-w-[1200px] items-center justify-between mx-auto md:w-full">
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
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dim px-8 py-3 text-[15px] font-bold leading-none text-on-primary transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(163,166,255,0.15)] hover:shadow-[0_0_40px_rgba(163,166,255,0.3)]"
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
          className="relative min-h-[700px] md:min-h-screen flex flex-col overflow-hidden px-8 py-8"
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
              <div
                className={`lg:col-span-7 flex flex-col items-start gap-7 transition-[opacity,transform,filter] duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isReady
                    ? "translate-x-0 translate-y-0 opacity-100 blur-0"
                    : "-translate-x-12 translate-y-6 opacity-0 blur-[10px]"
                }`}
                style={{ transitionDelay: "160ms" }}
              >
                <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.05] text-on-surface">
                  Automate Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
                    DeFi Strategy
                  </span>{" "}
                  in One Click
                </h1>

                <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
                  Let AutoFi optimize, execute, and grow your crypto automatically.
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
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Read More
                  </Button>
                </div>
              </div>

              {/* Hero Visual: Glassmorphism Card Stack */}
              <div
                className={`lg:col-span-5 relative transition-[opacity,transform,filter] duration-[1050ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isReady
                    ? "translate-x-0 translate-y-0 rotate-0 opacity-100 blur-0"
                    : "translate-x-14 translate-y-8 rotate-[1.5deg] opacity-0 blur-[12px]"
                }`}
                style={{ transitionDelay: "280ms" }}
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
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            2. HOW IT WORKS
           ════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 bg-surface-container-low">
          <div className="max-w-[1200px] mx-auto px-8">
            <div
              className="text-center mb-16 spawn-fade"
              style={{ "--spawn-delay": "320ms" } as CSSProperties}
            >
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
                Three simple steps to automate your DeFi journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  title: "Choose Strategy",
                  desc: "Pick a strategy that fits your risk profile and investment goals.",
                  icon: <IconSwapHoriz size={28} className="text-secondary" />,
                  color: "bg-secondary/15",
                },
                {
                  step: "03",
                  title: "Earn Automatically",
                  desc: "Sit back and let AutoFi optimize and grow your portfolio.",
                  icon: <IconAutoAwesome size={28} className="text-tertiary" />,
                  color: "bg-tertiary/15",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative group p-8 rounded-3xl bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all duration-300 spawn-card"
                  style={{ "--spawn-delay": `${380 + Number(item.step) * 90}ms` } as CSSProperties}
                >
                  {/* Step Number */}
                  <div className="absolute top-6 right-6 text-5xl font-headline font-extrabold text-surface-container-highest/80 select-none">
                    {item.step}
                  </div>

                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            3. FEATURES
           ════════════════════════════════════════════ */}
        <section className="py-20 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div
              className="text-center mb-16 spawn-fade"
              style={{ "--spawn-delay": "520ms" } as CSSProperties}
            >
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
                Everything you need for intelligent, hands-free DeFi management.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Auto Optimization",
                  desc: "AI-driven engine continuously seeks the best yield opportunities across protocols.",
                  icon: <IconAutoAwesome size={24} className="text-primary" />,
                  gradient: "from-primary/10 to-transparent",
                },
                {
                  title: "Smart Strategy Allocation",
                  desc: "Intelligent fund distribution across multiple strategies for maximum returns.",
                  icon: <IconTrendingUp size={24} className="text-secondary" />,
                  gradient: "from-secondary/10 to-transparent",
                },
                {
                  title: "Secure & Non-Custodial",
                  desc: "Your funds stay in your wallet. We never hold your assets — full control, always.",
                  icon: <IconShield size={24} className="text-tertiary" />,
                  gradient: "from-tertiary/10 to-transparent",
                },
                {
                  title: "Auto Rebalancing",
                  desc: "Automatic portfolio rebalancing to maintain optimal allocation as markets move.",
                  icon: <IconSync size={24} className="text-primary" />,
                  gradient: "from-primary/10 to-transparent",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group p-6 rounded-3xl bg-gradient-to-b ${feature.gradient} border border-outline-variant/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 spawn-card`}
                  style={{ "--spawn-delay": `${600 + index * 80}ms` } as CSSProperties}
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-highest/50 flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="font-headline text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            4. STRATEGY PREVIEW
           ════════════════════════════════════════════ */}
        <section className="py-20 bg-surface-container-low px-8">
          <div className="max-w-[1200px] mx-auto">
            <div
              className="mb-16 spawn-fade"
              style={{ "--spawn-delay": "680ms" } as CSSProperties}
            >
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                Strategy Preview
              </h2>
              <p className="text-on-surface-variant text-lg max-w-2xl">
                Pick a strategy that matches your risk appetite and let AutoFi handle the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {strategies.map((s, index) => (
                <div
                  key={s.name}
                  className={`group relative overflow-hidden rounded-3xl bg-surface-container p-6 flex flex-col justify-between min-h-[280px] border border-outline-variant/10 ${s.borderHover} transition-all duration-300 hover:-translate-y-1 spawn-card`}
                  style={{ "--spawn-delay": `${760 + index * 80}ms` } as CSSProperties}
                >
                  <div>
                    <div className={`w-12 h-12 ${s.bgColor} rounded-2xl flex items-center justify-center mb-5`}>
                      {s.icon}
                    </div>
                    <h3 className="text-lg font-headline font-bold mb-2">{s.name}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{s.desc}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-outline-variant/10">
                      <span className="text-xs text-on-surface-variant uppercase tracking-widest">APY</span>
                      <span className={`font-headline font-bold ${s.color}`}>{s.apy}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant uppercase tracking-widest">Risk</span>
                      <span className="text-on-surface text-sm font-semibold">{s.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            5. TRUST & SECURITY
           ════════════════════════════════════════════ */}
        <section className="py-20 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div
              className="text-center mb-16 spawn-fade"
              style={{ "--spawn-delay": "860ms" } as CSSProperties}
            >
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
                Trust & Security
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
                Your assets are protected by industry-leading security standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <div
                  key={item.title}
                  className="text-center p-8 rounded-3xl bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all duration-300 spawn-card"
                  style={{ "--spawn-delay": `${940 + index * 90}ms` } as CSSProperties}
                >
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            6. CTA SECTION
           ════════════════════════════════════════════ */}
        <section className="py-16 px-8">
          <div
            className="max-w-[1200px] mx-auto relative rounded-[2.5rem] bg-gradient-to-br from-primary-container/20 to-secondary-container/20 p-10 md:p-20 overflow-hidden border border-outline-variant/10 text-center spawn-rise"
            style={{ "--spawn-delay": "1080ms" } as CSSProperties}
          >
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(163,166,255,0.1),transparent)]" />

            <h2 className="font-headline text-2xl md:text-4xl font-extrabold text-on-surface mb-6 max-w-3xl mx-auto relative z-10">
              Start Growing Your Crypto Today
            </h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of users who have automated their financial future.
              Secure, transparent, and non-custodial by design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              {connected ? (
                <Button size="lg" className="shadow-xl">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button size="lg" className="shadow-xl">
                  <Link href="/connect">Connect Wallet</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
