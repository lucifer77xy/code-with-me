"use client";

import React, { useState } from "react";
import { useSync } from "@/context/SyncContext";
import { formatSeconds } from "@/lib/utils";
import { CodingSession } from "@/types";
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Sparkles, Timer, Clock } from "lucide-react";
import { QuickLogModal } from "./QuickLogModal";

const CATEGORIES: CodingSession["category"][] = [
  "Algorithms",
  "Data Structures",
  "Web Dev",
  "System Design",
  "SQL / Database",
  "Other",
];

export const LiveTimer: React.FC = () => {
  const {
    isTimerRunning,
    timerMode,
    timerSeconds,
    pomodoroInitialMinutes,
    timerTopic,
    timerCategory,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    saveCompletedSession,
  } = useSync();

  const [inputTopic, setInputTopic] = useState(timerTopic);
  const [selectedCategory, setSelectedCategory] = useState<CodingSession["category"]>(timerCategory);
  const [selectedMode, setSelectedMode] = useState<"stopwatch" | "pomodoro">(timerMode);
  const [pomodoroMinutes, setPomodoroMinutes] = useState<number>(pomodoroInitialMinutes || 25);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Calculate elapsed time for logging
  const getElapsedMinutes = () => {
    if (timerMode === "pomodoro") {
      const elapsedSecs = Math.max(0, pomodoroMinutes * 60 - timerSeconds);
      return Math.max(1, Math.round(elapsedSecs / 60));
    } else {
      return Math.max(1, Math.round(timerSeconds / 60));
    }
  };

  const handleStartOrToggle = () => {
    if (!isTimerRunning) {
      if (timerSeconds === (timerMode === "pomodoro" ? pomodoroMinutes * 60 : 0)) {
        startTimer(inputTopic || "Focus Session", selectedCategory, selectedMode, pomodoroMinutes);
      } else {
        resumeTimer();
      }
    } else {
      pauseTimer();
    }
  };

  const handleModeChange = (mode: "stopwatch" | "pomodoro") => {
    if (isTimerRunning) return;
    setSelectedMode(mode);
    resetTimer();
  };

  const handlePresetSelect = (mins: number) => {
    if (isTimerRunning) return;
    setPomodoroMinutes(mins);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
      {/* Ambient background glow when active */}
      {isTimerRunning && (
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />
      )}

      {/* Header with Mode selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-rose-600 p-2 text-white">
            <Timer className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Focus Timer</h3>
            <p className="text-[11px] text-slate-400">Syncs your live status with partner</p>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1">
          <button
            onClick={() => handleModeChange("pomodoro")}
            disabled={isTimerRunning}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              selectedMode === "pomodoro"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white disabled:opacity-50"
            }`}
          >
            🍅 Pomodoro
          </button>
          <button
            onClick={() => handleModeChange("stopwatch")}
            disabled={isTimerRunning}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              selectedMode === "stopwatch"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white disabled:opacity-50"
            }`}
          >
            ⏱️ Stopwatch
          </button>
        </div>
      </div>

      {/* Presets (for Pomodoro) */}
      {selectedMode === "pomodoro" && !isTimerRunning && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-slate-400">Duration:</span>
          {[15, 25, 45, 50].map((mins) => (
            <button
              key={mins}
              onClick={() => handlePresetSelect(mins)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                pomodoroMinutes === mins
                  ? "border-rose-500/50 bg-rose-500/20 text-rose-300 font-semibold"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {/* Topic and category inputs */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            disabled={isTimerRunning}
            placeholder="Focus topic (e.g. LeetCode Medium, Next.js API)..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none disabled:opacity-75"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            disabled={isTimerRunning}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none disabled:opacity-75"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Big Digital Timer Display */}
      <div className="my-6 flex flex-col items-center justify-center">
        <div className="relative">
          <div
            className={`font-mono text-6xl sm:text-7xl font-black tracking-tight select-none transition-colors ${
              isTimerRunning
                ? "bg-gradient-to-r from-rose-400 via-pink-300 to-violet-400 bg-clip-text text-transparent animate-pulse-slow"
                : "text-slate-200"
            }`}
          >
            {formatSeconds(timerSeconds)}
          </div>
          {isTimerRunning && (
            <span className="absolute -top-2 -right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          )}
        </div>
        <span className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">
          {isTimerRunning
            ? `${selectedMode.toUpperCase()} IN PROGRESS`
            : "READY TO CODE"}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={handleStartOrToggle}
          className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
            isTimerRunning
              ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
              : "bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 hover:brightness-110 shadow-rose-500/25"
          }`}
        >
          {isTimerRunning ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" /> Start Coding
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="h-4 w-4 text-slate-400" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/20 px-5 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-sm shadow-emerald-500/20"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Complete & Log
        </button>
      </div>

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSave={(session) => {
          saveCompletedSession(session);
          resetTimer();
        }}
        initialDurationMinutes={getElapsedMinutes()}
        initialTopic={inputTopic}
        initialCategory={selectedCategory}
        initialMode={selectedMode}
      />
    </div>
  );
};
