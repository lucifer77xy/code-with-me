"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DualTracker } from "@/components/dashboard/DualTracker";
import { HistoryList } from "@/components/practice/HistoryList";
import { JokeQuoteWidget } from "@/components/motivation/JokeQuoteWidget";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import Link from "next/link";
import { Code2, ArrowRight, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 pb-24 md:pb-12 max-w-full overflow-hidden">
          <DualTracker />

          {/* Quick Pair Code Studio Callout */}
          <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-rose-950/40 p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-rose-600 p-3 text-white shadow-lg shadow-rose-500/20">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Live Collaborative Code Studio</h3>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    Realtime Sync
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Write code side-by-side with your partner with live presence, shared timer & instant history.
                </p>
              </div>
            </div>

            <Link
              href="/practice"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Open Code Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Live Shared History Feed */}
          <HistoryList maxItems={6} />

          <JokeQuoteWidget />
        </main>
      </div>


      <MobileNav />
      <ChatSidebar />
    </div>
  );
}
