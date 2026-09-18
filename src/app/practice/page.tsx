"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import { RealtimeCodeEditor } from "@/components/practice/RealtimeCodeEditor";
import { HistoryList } from "@/components/practice/HistoryList";
import { useRealtimePractice } from "@/lib/useRealtimePractice";
import { useAuth } from "@/context/AuthContext";
import { Radio, Users, Sparkles, Heart } from "lucide-react";

export default function PracticePage() {
  const { currentUser, partnerUser } = useAuth();

  const practiceHook = useRealtimePractice({
    roomId: "couple-practice-shared",
    userId: currentUser.id,
    displayName: currentUser.name,
    avatarUrl: currentUser.avatar_url,
    partnerLabel: currentUser.partner_label,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 pb-24 md:pb-12 max-w-full overflow-hidden">
          {/* Top Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-violet-950/60 via-slate-900/80 to-rose-950/60 p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-rose-500/20 px-3 py-0.5 text-xs font-semibold text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                    <Radio className="h-3 w-3 animate-pulse text-rose-400" />
                    Live Supabase Realtime Room
                  </span>
                  <span className="text-xs text-slate-400">
                    Shared WebSocket Collaboration
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Pair Programming Studio
                </h1>
                <p className="text-sm text-slate-300 flex items-center gap-1.5">
                  <span>Collaborating live with <strong>{partnerUser.name}</strong></span>
                  <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                </p>
              </div>

              {/* Presence summary counter */}
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5">
                <Users className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-semibold text-slate-200">
                  {practiceHook.presenceUsers.length || 1} Active in Session
                </span>
              </div>
            </div>
          </div>

          {/* Main Grid: Live Editor on Left/Top, Shared History on Right/Bottom */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-8 space-y-6">
              <RealtimeCodeEditor practiceHook={practiceHook} />
            </div>

            <div className="xl:col-span-4 space-y-6">
              <HistoryList initialItems={practiceHook.historyList} />
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
      <ChatSidebar />
    </div>
  );
}
