"use client";

import React, { useState, useEffect } from "react";
import { PracticeHistory } from "@/types";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
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
  Terminal
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
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // Sync with initialItems when provided from parent
  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
      setIsLoading(false);
    }
  }, [initialItems]);

  // Load from Supabase and subscribe to INSERT events if not provided or to ensure live updates
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured() || !client) {
      setIsLoading(false);
      return;
    }

    // If initialItems were not provided, fetch from DB
    if (!initialItems || initialItems.length === 0) {
      const fetchHistory = async () => {
        try {
          setIsLoading(true);
          const { data, error } = await client
            .from("practice_history")
            .select("*")
            .order("completed_at", { ascending: false })
            .limit(maxItems || 40);

          if (!error && data) {
            setItems(data as PracticeHistory[]);
          }
        } catch (err) {
          console.error("Error fetching practice history:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }

    // Set up standalone Supabase Realtime channel listening for INSERT on practice_history
    const channelName = "history-list-realtime-listener";
    const channel = client
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "practice_history" },
        (payload) => {
          const newRecord = payload.new as PracticeHistory;
          setItems((prev) => {
            if (prev.some((item) => item.id === newRecord.id)) return prev;
            return [newRecord, ...prev];
          });
          toast.success(`🎉 ${newRecord.display_name} finished a practice challenge!`, {
            description: `${newRecord.challenge_title || "Coding Challenge"} • ${Math.round(newRecord.timer_duration_seconds / 60)} mins`,
            icon: "⚡",
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "practice_history" },
        (payload) => {
          const updated = payload.new as PracticeHistory;
          setItems((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "practice_history" },
        (payload) => {
          const deletedId = payload.old.id;
          setItems((prev) => prev.filter((item) => item.id !== deletedId));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase?.removeChannel(channel);
    };
  }, [maxItems, initialItems]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.info("Code snippet copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const uniqueUsers = Array.from(new Set(items.map((i) => i.display_name).filter(Boolean)));

  const filteredItems = items.filter((item) => {
    if (filterUser !== "all" && item.display_name !== filterUser) return false;
    return true;
  });

  const displayList = maxItems ? filteredItems.slice(0, maxItems) : filteredItems;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-rose-600 p-2 text-white shadow-md">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live Practice History</h3>
              {isSubscribed && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-400" />
                  Realtime Sync
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Instant shared challenge completions & code solutions
            </p>
          </div>
        </div>

        {/* Filter by Partner */}
        {showFilters && uniqueUsers.length > 1 && (
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 px-2.5 py-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Partners</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user} className="bg-slate-900 text-white">
                  {user}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-sm animate-pulse flex flex-col items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-400 animate-spin" />
          <span>Loading shared practice records...</span>
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
            💻
          </div>
          <h4 className="text-sm font-semibold text-slate-200">No practice challenges logged yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Solve algorithms or write code together in the editor and click &ldquo;Complete Challenge&rdquo; to sync your shared history!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const durationFormatted = formatSeconds(entry.timer_duration_seconds);

            return (
              <div
                key={entry.id}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-slate-950/70 transition-all hover:border-violet-500/30"
              >
                {/* Item Summary Bar */}
                <div className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-bold">
                      {entry.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {entry.challenge_title || "Coding Challenge"}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {entry.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="text-violet-300 font-medium">{entry.display_name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {durationFormatted}
                        </span>
                        <span>•</span>
                        <span>{getRelativeTime(entry.completed_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Expand / Copy */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(entry.id, entry.code_snippet)}
                      className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                      title="Copy code snippet"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-[11px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="text-[11px] hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Terminal className="h-3.5 w-3.5 text-rose-400" />
                      <span className="text-[11px] font-medium">
                        {isExpanded ? "Hide Code" : "View Code"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Code Snippet Drawer */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-slate-950 p-4">
                    <div className="flex items-center justify-between pb-2 text-[11px] text-slate-400">
                      <span className="font-mono text-violet-300">
                        Language: {entry.language || "code"}
                      </span>
                      <span>{entry.code_snippet.split("\n").length} lines</span>
                    </div>
                    <pre className="max-h-64 overflow-x-auto rounded-xl border border-white/10 bg-slate-900/90 p-3 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
                      <code>{entry.code_snippet || "// No code saved for this session."}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
