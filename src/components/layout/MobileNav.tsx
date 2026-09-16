"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, HelpCircle, Trophy, MessageSquareHeart } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tracker", icon: LayoutDashboard },
  { href: "/analytics", label: "Radar", icon: BarChart3 },
  { href: "/quiz", label: "Quiz", icon: HelpCircle },
  { href: "/leaderboard", label: "Rivalry", icon: Trophy },
  { href: "/notes", label: "Notes", icon: MessageSquareHeart },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl px-2 py-2">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all",
                isActive
                  ? "text-rose-400 bg-rose-500/10 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-rose-400" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
