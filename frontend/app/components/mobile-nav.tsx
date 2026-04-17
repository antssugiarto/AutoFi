"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconTrackChanges,
  IconInsights,
  IconSettings,
} from "./icons";

const MOBILE_TABS = [
  { label: "Overview", href: "/dashboard", icon: IconDashboard },
  { label: "Goals", href: "/goals", icon: IconTrackChanges },
  { label: "Analytics", href: "#", icon: IconInsights },
  { label: "Settings", href: "#", icon: IconSettings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-high/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center z-50">
      {MOBILE_TABS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? "text-primary" : "text-on-surface-variant opacity-70"
            }`}
          >
            <Icon size={24} />
            <span className={`text-[10px] font-label uppercase ${isActive ? "font-bold" : ""}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
