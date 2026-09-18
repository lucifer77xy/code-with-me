"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { PracticeHistory, PracticeSession, PresenceUser } from "@/types";
import { generateUUID } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface UseRealtimePracticeOptions {
  roomId?: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  partnerLabel?: string;
}

const DEFAULT_CODE_SNIPPET = `// Pair Programming & Practice Session
// Topic: Two Sum Problem
// Write an algorithm to find indices of the two numbers such that they add up to target.

function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  
  return [];
}

// Test case:
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
`;

export function useRealtimePractice({
  roomId = "shared-practice-room",
  userId,
  displayName,
  avatarUrl,
  partnerLabel,
}: UseRealtimePracticeOptions) {
  const [code, setCode] = useState<string>(DEFAULT_CODE_SNIPPET);
  const [language, setLanguage] = useState<string>("typescript");
  const [challengeTitle, setChallengeTitle] = useState<string>("Two Sum Problem");
  
  // Synchronized Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Shared History & Active Session State
  const [historyList, setHistoryList] = useState<PracticeHistory[]>([]);
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  // Presence & Online status
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [partnerTyping, setPartnerTyping] = useState<{ isTyping: boolean; name: string } | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastCodeRef = useRef<string>(DEFAULT_CODE_SNIPPET);

  // 1. Initial Load of Practice History & Active Session from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      if (!isSupabaseConfigured() || !supabase) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        setIsLoadingHistory(true);

        // Fetch history ordered by newest first
        const { data: historyData, error: historyError } = await supabase
          .from("practice_history")
          .select("*")
          .order("completed_at", { ascending: false })
          .limit(30);

        if (historyError) {
          console.warn("Could not load practice_history from Supabase:", historyError.message);
        } else if (isMounted && historyData) {
          setHistoryList(historyData as PracticeHistory[]);
        }

        // Fetch active session for this room if exists
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("*")
          .eq("status", "active")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!sessionError && isMounted && sessionData) {
          setActiveSession(sessionData as PracticeSession);
          if (sessionData.code_snippet) {
            setCode(sessionData.code_snippet);
            lastBroadcastCodeRef.current = sessionData.code_snippet;
          }
          if (typeof sessionData.timer_duration_seconds === "number") {
            setTimerSeconds(sessionData.timer_duration_seconds);
          }
        }
      } catch (err) {
        console.error("Error loading initial practice data:", err);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // 2. Main Supabase Realtime Channel Subscription (Presence, Broadcast & Postgres Changes)
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsConnected(false);
      return;
    }

    const channelName = `realtime-practice-${roomId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: userId },
      },
    });

    channelRef.current = channel;

    // --- Presence Listeners ---
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.keys(state).forEach((key) => {
          const userArr = state[key] as any[];
          if (userArr && userArr.length > 0) {
            users.push(userArr[0] as unknown as PresenceUser);
          }
        });
        setPresenceUsers(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        if (newPresences && newPresences[0]) {
          const joinedUser = newPresences[0] as unknown as PresenceUser;
          if (joinedUser.userId !== userId) {
            toast.info(`${joinedUser.displayName || "Partner"} joined the session! 🚀`, {
              description: "Live collaboration is active.",
              duration: 3000,
            });
          }
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (leftPresences && leftPresences[0]) {
          const leftUser = leftPresences[0] as unknown as PresenceUser;
          if (leftUser.userId !== userId) {
            toast.info(`${leftUser.displayName || "Partner"} left the session. 👋`, {
              duration: 2500,
            });
          }
        }
      });

    // --- Broadcast Event Listeners ---
    channel
      // 1. Real-time Code Editor Sync
      .on("broadcast", { event: "CODE_UPDATE" }, (payload: { payload: any }) => {
        const data = payload.payload;
        if (data && data.senderId !== userId) {
          setCode(data.code);
          lastBroadcastCodeRef.current = data.code;
          if (data.language) setLanguage(data.language);
          if (data.challengeTitle) setChallengeTitle(data.challengeTitle);
        }
      })
      // 2. Typing Indicator
      .on("broadcast", { event: "TYPING_INDICATOR" }, (payload: { payload: any }) => {
        const data = payload.payload;
        if (data && data.senderId !== userId) {
          setPartnerTyping({ isTyping: data.isTyping, name: data.senderName });
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          if (data.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setPartnerTyping(null);
            }, 3000);
          }
        }
      })
      // 3. Real-time Timer State Sync
      .on("broadcast", { event: "TIMER_UPDATE" }, (payload: { payload: any }) => {
        const data = payload.payload;
        if (data && data.senderId !== userId) {
          setIsTimerRunning(data.isRunning);
          if (typeof data.seconds === "number") {
            setTimerSeconds(data.seconds);
          }
        }
      })
      // 4. Challenge Completion / Celebration Sync
      .on("broadcast", { event: "CHALLENGE_COMPLETED" }, (payload: { payload: any }) => {
        const data = payload.payload;
        if (data && data.senderId !== userId) {
          try {
            confetti({
              particleCount: 50,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#ec4899", "#8b5cf6", "#10b981", "#f59e0b"],
            });
          } catch (e) {}

          toast.success(`${data.senderName} completed the challenge! 🎉`, {
            description: `${data.challengeTitle || "Challenge"} finished in ${Math.round((data.timerDurationSeconds || 0) / 60)} mins!`,
            duration: 6000,
          });
        }
      })
      // 5. Profile Update Broadcast
      .on("broadcast", { event: "PROFILE_UPDATE" }, (payload: { payload: any }) => {
        const data = payload.payload;
        if (data && data.senderId !== userId) {
          toast.info(`${data.senderName || "Partner"} updated their profile! ✨`, {
            description: data.motto ? `"${data.motto}"` : undefined,
          });
        }
      });

    // --- Postgres Changes: Live Database Listeners ---
    // 1. practice_history table: INSERT, UPDATE, DELETE
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "practice_history" },
        (payload) => {
          const newRecord = payload.new as PracticeHistory;
          setHistoryList((prev) => {
            if (prev.some((item) => item.id === newRecord.id)) return prev;
            return [newRecord, ...prev];
          });
          if (newRecord.user_id !== userId) {
            toast.success(`New practice record saved by ${newRecord.display_name}! 📝`, {
              description: `${newRecord.challenge_title || "Code Session"} • Status: ${newRecord.status}`,
              icon: "✨",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "practice_history" },
        (payload) => {
          const updatedRecord = payload.new as PracticeHistory;
          setHistoryList((prev) =>
            prev.map((item) => (item.id === updatedRecord.id ? { ...item, ...updatedRecord } : item))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "practice_history" },
        (payload) => {
          const oldId = payload.old.id;
          setHistoryList((prev) => prev.filter((item) => item.id !== oldId));
        }
      )
      // 2. sessions table: Realtime updates on active session
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setActiveSession(null);
            return;
          }
          const session = payload.new as PracticeSession;
          setActiveSession(session);
        }
      );

    // Subscribe to channel and track presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        await channel.track({
          userId,
          displayName,
          avatarUrl: avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
          partnerLabel: partnerLabel || "Partner",
          isOnline: true,
          isCoding: true,
          isTyping: false,
          lastActive: new Date().toISOString(),
        });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setIsConnected(false);
      }
    });

    // Cleanup channel on unmount
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (channel) {
        channel.untrack();
        supabase?.removeChannel(channel);
      }
      channelRef.current = null;
    };
  }, [roomId, userId, displayName, avatarUrl, partnerLabel]);

  // 3. Wall-Clock Synchronized Timer Ticking
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Broadcast timer state periodically (heartbeat) if running
  useEffect(() => {
    if (!isTimerRunning || !channelRef.current || !isConnected) return;

    const heartbeat = setInterval(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "TIMER_UPDATE",
        payload: {
          senderId: userId,
          isRunning: true,
          seconds: timerSeconds,
        },
      });
    }, 4000);

    return () => clearInterval(heartbeat);
  }, [isTimerRunning, timerSeconds, userId, isConnected]);

  // --- ACTIONS EXPOSED TO COMPONENTS ---

  // Update Code with Live Realtime Broadcasting
  const updateCode = useCallback(
    (newCode: string, broadcast = true) => {
      setCode(newCode);
      lastBroadcastCodeRef.current = newCode;

      if (broadcast && channelRef.current && isConnected) {
        channelRef.current.send({
          type: "broadcast",
          event: "CODE_UPDATE",
          payload: {
            senderId: userId,
            senderName: displayName,
            code: newCode,
            language,
            challengeTitle,
            timestamp: Date.now(),
          },
        });

        // Also trigger typing pulse
        channelRef.current.send({
          type: "broadcast",
          event: "TYPING_INDICATOR",
          payload: {
            senderId: userId,
            senderName: displayName,
            isTyping: true,
          },
        });
      }
    },
    [userId, displayName, language, challengeTitle, isConnected]
  );

  // Timer Controls
  const startTimer = useCallback(
    (initialSecs?: number) => {
      const secs = typeof initialSecs === "number" ? initialSecs : timerSeconds;
      setIsTimerRunning(true);
      if (typeof initialSecs === "number") setTimerSeconds(initialSecs);

      if (channelRef.current && isConnected) {
        channelRef.current.send({
          type: "broadcast",
          event: "TIMER_UPDATE",
          payload: {
            senderId: userId,
            isRunning: true,
            seconds: secs,
          },
        });
      }
    },
    [timerSeconds, userId, isConnected]
  );

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);

    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: "broadcast",
        event: "TIMER_UPDATE",
        payload: {
          senderId: userId,
          isRunning: false,
          seconds: timerSeconds,
        },
      });
    }
  }, [timerSeconds, userId, isConnected]);

  const resetTimer = useCallback(
    (resetValue = 0) => {
      setIsTimerRunning(false);
      setTimerSeconds(resetValue);

      if (channelRef.current && isConnected) {
        channelRef.current.send({
          type: "broadcast",
          event: "TIMER_UPDATE",
          payload: {
            senderId: userId,
            isRunning: false,
            seconds: resetValue,
          },
        });
      }
    },
    [userId, isConnected]
  );

  // Broadcast Profile Updates
  const broadcastProfileUpdate = useCallback(
    (profileData: { name: string; motto?: string }) => {
      if (channelRef.current && isConnected) {
        channelRef.current.send({
          type: "broadcast",
          event: "PROFILE_UPDATE",
          payload: {
            senderId: userId,
            senderName: profileData.name,
            motto: profileData.motto,
          },
        });
      }
    },
    [userId, isConnected]
  );

  // Save Completed Challenge / Session to Supabase and Broadcast to Partner
  const saveCompletedPractice = useCallback(
    async (params?: {
      codeSnippet?: string;
      timerDurationSeconds?: number;
      status?: "completed" | "in_progress" | "passed" | "failed";
      challengeTitle?: string;
      language?: string;
    }) => {
      const snippet = params?.codeSnippet ?? code;
      const duration = params?.timerDurationSeconds ?? timerSeconds;
      const finalStatus = params?.status ?? "completed";
      const title = params?.challengeTitle ?? challengeTitle;
      const lang = params?.language ?? language;

      const newHistoryItem: PracticeHistory = {
        id: generateUUID(),
        user_id: userId,
        display_name: displayName,
        code_snippet: snippet,
        timer_duration_seconds: duration,
        completed_at: new Date().toISOString(),
        status: finalStatus,
        challenge_title: title,
        language: lang,
      };

      // 1. Optimistic UI Update on History List
      setHistoryList((prev) => [newHistoryItem, ...prev.filter((i) => i.id !== newHistoryItem.id)]);

      // 2. Confetti celebration
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#ec4899", "#8b5cf6", "#10b981", "#3b82f6"],
        });
      } catch (e) {}

      // 3. Broadcast completion to partner
      if (channelRef.current && isConnected) {
        channelRef.current.send({
          type: "broadcast",
          event: "CHALLENGE_COMPLETED",
          payload: {
            senderId: userId,
            senderName: displayName,
            challengeTitle: title,
            timerDurationSeconds: duration,
            status: finalStatus,
          },
        });
      }

      // 4. Persist to Supabase Database
      if (isSupabaseConfigured() && supabase) {
        try {
          // Insert into practice_history
          const { error: historyErr } = await supabase.from("practice_history").insert(newHistoryItem);
          if (historyErr) {
            console.error("Failed to insert practice_history:", historyErr);
            toast.error("Could not save challenge to Supabase: " + historyErr.message);
            return;
          }

          // Upsert or update active session
          const sessionPayload: Partial<PracticeSession> = {
            user_id: userId,
            display_name: displayName,
            code_snippet: snippet,
            timer_duration_seconds: duration,
            status: "completed",
            completed_at: new Date().toISOString(),
            challenge_title: title,
            language: lang,
            updated_at: new Date().toISOString(),
          };

          if (activeSession?.id) {
            await supabase.from("sessions").update(sessionPayload).eq("id", activeSession.id);
          } else {
            await supabase.from("sessions").insert({
              ...sessionPayload,
              id: generateUUID(),
            });
          }

          toast.success("Practice challenge saved to shared history! 🚀", {
            description: `Saved "${title}" (${Math.round(duration / 60)} mins) for both partners.`,
          });
        } catch (err: any) {
          console.error("Database persistence error:", err);
          toast.error("Failed to persist to database: " + (err?.message || "Unknown error"));
        }
      } else {
        toast.success("Challenge completed locally (Supabase not configured)!", {
          description: `Logged ${Math.round(duration / 60)} mins for "${title}".`,
        });
      }
    },
    [code, timerSeconds, challengeTitle, language, userId, displayName, isConnected, activeSession]
  );

  return {
    code,
    language,
    challengeTitle,
    timerSeconds,
    isTimerRunning,
    historyList,
    activeSession,
    isLoadingHistory,
    presenceUsers,
    partnerTyping,
    isConnected,
    updateCode,
    setLanguage,
    setChallengeTitle,
    startTimer,
    pauseTimer,
    resetTimer,
    broadcastProfileUpdate,
    saveCompletedPractice,
  };
}
