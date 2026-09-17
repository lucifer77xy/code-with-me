"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DualTracker } from "@/components/dashboard/DualTracker";
import { JokeQuoteWidget } from "@/components/motivation/JokeQuoteWidget";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 pb-24 md:pb-12 max-w-full overflow-hidden">
          <DualTracker />
          <JokeQuoteWidget />
        </main>
      </div>

      <MobileNav />
      <ChatSidebar />
    </div>
  );
}
