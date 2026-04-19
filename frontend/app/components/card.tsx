import { type ReactNode } from "react";

type CardVariant = "surface-low" | "surface-high" | "glass" | "surface-variant";

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  "surface-low": "bg-surface-container-low",
  "surface-high": "bg-surface-container-high",
  "surface-variant": "bg-surface-variant",
  glass: "glass-panel",
};

export default function Card({
  variant = "surface-low",
  children,
  className = "",
  hover = false,
  glow = false,
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl relative overflow-hidden
        border border-outline-variant/10
        ${VARIANT_CLASSES[variant]}
        ${hover ? "hover:bg-surface-bright transition-colors duration-300 cursor-pointer" : ""}
        ${glow ? "shadow-[0_0_64px_rgba(99,102,241,0.06)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

