"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsModal from "./settings-modal";
import {
  IconDashboard,
  IconTrackChanges,
  IconInsights,
  IconSettings,
  IconHistory,
} from "./icons";

const ICON_MAP: Record<string, typeof IconDashboard> = {
  dashboard: IconDashboard,
  track_changes: IconTrackChanges,
  insights: IconInsights,
  settings: IconSettings,
  history: IconHistory,
};

const SIDEBAR_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "Active Strategy", href: "/dashboard/strategy", icon: "insights" },
  { label: "History", href: "/dashboard/history", icon: "history" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col py-8 bg-surface-container-low z-40 border-r border-outline-variant/10">
      {/* User Info */}
      <div className="mt-20 px-6 mb-10">
        <div className="flex items-center gap-3 mb-6">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40" />
          </div>
          <div>
            <div className="text-lg font-headline font-bold text-white leading-tight">
              The Ethereal Ledger
            </div>
            <div className="text-xs text-on-surface-variant opacity-70">
              0x12...34
            </div>
          </div>
        </div>

        {/* New Goal CTA */}
        <Link
          href="/strategy"
          className="w-full py-3 bg-surface-container-highest hover:bg-surface-variant transition-all duration-300 rounded-xl flex items-center justify-center gap-2 text-primary font-bold text-sm"
        >
          <IconTrackChanges size={20} />
          New Goal
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 pr-4">
        {SIDEBAR_ITEMS.map(({ label, href, icon }) => {
          const isActive = pathname === href;
          const Icon = ICON_MAP[icon] || IconDashboard;

          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-4 py-3 px-6 rounded-r-full transition-all duration-300 ease-in-out ${
                isActive
                  ? "bg-surface-container-highest text-primary font-bold"
                  : "text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-variant"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings Button */}
      <div className="mt-auto mb-4 pr-4">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-4 py-3 px-6 rounded-r-full transition-all duration-300 ease-in-out text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-variant"
        >
          <IconSettings size={20} />
          <span>Settings</span>
        </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
}


