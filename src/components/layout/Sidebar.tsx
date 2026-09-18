"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { 
  LayoutDashboard, 
  BarChart3, 
  HelpCircle, 
  Trophy, 
  MessageSquareHeart, 
  Flame, 
  Clock, 
  Sparkles,
  Heart,
  Code2
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dual Tracker",
    icon: LayoutDashboard,
    badge: "Live",
  },
  {
    href: "/practice",
    label: "Pair Code Room",
    icon: Code2,
    badge: "Sync",
  },
  {
    href: "/analytics",
    label: "Analytics & Radar",
    icon: BarChart3,
  },
  {
    href: "/quiz",
    label: "Interactive Quizzes",
    icon: HelpCircle,
    badge: "5 Topics",
  },
  {
    href: "/leaderboard",
    label: "Rivalry & Badges",
    icon: Trophy,
  },
  {
    href: "/notes",
    label: "Love Notes & Memes",
    icon: MessageSquareHeart,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, partnerUser } = useAuth();
  const { getPartnerStats } = useSync();

  const myStats = getPartnerStats(currentUser.id);
  const partnerStats = getPartnerStats(partnerUser.id);
  const jointHours = (myStats.totalHours + partnerStats.totalHours).toFixed(1);

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-white/10 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-rose-600/20 text-white border border-rose-500/30 shadow-sm shadow-rose-500/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-rose-400" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isActive
                        ? "bg-rose-500/30 text-rose-300 border border-rose-500/40"
                        : "bg-white/5 text-slate-400 border border-white/5"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Couple Goal Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-rose-950/30 p-3.5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Couple Weekly Goal</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-400">
              {jointHours} / 60h
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (parseFloat(jointHours) / 60) * 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            You two have logged <strong className="text-rose-300">{jointHours} hours</strong> together this week! Keep crushing goals together.
          </p>
        </div>
      </div>

      {/* Footer Couple Card */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-3 flex items-center gap-3">
        <div className="flex -space-x-2 overflow-hidden">
          <img
            src={currentUser.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
            alt={currentUser.name}
            className="inline-block h-8 w-8 rounded-full ring-2 ring-violet-500/60 bg-slate-800"
          />
          <img
            src={partnerUser.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(partnerUser.name)}`}
            alt={partnerUser.name}
            className="inline-block h-8 w-8 rounded-full ring-2 ring-rose-500/60 bg-slate-800"
          />
        </div>
        <div className="flex flex-col text-xs">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-200">
              {currentUser.name} & {partnerUser.name}
            </span>
            <Heart className="h-3 w-3 fill-rose-500 text-rose-500 inline" />
          </div>
          <span className="text-[11px] text-slate-400">
            {myStats.streakDays}d & {partnerStats.streakDays}d streaks 🔥
          </span>
        </div>
      </div>
    </aside>
  );
};
