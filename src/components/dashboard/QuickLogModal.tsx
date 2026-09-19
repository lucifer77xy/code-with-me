"use client";

import React, { useState } from "react";
import { CodingSession } from "@/types";
import { X, CheckCircle2, Clock, Code2, Sparkles, BookOpen } from "lucide-react";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<CodingSession, "id" | "created_at" | "user_id">) => void;
  initialDurationMinutes?: number;
  initialTopic?: string;
  initialCategory?: CodingSession["category"];
  initialMode?: "stopwatch" | "pomodoro";
}

const CATEGORIES: CodingSession["category"][] = [
  "Algorithms",
  "Data Structures",
  "Web Dev",
  "System Design",
  "SQL / Database",
  "Other",
];

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDurationMinutes = 25,
  initialTopic = "",
  initialCategory = "Web Dev",
  initialMode = "pomodoro",
}) => {
  const [title, setTitle] = useState(initialTopic || "LeetCode & System Practice");
  const [category, setCategory] = useState<CodingSession["category"]>(initialCategory);
  const [durationMinutes, setDurationMinutes] = useState(Math.max(5, Math.round(initialDurationMinutes)));
  const [mode, setMode] = useState<"stopwatch" | "pomodoro">(initialMode);
  const [problemsCompleted, setProblemsCompleted] = useState(1);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      category,
      duration: Number(durationMinutes),
      duration_minutes: Number(durationMinutes),
      language: "typescript",
      mode,
      completedProblems: Number(problemsCompleted),
      problems_completed: Number(problemsCompleted),
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl shadow-rose-950/40 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 p-2 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Log Coding Session</h3>
              <p className="text-xs text-slate-400">Record your focus time & problem stats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Session Topic / Focus Area
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dynamic Programming (0/1 Knapsack)"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Category & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Mode</label>
              <div className="mt-1.5 flex rounded-xl border border-white/10 bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => setMode("pomodoro")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                    mode === "pomodoro"
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Pomodoro 🍅
                </button>
                <button
                  type="button"
                  onClick={() => setMode("stopwatch")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                    mode === "stopwatch"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Stopwatch ⏱️
                </button>
              </div>
            </div>
          </div>

          {/* Duration & Problems Solved */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Duration (Minutes)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">mins</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Problems Solved
              </label>
              <div className="relative mt-1.5 flex items-center">
                <button
                  type="button"
                  onClick={() => setProblemsCompleted(Math.max(0, problemsCompleted - 1))}
                  className="rounded-l-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min={0}
                  value={problemsCompleted}
                  onChange={(e) => setProblemsCompleted(Number(e.target.value))}
                  className="w-full border-y border-white/10 bg-slate-950 py-2.5 text-center text-sm text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setProblemsCompleted(problemsCompleted + 1)}
                  className="rounded-r-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Key Insights / Reflection
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn? Any tricky edge cases?"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Save Session & Boost Streak 🔥
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
