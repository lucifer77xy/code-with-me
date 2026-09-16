"use client";

import React from "react";
import { useSync } from "@/context/SyncContext";
import { Trophy, X, Sparkles, Award } from "lucide-react";

export const BadgeUnlockModal: React.FC = () => {
  const { recentlyUnlockedBadge, closeBadgeModal } = useSync();

  if (!recentlyUnlockedBadge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-rose-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center shadow-2xl shadow-rose-500/30">
        {/* Close button */}
        <button
          onClick={closeBadgeModal}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Glow & Badge Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 p-0.5 shadow-lg shadow-rose-500/40">
          <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-slate-950">
            <Trophy className="h-10 w-10 text-amber-400 animate-bounce" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/30">
            <Sparkles className="h-3 w-3 text-rose-400" />
            BADGE UNLOCKED!
          </span>
          <h3 className="text-xl font-black text-white">{recentlyUnlockedBadge.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {recentlyUnlockedBadge.description}
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={closeBadgeModal}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/30 hover:brightness-110 active:scale-95 transition-all"
          >
            Awesome! Keep Crushing It 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
