"use client";

import { useState } from "react";
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
  IconClose,
} from "@/app/components/icons";
import { GOALS } from "@/app/lib/constants";
import type { Goal } from "@/app/lib/types";
import { useGlobalState } from "@/app/lib/GlobalStateContext";
import { useRouter } from "next/navigation";

const ICON_MAP: Record<string, typeof IconAutoAwesome> = {
  auto_awesome: IconAutoAwesome,
  shield: IconShield,
  bolt: IconBolt,
  smart_toy: IconSmartToy,
};

const ACCENT_MAP: Record<string, { text: string; bg: string; hoverBg: string; border: string }> = {
  primary: {
    text: "text-primary",
    bg: "bg-primary/10",
    hoverBg: "group-hover:bg-primary/20",
    border: "hover:border-primary/30",
  },
  secondary: {
    text: "text-secondary",
    bg: "bg-secondary/10",
    hoverBg: "group-hover:bg-secondary/20",
    border: "hover:border-secondary/30",
  },
  tertiary: {
    text: "text-tertiary",
    bg: "bg-tertiary/10",
    hoverBg: "group-hover:bg-tertiary/20",
    border: "hover:border-tertiary/30",
  },
  "on-surface": {
    text: "text-on-surface",
    bg: "bg-on-surface/5",
    hoverBg: "group-hover:bg-on-surface/10",
    border: "hover:border-primary/20",
  },
};

function GoalCard({ goal, onSelect }: { goal: Goal; onSelect: () => void }) {
  const Icon = ICON_MAP[goal.icon] || IconAutoAwesome;
  const accent = ACCENT_MAP[goal.accentColor] || ACCENT_MAP.primary;

  return (
    <div
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-3xl bg-surface-container p-6 flex flex-col justify-between min-h-[210px] border border-outline-variant/10 ${accent.border} transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
    >
      {/* Top content */}
      <div>
        <div
          className={`w-12 h-12 ${accent.bg} ${accent.hoverBg} rounded-2xl flex items-center justify-center mb-5 transition-colors`}
        >
          <Icon size={24} className={accent.text} />
        </div>
        <h3 className="text-lg font-headline font-bold mb-2 text-on-surface">
          {goal.title}
        </h3>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          {goal.description}
        </p>
      </div>

      {/* Bottom: subtle CTA */}
      <div
        className={`mt-6 flex items-center gap-1.5 text-sm font-semibold ${accent.text} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}
      >
        <span>View Details</span>
        <IconArrowForward size={14} />
      </div>

      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const { setGoal } = useGlobalState();
  const router = useRouter();

  const handleConfirm = () => {
    if (selectedGoal) {
      setGoal(selectedGoal.id);
      router.push("/amount");
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-6 max-w-[1100px] mx-auto w-full relative">
        <AmbientBackground />

        {/* Header */}
        <div className="mb-10 text-center md:text-left max-w-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight mb-3 bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text text-transparent">
            Select Your Goal
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Choose how you want to grow your wealth. Our intelligent atmosphere
            handles the complexity, you define the destination.
          </p>
        </div>

        {/* Goal Selection Grid — matches landing page card layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GOALS.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onSelect={() => setSelectedGoal(goal)}
            />
          ))}
        </div>

        {/* Strategy Details Modal */}
        {selectedGoal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedGoal(null)}
          >
            <div
              className="bg-surface-container-high w-full max-w-md rounded-3xl p-8 shadow-2xl relative border border-outline-variant/20 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedGoal(null)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant hover:text-white hover:bg-surface-variant transition-all"
              >
                <IconClose size={18} />
              </button>

              {/* Title */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ACCENT_MAP[selectedGoal.accentColor].bg} ${ACCENT_MAP[selectedGoal.accentColor].text}`}
                >
                  {(() => {
                    const ModalIcon =
                      ICON_MAP[selectedGoal.icon] || IconAutoAwesome;
                    return <ModalIcon size={24} />;
                  })()}
                </div>
                <h2 className="text-xl font-bold font-headline">
                  {selectedGoal.title}
                </h2>
              </div>

              {/* Body */}
              <div className="space-y-5">
                {/* Description */}
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
                    Strategy Overview
                  </p>
                  <p className="text-on-surface text-sm leading-relaxed">
                    {selectedGoal.description}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-container-highest p-3 rounded-xl border border-outline-variant/10 text-center">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                      APY
                    </p>
                    <p className="text-base font-bold text-tertiary">
                      {selectedGoal.apy}
                    </p>
                  </div>
                  <div className="bg-surface-container-highest p-3 rounded-xl border border-outline-variant/10 text-center">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                      Risk
                    </p>
                    <p className="text-base font-bold text-secondary">
                      {selectedGoal.risk}
                    </p>
                  </div>
                  <div className="bg-surface-container-highest p-3 rounded-xl border border-outline-variant/10 text-center">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                      Confidence
                    </p>
                    <p className="text-base font-bold text-primary">
                      {selectedGoal.confidence}
                    </p>
                  </div>
                </div>

                {/* Protocols */}
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
                    Protocols Used
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {["Solend", "Raydium", "Jupiter"].map((p) => (
                      <span
                        key={p}
                        className="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold border border-outline-variant/20"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-7">
                <button
                  onClick={handleConfirm}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-primary to-primary-dim text-on-primary font-bold text-base active:scale-95 transition-transform shadow-[0_0_20px_rgba(163,166,255,0.2)] hover:shadow-[0_0_32px_rgba(163,166,255,0.35)]"
                >
                  Use This Strategy
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}
