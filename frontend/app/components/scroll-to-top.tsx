"use client";

import { useEffect, useState } from "react";
import { IconArrowUpward } from "./icons";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 360);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-24 right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant/20 bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-[0_0_24px_rgba(163,166,255,0.25)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(163,166,255,0.35)] md:bottom-8 md:right-6 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <IconArrowUpward size={20} />
    </button>
  );
}
