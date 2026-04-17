import Link from "next/link";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import AmbientBackground from "@/app/components/ambient-background";
import MobileNav from "@/app/components/mobile-nav";
import {
  IconAutoAwesome,
  IconShield,
  IconBolt,
  IconSmartToy,
  IconArrowForward,
} from "@/app/components/icons";
import { GOALS } from "@/app/lib/constants";
import type { Goal } from "@/app/lib/types";

const ICON_MAP: Record<string, typeof IconAutoAwesome> = {
  auto_awesome: IconAutoAwesome,
  shield: IconShield,
  bolt: IconBolt,
  smart_toy: IconSmartToy,
};

const ACCENT_MAP: Record<string, { text: string; bg: string; hoverBg: string }> = {
  primary: {
    text: "text-primary",
    bg: "bg-primary/10",
    hoverBg: "group-hover:bg-primary/20",
  },
  secondary: {
    text: "text-secondary",
    bg: "bg-secondary/10",
    hoverBg: "group-hover:bg-secondary/20",
  },
  tertiary: {
    text: "text-tertiary",
    bg: "bg-tertiary/10",
    hoverBg: "group-hover:bg-tertiary/20",
  },
  "on-surface": {
    text: "text-on-surface",
    bg: "bg-on-surface/5",
    hoverBg: "group-hover:bg-on-surface/10",
  },
};

function GoalCard({ goal }: { goal: Goal }) {
  const Icon = ICON_MAP[goal.icon] || IconAutoAwesome;
  const accent = ACCENT_MAP[goal.accentColor] || ACCENT_MAP.primary;

  return (
    <Link href="/invest" className="block">
      <div className="group relative bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 hover:bg-surface-variant transition-all duration-300 cursor-pointer overflow-hidden h-full">
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div
              className={`w-14 h-14 rounded-2xl ${accent.bg} ${accent.hoverBg} flex items-center justify-center mb-6 transition-colors`}
            >
              <Icon size={28} className={accent.text} />
            </div>
            <h3 className="text-2xl font-bold font-headline text-on-surface mb-3">
              {goal.title}
            </h3>
            <p className="text-on-surface-variant text-lg">{goal.description}</p>
          </div>
          <div
            className={`mt-8 flex items-center gap-2 ${accent.text} font-semibold group-hover:translate-x-1 transition-transform`}
          >
            <span>Select Strategy</span>
            <IconArrowForward size={16} />
          </div>
        </div>

        {/* Hover Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

export default function GoalsPage() {
  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full relative">
        <AmbientBackground />

        {/* Header */}
        <div className="mb-16 text-center md:text-left max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold font-headline tracking-tight mb-6 bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text text-transparent">
            Select Your Goal
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed">
            Choose how you want to grow your wealth. Our intelligent atmosphere
            handles the complexity, you define the destination.
          </p>
        </div>

        {/* Goal Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GOALS.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>

        {/* Intelligence Insight Section */}
        <div className="mt-24 bg-surface-container-low rounded-xl overflow-hidden flex flex-col md:flex-row items-center border border-outline-variant/5">
          <div className="w-full md:w-1/2 p-12">
            <span className="text-xs uppercase tracking-widest text-primary font-bold mb-4 block">
              Intelligence Insight
            </span>
            <h2 className="text-3xl font-bold font-headline mb-4">
              Real-time Optimization
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              AutoFi monitors over 4,500 liquidity pools per second to ensure
              your selected goal is met with 100% efficiency. No manual
              adjustments required.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="px-4 py-2 bg-surface-variant rounded-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
              <div className="px-4 py-2 bg-surface-variant rounded-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">Zero-Gas Logic</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-[400px] bg-gradient-to-br from-surface-container to-surface-container-low flex items-center justify-center">
            {/* Abstract visualization placeholder */}
            <div className="w-64 h-64 rounded-full border border-outline-variant/20 flex items-center justify-center relative">
              <div className="w-48 h-48 rounded-full border border-outline-variant/15 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-outline-variant/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-tertiary/20" />
                </div>
              </div>
              {/* Orbiting dots */}
              <div className="absolute w-3 h-3 rounded-full bg-primary/40 top-0 left-1/2 -translate-x-1/2 animate-pulse" />
              <div className="absolute w-2 h-2 rounded-full bg-tertiary/40 bottom-4 right-4 animate-pulse" style={{ animationDelay: "500ms" }} />
              <div className="absolute w-2 h-2 rounded-full bg-secondary/40 bottom-4 left-4 animate-pulse" style={{ animationDelay: "1000ms" }} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}
