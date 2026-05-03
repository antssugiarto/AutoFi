"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconInsights,
  IconHistory,
  IconTrackChanges,
} from "./icons";

export default function MobileNav() {
  const pathname = usePathname();

  // Define allowed routes for the bottom bar and FAB
  const allowedRoutes = ["/dashboard", "/dashboard/strategy", "/dashboard/history"];
  
  // Hide bottom bar if not on a core dashboard page
  if (!allowedRoutes.includes(pathname)) {
    return null;
  }

  // Only show Overview, Active Strategy, and History
  const MOBILE_TABS = [
    { label: "Overview", href: "/dashboard", icon: IconDashboard },
    { label: "Active Strategy", href: "/dashboard/strategy", icon: IconInsights },
    { label: "History", href: "/dashboard/history", icon: IconHistory },
  ];

  return (
    <>
      {/* Floating Action Button - New Goal (Mobile/Tablet Only) */}
      <Link
        href="/strategy"
        className="md:hidden fixed bottom-20 right-5 z-[60] flex px-6 py-3 items-center justify-center gap-2 rounded-2xl border border-outline-variant/20 bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-[0_8px_32px_rgba(163,166,255,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-8 fade-in duration-500"
      >
        <span className="text-lg font-black leading-none">+</span>
        <span className="text-sm font-bold font-headline uppercase tracking-wider">New</span>
      </Link>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-high/90 backdrop-blur-xl px-6 py-3 flex justify-around items-center z-50 border-t border-outline-variant/10 shadow-[0_-8px_32px_rgba(0,0,0,0.2)]">
        {MOBILE_TABS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
            
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? "text-primary" : "text-on-surface-variant opacity-70"
              }`}
            >
              <Icon size={22} />
              <span className={`text-[10px] font-label uppercase ${isActive ? "font-bold" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
