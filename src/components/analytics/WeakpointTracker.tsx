"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { Weakpoint } from "@/types";
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Heart,
  Sparkles,
  X,
  MessageSquareHeart,
  TrendingUp,
} from "lucide-react";

export const WeakpointTracker: React.FC = () => {
  const { currentUser, partnerUser } = useAuth();
  const { weakpoints, addWeakpoint, updateWeakpointStatus, addCheerToWeakpoint } = useSync();

  const [selectedUserFilter, setSelectedUserFilter] = useState<"all" | "mine" | "partner">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeCheerModalWp, setActiveCheerModalWp] = useState<Weakpoint | null>(null);
  const [cheerInput, setCheerInput] = useState("");

  // Form states for new weakpoint
  const [newTopic, setNewTopic] = useState("");
  const [newCategory, setNewCategory] = useState("Algorithms");
  const [newDifficulty, setNewDifficulty] = useState<Weakpoint["difficulty"]>("Medium");
  const [newCheer, setNewCheer] = useState("");

  const filteredWeakpoints = weakpoints.filter((wp) => {
    if (selectedUserFilter === "mine") return wp.user_id === currentUser.id;
    if (selectedUserFilter === "partner") return wp.user_id === partnerUser.id;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    void addWeakpoint(newTopic.trim(), newCategory, newDifficulty, newCheer.trim() || undefined);
    setNewTopic("");
    setNewCheer("");
    setIsAddModalOpen(false);
  };

  const handleCheerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheerModalWp || !cheerInput.trim()) return;

    void addCheerToWeakpoint(activeCheerModalWp.id, cheerInput.trim());
    setCheerInput("");
    setActiveCheerModalWp(null);
  };

  const getStatusBadge = (status: Weakpoint["status"]) => {
    switch (status) {
      case "needs_practice":
        return {
          label: "Needs Practice",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          icon: AlertCircle,
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: Clock,
        };
      case "mastered":
        return {
          label: "Mastered",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          icon: CheckCircle2,
        };
    }
  };

  const getDifficultyColor = (diff: Weakpoint["difficulty"]) => {
    switch (diff) {
      case "Easy":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Hard":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-violet-600 p-2.5 text-white">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Weakpoint Radar & Growth Tracker</h2>
            <p className="text-xs text-slate-400">
              Log tricky concepts, track improvement scores, and conquer roadblocks together
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User filter buttons */}
          <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1">
            <button
              onClick={() => setSelectedUserFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedUserFilter === "all" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setSelectedUserFilter("mine")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedUserFilter === "mine" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {currentUser.name}&apos;s List
            </button>
            <button
              onClick={() => setSelectedUserFilter("partner")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedUserFilter === "partner" ? "bg-rose-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {partnerUser.name}&apos;s List
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Weakpoint</span>
          </button>
        </div>
      </div>

      {/* Weakpoints Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWeakpoints.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-12 text-center">
            <Target className="mx-auto h-10 w-10 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No weakpoints in this view</p>
            <p className="text-xs text-slate-500 mt-1">
              Add a topic like &ldquo;Dynamic Programming&rdquo; or &ldquo;GraphQL Caching&rdquo; to track mastery.
            </p>
          </div>
        ) : (
          filteredWeakpoints.map((wp) => {
            const isMyTopic = wp.user_id === currentUser.id;
            const owner = isMyTopic ? currentUser : partnerUser;
            const score = wp.improvementScore ?? (wp.status === "mastered" ? 100 : wp.status === "in_progress" ? 60 : 25);

            return (
              <div
                key={wp.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl shadow-lg hover:border-violet-500/30 transition-all"
              >
                <div>
                  {/* Top line: owner + category + difficulty */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={owner.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(owner.name)}`}
                        alt={owner.name}
                        className="h-6 w-6 rounded-full border border-white/20 bg-slate-800"
                      />
                      <span className="text-xs font-semibold text-slate-300">{owner.name}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{wp.category}</span>
                    </div>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getDifficultyColor(
                        wp.difficulty
                      )}`}
                    >
                      {wp.difficulty}
                    </span>
                  </div>

                  {/* Topic Title */}
                  <h3 className="mt-3 text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                    {wp.topic}
                  </h3>

                  {/* Improvement Score Progress Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-cyan-400" />
                        Improvement Score
                      </span>
                      <span className="font-bold text-cyan-300">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Partner Cheer Note Bubble */}
                  {wp.partner_cheer && (
                    <div className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-200">
                      <Heart className="h-4 w-4 shrink-0 fill-rose-500 text-rose-500 mt-0.5" />
                      <div>
                        <span className="font-semibold text-rose-300">
                          {isMyTopic ? partnerUser.name : "Your"} Cheer:{" "}
                        </span>
                        <span className="italic">&ldquo;{wp.partner_cheer}&rdquo;</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom status & action controls */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                  {/* Status pills selector */}
                  <div className="flex items-center gap-1.5">
                    {(["needs_practice", "in_progress", "mastered"] as const).map((st) => {
                      const isActive = wp.status === st;
                      const cfg = getStatusBadge(st);
                      return (
                        <button
                          key={st}
                          onClick={() => updateWeakpointStatus(wp.id, st)}
                          className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                            isActive
                              ? `${cfg.color} shadow-sm`
                              : "border-white/5 bg-white/5 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Cheer button */}
                  <button
                    onClick={() => {
                      setActiveCheerModalWp(wp);
                      setCheerInput(wp.partner_cheer || "");
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <MessageSquareHeart className="h-3.5 w-3.5" />
                    <span>{wp.partner_cheer ? "Edit Cheer" : "Leave Cheer"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Weakpoint Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 p-2 text-white">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Add Tricky Topic / Weakpoint</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Topic / Concept Name</label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Dynamic Programming, Redux Middleware, Backtracking"
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Algorithms">Algorithms</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Web Dev">Web Dev</option>
                    <option value="System Design">System Design</option>
                    <option value="SQL / Database">SQL / Database</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as Weakpoint["difficulty"])}
                    className="mt-1.5 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Initial Encouragement / Note (Optional)
                </label>
                <input
                  type="text"
                  value={newCheer}
                  onChange={(e) => setNewCheer(e.target.value)}
                  placeholder="e.g. You solved 1 already, just need a bit more practice!"
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:brightness-110"
                >
                  Save to Radar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cheer Modal */}
      {activeCheerModalWp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                <h3 className="text-base font-bold text-white">Cheer On Your Partner</h3>
              </div>
              <button
                onClick={() => setActiveCheerModalWp(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCheerSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-slate-300">
                Topic: <strong className="text-white">{activeCheerModalWp.topic}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Your Encouraging Words</label>
                <textarea
                  required
                  rows={3}
                  value={cheerInput}
                  onChange={(e) => setCheerInput(e.target.value)}
                  placeholder="e.g. You got this, honey! Take it step-by-step 💖"
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-slate-950 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveCheerModalWp(null)}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:brightness-110"
                >
                  Attach Cheer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
