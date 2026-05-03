import { AutoFiLogo } from "./icons";

interface FooterProps {
  variant?: "full" | "minimal";
  className?: string;
}

export default function Footer({ variant = "full", className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === "minimal") {
    return (
      <footer className={`w-full py-8 px-4 flex flex-col items-center gap-4 ${className}`}>
        <div className="h-px w-12 bg-outline-variant/30 mb-2" />
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
          © {currentYear} AutoFi. Built step by step.
        </p>
      </footer>
    );
  }

  return (
    <footer className={`w-full bg-surface pb-10 ${className}`}>
      <div className="w-full px-6 md:px-8 mx-auto flex flex-col gap-8">
        <div className="w-full h-px bg-surface-container-low" />

        <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
          <div className="justify-self-start hidden md:block">
            <AutoFiLogo className="h-9" />
          </div>

          <p className="text-center font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-60 whitespace-nowrap">
            © {currentYear} AutoFi
          </p>

          <div aria-hidden="true" className="hidden md:block justify-self-end h-9 w-[128px]" />
        </div>
      </div>
    </footer>
  );
}
