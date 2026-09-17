"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Timer, 
  Trophy, 
  BarChart2, 
  HelpCircle,
  Flame,
  CheckCircle2
} from "lucide-react";

export default function HomePage() {
  const { currentUser, partnerUser, switchUser } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex flex-col justify-between">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-tr from-violet-600/20 via-pink-600/20 to-rose-600/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-rose-600 p-0.5 shadow-lg shadow-rose-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            CodeTogether
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
          >
            Switch Account
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:brightness-110 transition-all"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-300 mb-6 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <span>The Pair-Programming & Growth Portal for Couples</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Code Together.{" "}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            Grow Together.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A synchronized developer dashboard built for two. Track live coding sessions, cheer each other on, crush algorithmic weakpoints, challenge technical quizzes, and conquer your career goals hand-in-hand.
        </p>

        {/* Enter as user pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Enter Live Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Couple Profile Cards Showcase */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          {/* Partner 1 Card */}
          <div className="rounded-3xl border border-violet-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                alt={currentUser.name}
                className="h-14 w-14 rounded-2xl border-2 border-violet-500/50 bg-slate-800 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{currentUser.name}</h3>
                  <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                    {currentUser.partner_label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser.motto}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Flame className="h-3.5 w-3.5 fill-amber-400" /> {currentUser.current_streak}d streak
                  </span>
                  <span>•</span>
                  <span>{currentUser.total_hours}h total</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="rounded-xl bg-violet-600/30 border border-violet-500/30 px-3 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-600/50 transition-colors"
            >
              Enter as {currentUser.name}
            </Link>
          </div>

          {/* Partner 2 Card */}
          <div className="rounded-3xl border border-rose-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={partnerUser.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(partnerUser.name)}`}
                alt={partnerUser.name}
                className="h-14 w-14 rounded-2xl border-2 border-rose-500/50 bg-slate-800 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{partnerUser.name}</h3>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                    {partnerUser.partner_label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{partnerUser.motto}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Flame className="h-3.5 w-3.5 fill-amber-400" /> {partnerUser.current_streak}d streak
                  </span>
                  <span>•</span>
                  <span>{partnerUser.total_hours}h total</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                switchUser(partnerUser.id);
              }}
              className="rounded-xl bg-rose-600/30 border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-600/50 transition-colors"
            >
              Enter as {partnerUser.name}
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <Radio className="mx-auto h-6 w-6 text-rose-400" />
            <h4 className="mt-2 text-xs font-bold text-white">Live Sync Dashboard</h4>
            <p className="text-[11px] text-slate-400 mt-1">Realtime dual presence & timers</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <BarChart2 className="mx-auto h-6 w-6 text-violet-400" />
            <h4 className="mt-2 text-xs font-bold text-white">Weakpoint Radar</h4>
            <p className="text-[11px] text-slate-400 mt-1">Status pipeline for hard topics</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <HelpCircle className="mx-auto h-6 w-6 text-cyan-400" />
            <h4 className="mt-2 text-xs font-bold text-white">Interactive Quizzes</h4>
            <p className="text-[11px] text-slate-400 mt-1">5 full categories with timer</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <Trophy className="mx-auto h-6 w-6 text-amber-400" />
            <h4 className="mt-2 text-xs font-bold text-white">Rivalry & Badges</h4>
            <p className="text-[11px] text-slate-400 mt-1">10 unlockable achievements</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 p-6 text-center text-xs text-slate-500">
        CodeTogether © {new Date().getFullYear()} • Built with Next.js 14, Supabase, Tailwind CSS, Recharts & Framer Motion
      </footer>
    </div>
  );
}
