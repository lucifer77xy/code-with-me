"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { LiveTimer } from "./LiveTimer";
import { StatsCard } from "./StatsCard";
import { TaskTracker } from "@/components/tasks/TaskTracker";
import { formatSeconds, getRelativeTime } from "@/lib/utils";
import {
  Flame,
  Clock,
  Code2,
  Calendar,
  Sparkles,
  Radio,
  Heart,
  Send,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { QuickLogModal } from "./QuickLogModal";

export const DualTracker: React.FC = () => {
  const { currentUser, partnerUser, switchUser } = useAuth();
  const {
    sessions,
    partnerPresence,
    partnerTimerState,
    getPartnerStats,
    sendLoveNudge,
    saveCompletedSession,
  } = useSync();

  const [isManualLogOpen, setIsManualLogOpen] = useState(false);
  const [customNudgeMsg, setCustomNudgeMsg] = useState("");
  const [isSendingCustomNudge, setIsSendingCustomNudge] = useState(false);

  const myStats = getPartnerStats(currentUser.id);
  const partnerStats = getPartnerStats(partnerUser.id);

  const myRecentSessions = sessions
    .filter((s) => s.user_id === currentUser.id)
    .slice(0, 3);

  const partnerRecentSessions = sessions
    .filter((s) => s.user_id === partnerUser.id)
    .slice(0, 3);

  const isPartnerOnline = partnerPresence ? partnerPresence.online : true;
  const isPartnerCoding = partnerTimerState.isRunning;

  const handleSendCustomNudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNudgeMsg.trim()) return;
    sendLoveNudge(customNudgeMsg.trim(), "💌");
    setCustomNudgeMsg("");
    setIsSendingCustomNudge(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Couple Motto Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-violet-950/60 via-slate-900/80 to-rose-950/60 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-rose-500/20 px-3 py-0.5 text-xs font-semibold text-rose-300 border border-rose-500/30">
                Couple Coding Portal
              </span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Firebase Live Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent">
                {currentUser.name}
              </span>
              !
            </h1>
            <p className="text-sm text-slate-300 italic flex items-center gap-1.5">
              <span>&ldquo;{currentUser.motto}&rdquo;</span>
            </p>
          </div>

          {/* Quick manual log button & user switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManualLogOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold text-white border border-white/10 transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-rose-400" />
              Quick Log Session
            </button>
            <button
              onClick={() => switchUser()}
              className="flex items-center gap-1.5 rounded-2xl bg-violet-600/30 hover:bg-violet-600/50 px-3.5 py-2.5 text-xs font-semibold text-violet-200 border border-violet-500/30 transition-colors"
              title="Switch user to partner"
            >
              <RefreshCw className="h-3.5 w-3.5 text-violet-300" />
              <span>Switch to {partnerUser.name}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ======================================================== */}
        {/* LEFT COLUMN: MY PROGRESS (Active Partner) */}
        {/* ======================================================== */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="rounded-3xl border border-violet-500/20 bg-slate-900/70 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="h-14 w-14 rounded-2xl border-2 border-violet-500/40 bg-slate-800 object-cover p-0.5 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900 text-[9px] text-white">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                    <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300 border border-violet-500/30">
                      {currentUser.partner_label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <Wifi className="h-3 w-3" /> Online
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>
              </div>

              {/* Streak badge */}
              <div className="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-300">
                <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-extrabold">{myStats.streakDays} Day Streak</span>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <StatsCard title="Today" value={`${myStats.todayHours}h`} icon={Clock} accentColor="violet" />
              <StatsCard title="This Week" value={`${myStats.weekHours}h`} icon={Calendar} accentColor="violet" />
              <StatsCard title="Problems" value={myStats.problemsCount} icon={Code2} accentColor="violet" />
              <StatsCard title="Total Hours" value={`${myStats.totalHours}h`} icon={TrendingUp} accentColor="violet" />
            </div>
          </div>

          {/* Interactive Live Timer */}
          <LiveTimer />

          {/* Recent Coding Sessions (Left) */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">My Recent Sessions</h3>
              </div>
              <span className="text-[11px] text-slate-400">{myRecentSessions.length} sessions logged</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {myRecentSessions.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">
                  No sessions logged yet. Start the focus timer above!
                </p>
              ) : (
                myRecentSessions.map((session) => {
                  const duration = session.duration ?? session.duration_minutes ?? 0;
                  const problems = session.completedProblems ?? session.problems_completed ?? 0;
                  const createdAt = session.createdAt ?? session.created_at ?? new Date().toISOString();

                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3 hover:border-violet-500/30 transition-colors"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-white">{session.title}</h4>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-300">
                            {session.category || "Web Dev"}
                          </span>
                          <span>•</span>
                          <span>{duration} mins</span>
                          {problems > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">+{problems} problems</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{getRelativeTime(createdAt)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: PARTNER'S PROGRESS (Live Synchronized) */}
        {/* ======================================================== */}
        <div className="space-y-6">
          {/* Partner Profile Card */}
          <div className="rounded-3xl border border-rose-500/20 bg-slate-900/70 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={partnerUser.avatar_url}
                    alt={partnerUser.name}
                    className="h-14 w-14 rounded-2xl border-2 border-rose-500/40 bg-slate-800 object-cover p-0.5 shadow-md"
                  />
                  {isPartnerCoding ? (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
                    </span>
                  ) : isPartnerOnline ? (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900 text-[9px] text-white">
                      ✓
                    </span>
                  ) : (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 ring-2 ring-slate-900 text-[9px] text-slate-300">
                      💤
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{partnerUser.name}</h2>
                    <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300 border border-rose-500/30">
                      {partnerUser.partner_label}
                    </span>
                    {isPartnerOnline ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                        <Wifi className="h-3 w-3" /> Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <WifiOff className="h-3 w-3" /> Offline
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{partnerUser.email}</p>
                </div>
              </div>

              {/* Streak badge */}
              <div className="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-300">
                <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-extrabold">{partnerStats.streakDays} Day Streak</span>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <StatsCard title="Today" value={`${partnerStats.todayHours}h`} icon={Clock} accentColor="rose" />
              <StatsCard title="This Week" value={`${partnerStats.weekHours}h`} icon={Calendar} accentColor="rose" />
              <StatsCard title="Problems" value={partnerStats.problemsCount} icon={Code2} accentColor="rose" />
              <StatsCard title="Total Hours" value={`${partnerStats.totalHours}h`} icon={TrendingUp} accentColor="rose" />
            </div>
          </div>

          {/* Partner Live Activity Radar Card */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            {isPartnerCoding && (
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />
            )}

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-2 text-white shadow-sm">
                  <Radio className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Partner&apos;s Live Sync</h3>
                  <p className="text-[11px] text-slate-400">Real-time presence & active focus</p>
                </div>
              </div>

              {isPartnerCoding ? (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  CODING RIGHT NOW
                </span>
              ) : isPartnerOnline ? (
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/20">
                  Online & Active
                </span>
              ) : (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400 border border-white/5">
                  Resting / Away
                </span>
              )}
            </div>

            {/* Display active session details */}
            {isPartnerCoding ? (
              <div className="my-6 space-y-4 text-center">
                <div className="inline-block rounded-2xl bg-rose-500/10 border border-rose-500/30 px-4 py-1.5">
                  <span className="text-xs font-medium text-rose-300">
                    Topic: <strong className="text-white font-bold">{partnerTimerState.topic}</strong>
                  </span>
                </div>

                <div className="font-mono text-5xl sm:text-6xl font-black text-rose-400 tracking-tight">
                  {formatSeconds(partnerTimerState.seconds)}
                </div>

                <p className="text-xs text-slate-400">
                  Mode: <span className="uppercase text-slate-200 font-semibold">{partnerTimerState.mode}</span> • Category: <span className="text-slate-200 font-semibold">{partnerTimerState.category}</span>
                </p>
              </div>
            ) : (
              <div className="my-8 flex flex-col items-center justify-center text-center space-y-2">
                <div className="rounded-2xl bg-white/5 p-4 text-3xl">☕</div>
                <h4 className="text-sm font-semibold text-white">
                  {partnerUser.name} is currently resting
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Send a friendly nudge or love note to encourage your partner to join you for a session!
                </p>
              </div>
            )}

            {/* Interactive Cheer & Nudge Box */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                  Cheer on {partnerUser.name}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSendingCustomNudge(!isSendingCustomNudge)}
                  className="text-[11px] font-semibold text-violet-400 hover:text-violet-300"
                >
                  {isSendingCustomNudge ? "Quick Buttons" : "Custom Note"}
                </button>
              </div>

              {isSendingCustomNudge ? (
                <form onSubmit={handleSendCustomNudge} className="flex gap-2">
                  <input
                    type="text"
                    value={customNudgeMsg}
                    onChange={(e) => setCustomNudgeMsg(e.target.value)}
                    placeholder={`Say something sweet to ${partnerUser.name}...`}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => sendLoveNudge("You got this, baby! Proud of your hard work! 🚀💖", "💖")}
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 py-2 px-2 text-[11px] font-medium text-rose-200 transition-colors"
                  >
                    💖 Keep Going!
                  </button>
                  <button
                    onClick={() => sendLoveNudge("Hydration check! Drink water and rest your eyes 💧👀", "💧")}
                    className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 py-2 px-2 text-[11px] font-medium text-cyan-200 transition-colors"
                  >
                    💧 Water Break
                  </button>
                  <button
                    onClick={() => sendLoveNudge("Virtual coffee and warm hugs incoming! ☕🍪", "☕")}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 py-2 px-2 text-[11px] font-medium text-amber-200 transition-colors col-span-2 sm:col-span-1"
                  >
                    ☕ Coffee & Hug
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Partner's Recent Sessions (Right) */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">{partnerUser.name}&apos;s Recent Sessions</h3>
              </div>
              <span className="text-[11px] text-slate-400">{partnerRecentSessions.length} sessions logged</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {partnerRecentSessions.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">
                  No sessions recorded for {partnerUser.name} yet.
                </p>
              ) : (
                partnerRecentSessions.map((session) => {
                  const duration = session.duration ?? session.duration_minutes ?? 0;
                  const problems = session.completedProblems ?? session.problems_completed ?? 0;
                  const createdAt = session.createdAt ?? session.created_at ?? new Date().toISOString();

                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3 hover:border-rose-500/30 transition-colors"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-white">{session.title}</h4>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-300">
                            {session.category || "Web Dev"}
                          </span>
                          <span>•</span>
                          <span>{duration} mins</span>
                          {problems > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">+{problems} problems</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{getRelativeTime(createdAt)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shared Couple Tasks Section */}
      <TaskTracker />

      {/* Manual Quick Log Modal */}
      <QuickLogModal
        isOpen={isManualLogOpen}
        onClose={() => setIsManualLogOpen(false)}
        onSave={(session) => saveCompletedSession(session)}
        initialDurationMinutes={30}
        initialTopic="LeetCode & Code Review"
        initialCategory="Algorithms"
        initialMode="stopwatch"
      />
    </div>
  );
};
