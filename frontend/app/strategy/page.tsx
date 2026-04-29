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
  const [isClosing, setIsClosing] = useState(false);
  const { setGoal } = useGlobalState();
  const router = useRouter();

  const handleConfirm = () => {
    if (selectedGoal) {
      setGoal(selectedGoal.id);
      router.push("/amount");
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedGoal(null);
      setIsClosing(false);
    }, 200); // 200ms duration matches the exit animation
  };

  return (
    <>
      <div className="min-h-screen flex flex-col w-full relative overflow-hidden">
        <Navbar />
        <AmbientBackground />

        <main className="flex-1 flex flex-col pt-24 pb-16 px-6 max-w-[1100px] mx-auto w-full relative z-10">
          <div className="w-full flex justify-start mb-6 align-left">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
          </div>

        {/* Header */}
        <div className="mb-10 text-center md:text-left max-w-xl">
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tighter mb-1 text-white">
            Select Your Strategy
          </h1>
          <p className="font-body text-on-surface-variant text-sm leading-relaxed">
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
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? "animate-modal-fade-out" : "animate-modal-fade-in"}`}
            onClick={handleClose}
          >
            <div
              className={`bg-surface-container-high w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border border-outline-variant/20 ${isClosing ? "animate-modal-sink-out" : "animate-modal-rise-in"}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={handleClose}
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
                  <p className="text-xs font-label uppercase tracking-widest font-bold text-white mb-1.5">
                    Strategy Overview
                  </p>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {selectedGoal.description}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-on-surface-variant capitalize mb-0.5">
                      Apy
                    </p>
                    <p className="text-base font-bold text-tertiary">
                      {selectedGoal.apy}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-on-surface-variant capitalize mb-0.5">
                      Risk
                    </p>
                    <p className="text-base font-bold text-secondary">
                      {selectedGoal.risk}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-on-surface-variant capitalize mb-0.5">
                      Confidence
                    </p>
                    <p className="text-base font-bold text-primary">
                      {selectedGoal.confidence}
                    </p>
                  </div>
                </div>

                {/* Protocols */}
                <div>
                  <p className="text-xs font-label uppercase tracking-widest font-bold text-white mb-1.5">
                    Protocols Used
                  </p>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Solend, Raydium, Jupiter
                  </p>
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
      </div>

      <Footer />
      <MobileNav />
    </>
  );
}
