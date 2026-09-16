"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CodingCharts } from "@/components/analytics/CodingCharts";
import { WeakpointTracker } from "@/components/analytics/WeakpointTracker";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 pb-24 md:pb-12 max-w-full overflow-hidden">
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Performance Analytics & Radar
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Visualize your coding velocity, topic mastery distributions, and joint study momentum.
            </p>
          </div>

          <CodingCharts />
          <WeakpointTracker />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
