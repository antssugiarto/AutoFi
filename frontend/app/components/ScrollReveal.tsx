"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animationClass?: "spawn-rise" | "spawn-fade" | "spawn-card" | "spawn-bar";
  delay?: number;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  animationClass = "spawn-rise",
  delay = 0,
  threshold = 0.1,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualDelay, setActualDelay] = useState(delay);
  const ref = useRef<HTMLDivElement>(null);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // If revealed after initial load (e.g. user scrolled to it), remove delay entirely
          if (Date.now() - mountTime.current > 500) {
            setActualDelay(0);
          }
          setIsVisible(true);
          // Once it's visible, we don't need to observe it anymore to prevent re-animating
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : "opacity-0 translate-y-8"}`}
      style={
        {
          "--spawn-delay": `${actualDelay}ms`,
          transition: "opacity 700ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          transitionDelay: `${actualDelay}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
