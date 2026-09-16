"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { BADGES } from "@/data/badges";
import { 
  Trophy, 
  Flame, 
  Clock, 
  Code2, 
  Sparkles, 
  HeartHandshake, 
  Lock, 
  CheckCircle2,
  Crown,
  Medal,
  Award
} from "lucide-react";

export const LeaderboardView: React.FC = () => {
  const { currentUser, partnerUser } = useAuth();
  const { getPartnerStats, userBadges } = useSync();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "badges">("leaderboard");

  const myStats = getPartnerStats(currentUser.id);
  const partnerStats = getPartnerStats(partnerUser.id);

  const myUnlockedBadges = userBadges[currentUser.id] || [];
  const partnerUnlockedBadges = userBadges[partnerUser.id] || [];

  const metrics = [
    {
      title: "Total Coding Hours",
      unit: "hours",
      myVal: myStats.totalHours,
      partnerVal: partnerStats.totalHours,
      icon: Clock,
      higherIsBetter: true,
    },
    {
      title: "Problems Solved",
      unit: "problems",
      myVal: myStats.problemsCount,
      partnerVal: partnerStats.problemsCount,
      icon: Code2,
      higherIsBetter: true,
    },
    {
      title: "Active Daily Streak",
      unit: "days",
      myVal: myStats.streakDays,
      partnerVal: partnerStats.streakDays,
      icon: Flame,
      higherIsBetter: true,
    },
    {
      title: "Badges Unlocked",
      unit: "badges",
      myVal: myUnlockedBadges.length,
      partnerVal: partnerUnlockedBadges.length,
      icon: Trophy,
      higherIsBetter: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex rounded-3xl border border-white/10 bg-slate-900/80 p-1.5 backdrop-blur-xl max-w-sm">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 rounded-2xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "leaderboard"
              ? "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Couple Rivalry</span>
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={`flex-1 rounded-2xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "badges"
              ? "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Badges Showcase</span>
        </button>
      </div>

      {activeTab === "leaderboard" ? (
        <div className="space-y-6">
          {/* Top Couple Champions Podium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* My Card */}
            <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-slate-950 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="h-14 w-14 rounded-2xl border-2 border-violet-500 bg-slate-800 object-cover"
                    />
                    <Crown className="absolute -top-3 -right-2 h-6 w-6 text-amber-400 rotate-12" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                        {currentUser.partner_label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Current View</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Points</span>
                  <div className="text-xl font-black text-violet-400">
                    {Math.round(myStats.totalHours * 10 + myStats.problemsCount * 5)}
                  </div>
                </div>
              </div>
            </div>

            {/* Partner's Card */}
            <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-950 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={partnerUser.avatar_url}
                      alt={partnerUser.name}
                      className="h-14 w-14 rounded-2xl border-2 border-rose-500 bg-slate-800 object-cover"
                    />
                    <Crown className="absolute -top-3 -right-2 h-6 w-6 text-amber-400 rotate-12" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{partnerUser.name}</h3>
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                        {partnerUser.partner_label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Partner</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Points</span>
                  <div className="text-xl font-black text-rose-400">
                    {Math.round(partnerStats.totalHours * 10 + partnerStats.problemsCount * 5)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Comparison Bars */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-4">
              Head-to-Head Stats Breakdown
            </h3>

            <div className="space-y-6">
              {metrics.map((m) => {
                const total = m.myVal + m.partnerVal || 1;
                const myPercent = Math.round((m.myVal / total) * 100);
                const partnerPercent = 100 - myPercent;

                return (
                  <div key={m.title} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-violet-300">
                        {currentUser.name}: {m.myVal} {m.unit}
                      </span>
                      <span className="font-bold text-slate-200">{m.title}</span>
                      <span className="font-semibold text-rose-300">
                        {partnerUser.name}: {m.partnerVal} {m.unit}
                      </span>
                    </div>

                    {/* Progress Bar comparing both */}
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 flex">
                      <div
                        style={{ width: `${myPercent}%` }}
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
                        title={`${currentUser.name}: ${myPercent}%`}
                      />
                      <div
                        style={{ width: `${partnerPercent}%` }}
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                        title={`${partnerUser.name}: ${partnerPercent}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Badges Showcase */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES.map((badge) => {
            const isUnlockedByMe = myUnlockedBadges.includes(badge.key);
            const isUnlockedByPartner = partnerUnlockedBadges.includes(badge.key);

            return (
              <div
                key={badge.id}
                className={`relative rounded-3xl border p-5 backdrop-blur-xl transition-all ${
                  isUnlockedByMe || isUnlockedByPartner
                    ? "border-white/15 bg-slate-900/80 shadow-lg"
                    : "border-white/5 bg-slate-950/40 opacity-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl p-0.5 shadow-md ${
                      isUnlockedByMe || isUnlockedByPartner
                        ? "bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 text-white"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                      {isUnlockedByMe || isUnlockedByPartner ? (
                        <Trophy className="h-6 w-6 text-amber-400" />
                      ) : (
                        <Lock className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Who unlocked it pill */}
                  <div className="flex -space-x-1.5">
                    {isUnlockedByMe && (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.name}
                        title={`Unlocked by ${currentUser.name}`}
                        className="h-6 w-6 rounded-full border border-violet-500 bg-slate-800"
                      />
                    )}
                    {isUnlockedByPartner && (
                      <img
                        src={partnerUser.avatar_url}
                        alt={partnerUser.name}
                        title={`Unlocked by ${partnerUser.name}`}
                        className="h-6 w-6 rounded-full border border-rose-500 bg-slate-800"
                      />
                    )}
                  </div>
                </div>

                <h4 className="mt-3 text-sm font-bold text-white">{badge.title}</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {badge.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-slate-500">
                  <span className="uppercase tracking-wider font-semibold">{badge.category}</span>
                  <span>
                    {isUnlockedByMe && isUnlockedByPartner
                      ? "Both Unlocked! 💖"
                      : isUnlockedByMe
                      ? `Unlocked by ${currentUser.name}`
                      : isUnlockedByPartner
                      ? `Unlocked by ${partnerUser.name}`
                      : "Locked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
