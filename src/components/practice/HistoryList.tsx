"use client";

import React, { useState, useEffect } from "react";
import { PracticeHistory } from "@/types";
import { subscribePracticeHistory } from "@/lib/firestoreService";
import { formatSeconds, getRelativeTime } from "@/lib/utils";
import {
  History,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Check,
  Sparkles,
  Radio,
  ChevronDown,
  ChevronUp,
  User,
  Filter,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

interface HistoryListProps {
  initialItems?: PracticeHistory[];
  maxItems?: number;
  showFilters?: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  initialItems,
  maxItems,
  showFilters = true,
}) => {
  const [items, setItems] = useState<PracticeHistory[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialItems);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string>("all");

  // Sync with initialItems when provided from parent
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
      setIsLoading(false);
    }
  }, [initialItems]);

  // Subscribe to Firestore practice history
  useEffect(() => {
    const unsub = subscribePracticeHistory((history) => {
      if (history) {
        setItems(history);
        setIsLoading(false);
      }
    }, maxItems || 40);

    return () => unsub();
  }, [maxItems]);

  const handleCopyCode = (id: string, codeSnippet: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeSnippet);
      setCopiedId(id);
      toast.success("Code snippet copied to clipboard! 📋");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterUser === "all") return true;
    return item.display_name?.toLowerCase().includes(filterUser.toLowerCase());
  });

  const getStatusBadge = (status: PracticeHistory["status"]) => {
    switch (status) {
      case "completed":
      case "passed":
        return {
          label: "Completed",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "failed":
        return {
          label: "Needs Work",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        };
      default:
        return {
          label: "Saved",
          color: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        };
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-rose-600 p-2.5 text-white shadow-md">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live Practice Log & Solutions</h3>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firebase Realtime
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Completed challenges, solutions, and code history for both partners
            </p>
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1 text-xs">
              <button
                onClick={() => setFilterUser("all")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  filterUser === "all" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterUser("Alex")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  filterUser === "Alex" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Alex
              </button>
              <button
                onClick={() => setFilterUser("Sam")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  filterUser === "Sam" ? "bg-rose-500 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Sam
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center space-y-2">
            <Terminal className="h-6 w-6 text-slate-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Syncing practice history from Firebase...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center space-y-2">
            <Code2 className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No practice logs recorded yet</p>
            <p className="text-xs text-slate-500">
              Solve a challenge in the Pair Programming Studio to see code snippets appear here!
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const badge = getStatusBadge(item.status);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition-all hover:border-violet-500/30"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {item.challenge_title || "Code Session"}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {item.language && (
                        <span className="rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                          {item.language}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300 font-semibold">
                        <User className="h-3 w-3 text-rose-400" />
                        {item.display_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" />
                        {Math.round(item.timer_duration_seconds / 60)} mins
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">{getRelativeTime(item.completed_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyCode(item.id, item.code_snippet)}
                      className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                      title="Copy code"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex items-center gap-1 rounded-xl bg-violet-600/20 border border-violet-500/30 px-2.5 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600/40 transition-colors"
                    >
                      <span>{isExpanded ? "Hide Code" : "View Code"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Code Snippet Box */}
                {isExpanded && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/90 p-3.5 overflow-x-auto font-mono text-xs text-slate-200 shadow-inner animate-in fade-in">
                    <pre className="whitespace-pre">{item.code_snippet}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
