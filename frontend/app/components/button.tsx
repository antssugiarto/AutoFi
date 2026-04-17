import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: "default" | "full";
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold shadow-[0_0_20px_rgba(163,166,255,0.15)] hover:shadow-[0_0_40px_rgba(163,166,255,0.3)]",
  secondary:
    "bg-surface-container-highest hover:bg-surface-bright text-on-surface font-semibold border border-outline-variant/10",
  ghost:
    "bg-transparent hover:bg-surface-variant text-on-surface font-bold",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-10 py-4 text-base",
  xl: "px-12 py-5 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  rounded = "full",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        active:scale-95 transition-all duration-200
        ${rounded === "full" ? "rounded-full" : "rounded-xl"}
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
