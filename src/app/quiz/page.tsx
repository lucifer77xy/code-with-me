"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { QuizModule } from "@/components/quiz/QuizModule";
import { HelpCircle } from "lucide-react";

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 pb-24 md:pb-12 max-w-full overflow-hidden">
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 p-2 text-white">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Interactive Technical Quizzes
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Test each other across JavaScript, Python, DSA, SQL, and Web Development.
                </p>
              </div>
            </div>
          </div>

          <QuizModule />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
