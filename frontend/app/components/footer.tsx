import Link from "next/link";
import { AutoFiLogo, IconTerminal, IconForum } from "./icons";
import { FOOTER_LINKS } from "@/app/lib/constants";

interface FooterProps {
  variant?: "full" | "minimal";
  className?: string;
}

export default function Footer({ variant = "full", className = "" }: FooterProps) {
  if (variant === "minimal") {
    return (
      <footer className={`w-full py-8 px-4 flex flex-col items-center gap-4 ${className}`}>
        <div className="h-px w-12 bg-outline-variant/30 mb-2" />
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
          Â© 2024 AutoFi. The Intelligent Atmosphere.
        </p>
      </footer>
    );
  }

  return (
    <footer className={`w-full py-12 bg-surface ${className}`}>
      <div className="max-w-[1440px] mx-auto px-8 flex flex-col items-center gap-10">
        {/* Divider */}
        <div className="w-full h-px bg-surface-container-low" />

        <div className="flex flex-col md:flex-row justify-between w-full items-center gap-8">
          {/* Logo */}
          <AutoFiLogo className="text-xl text-white" />

          {/* Links */}
          <div className="flex gap-8 font-label text-xs uppercase tracking-widest">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-on-surface-variant hover:text-white transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex gap-6">
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <IconTerminal size={20} />
            </Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <IconForum size={20} />
            </Link>
          </div>
        </div>

        <div className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-60">
          Â© 2024 AutoFi. The Intelligent Atmosphere.
        </div>
      </div>
    </footer>
  );
}

