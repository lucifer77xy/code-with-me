"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { CodingSession, Weakpoint, CoupleNote, Badge, LiveSyncMessage } from "@/types";
import { hasLegacySeedData, INITIAL_SESSIONS, INITIAL_WEAKPOINTS, INITIAL_NOTES } from "@/data/initialData";
import { BADGES } from "@/data/badges";
import { useAuth } from "./AuthContext";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { generateUUID } from "@/lib/utils";

interface SyncContextType {
  // Sessions
  sessions: CodingSession[];
  saveCompletedSession: (session: Omit<CodingSession, "id" | "created_at" | "user_id">) => Promise<void>;
  
  // Timer
  isTimerRunning: boolean;
  timerMode: "stopwatch" | "pomodoro";
  timerSeconds: number; // For stopwatch: elapsed; For pomodoro: remaining
  pomodoroInitialMinutes: number;
  timerTopic: string;
  timerCategory: CodingSession["category"];
  startTimer: (topic: string, category: CodingSession["category"], mode?: "stopwatch" | "pomodoro", pMinutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  
  // Partner's live timer status
  partnerTimerState: {
    isRunning: boolean;
    mode: "stopwatch" | "pomodoro";
    topic: string;
    category: string;
    seconds: number;
    startedAt?: string;
  };

  // Weakpoints
  weakpoints: Weakpoint[];
  addWeakpoint: (topic: string, category: string, difficulty: Weakpoint["difficulty"], cheer?: string) => Promise<void>;
  updateWeakpointStatus: (id: string, status: Weakpoint["status"]) => Promise<void>;
  addCheerToWeakpoint: (id: string, cheer: string) => Promise<void>;

  // Notes & Nudges
  notes: CoupleNote[];
  sendNote: (message: string, noteType?: CoupleNote["note_type"], emoji?: string) => Promise<void>;
  markNoteRead: (id: string) => Promise<void>;
  sendLoveNudge: (customMessage?: string, emoji?: string) => void;

  // Badges & Gamification
  userBadges: Record<string, string[]>; // userId -> badge_keys[]
  unlockBadge: (userId: string, badgeKey: string) => void;
  recentlyUnlockedBadge: Badge | null;
  closeBadgeModal: () => void;

  // Stats calculation
  getPartnerStats: (userId: string) => {
    todayHours: number;
    weekHours: number;
    streakDays: number;
    problemsCount: number;
    totalHours: number;
  };
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSIONS = "codetogether_sessions";
const LOCAL_STORAGE_WEAKPOINTS = "codetogether_weakpoints";
const LOCAL_STORAGE_NOTES = "codetogether_notes";
const LOCAL_STORAGE_BADGES = "codetogether_badges";

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, partnerUser, updateProfile, isSupabaseActive } = useAuth();

  const [sessions, setSessions] = useState<CodingSession[]>(INITIAL_SESSIONS);
  const [weakpoints, setWeakpoints] = useState<Weakpoint[]>(INITIAL_WEAKPOINTS);
  const [notes, setNotes] = useState<CoupleNote[]>(INITIAL_NOTES);
  const [userBadges, setUserBadges] = useState<Record<string, string[]>>({});
  const [recentlyUnlockedBadge, setRecentlyUnlockedBadge] = useState<Badge | null>(null);

  // Active user's timer
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<"stopwatch" | "pomodoro">("pomodoro");
  const [pomodoroInitialMinutes, setPomodoroInitialMinutes] = useState<number>(25);
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerTopic, setTimerTopic] = useState<string>("");
  const [timerCategory, setTimerCategory] = useState<CodingSession["category"]>("Web Dev");

  // Partner's live timer state
  const [partnerTimerState, setPartnerTimerState] = useState<{
    isRunning: boolean;
    mode: "stopwatch" | "pomodoro";
    topic: string;
    category: string;
    seconds: number;
    startedAt?: string;
  }>({
    isRunning: partnerUser.is_coding_now,
    mode: partnerUser.active_session_mode || "pomodoro",
    topic: partnerUser.active_session_topic || "",
    category: "Web Dev",
    seconds: partnerUser.active_session_seconds || 0,
    startedAt: partnerUser.active_session_started_at || undefined,
  });

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const timerLastUpdatedAtRef = useRef<number | null>(null);

  // Initialize BroadcastChannel for cross-tab realtime sync
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("codetogether_sync_channel");
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const msg: LiveSyncMessage = event.data;
        handleIncomingSync(msg);
      };

      return () => {
        channel.close();
      };
    }
  }, [currentUser.id]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(LOCAL_STORAGE_SESSIONS);
      const savedWeakpoints = localStorage.getItem(LOCAL_STORAGE_WEAKPOINTS);
      const savedNotes = localStorage.getItem(LOCAL_STORAGE_NOTES);
      const savedBadges = localStorage.getItem(LOCAL_STORAGE_BADGES);

      const savedState = [savedSessions, savedWeakpoints, savedNotes, savedBadges];
      if (savedState.some(hasLegacySeedData)) {
        localStorage.removeItem(LOCAL_STORAGE_SESSIONS);
        localStorage.removeItem(LOCAL_STORAGE_WEAKPOINTS);
        localStorage.removeItem(LOCAL_STORAGE_NOTES);
        localStorage.removeItem(LOCAL_STORAGE_BADGES);
        return;
      }

      if (savedSessions) setSessions(JSON.parse(savedSessions));
      if (savedWeakpoints) setWeakpoints(JSON.parse(savedWeakpoints));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedBadges) setUserBadges(JSON.parse(savedBadges));
    } catch (e) {
      console.error("Failed loading local state", e);
    }
  }, []);

  // Set up Supabase Realtime subscription if available
  useEffect(() => {
    if (!isSupabaseActive || !supabase) return;

    const channel = supabase
      .channel("public-realtime-room")
      .on("broadcast", { event: "sync-event" }, (payload) => {
        handleIncomingSync(payload.payload as LiveSyncMessage);
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [isSupabaseActive, currentUser.id]);

  const broadcastMessage = (msg: Omit<LiveSyncMessage, "senderId" | "timestamp">) => {
    const fullMsg: LiveSyncMessage = {
      ...msg,
      senderId: currentUser.id,
      timestamp: Date.now(),
    };

    // Broadcast through Web BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(fullMsg);
    }

    // Broadcast through Supabase if connected
    if (isSupabaseActive && supabase) {
      supabase.channel("public-realtime-room").send({
        type: "broadcast",
        event: "sync-event",
        payload: fullMsg,
      });
    }
  };

  const handleIncomingSync = (msg: LiveSyncMessage) => {
    if (msg.senderId === currentUser.id) return; // ignore our own reflections

    switch (msg.type) {
      case "TIMER_UPDATE":
        setPartnerTimerState({
          isRunning: msg.payload.isRunning,
          mode: msg.payload.mode,
          topic: msg.payload.topic,
          category: msg.payload.category,
          seconds: msg.payload.seconds,
          startedAt: msg.payload.startedAt,
        });
        break;

      case "TIMER_STOP":
        setPartnerTimerState((prev) => ({
          ...prev,
          isRunning: false,
        }));
        break;

      case "NUDGE":
        triggerFloatingHearts();
        toast(msg.payload.message || "Your partner sent you some love! 💖", {
          icon: msg.payload.emoji || "💖",
          description: `From ${partnerUser.name}: Keep going, you're doing amazing!`,
          duration: 5000,
        });
        break;

      case "SESSION_SAVED":
        setSessions((prev) => [msg.payload, ...prev]);
        toast.success(`${partnerUser.name} just completed a coding session! 🎉`, {
          description: `${msg.payload.title} (${msg.payload.duration_minutes} mins)`,
        });
        break;

      case "WEAKPOINT_UPDATE":
        setWeakpoints(msg.payload);
        break;

      default:
        break;
    }
  };

  // Trigger confetti and floating hearts
  const triggerFloatingHearts = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#ec4899", "#8b5cf6", "#f43f5e", "#a855f7"],
        shapes: ["circle"],
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Use elapsed wall-clock time so browser timer throttling does not pause the timer.
  useEffect(() => {
    if (!isTimerRunning) {
      timerLastUpdatedAtRef.current = null;
      return;
    }

    timerLastUpdatedAtRef.current = Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const lastUpdatedAt = timerLastUpdatedAtRef.current;
      if (lastUpdatedAt === null) {
        timerLastUpdatedAtRef.current = now;
        return;
      }

      const elapsedSeconds = Math.floor((now - lastUpdatedAt) / 1000);
      if (elapsedSeconds <= 0) return;
      timerLastUpdatedAtRef.current = lastUpdatedAt + elapsedSeconds * 1000;

      setTimerSeconds((prev) => {
        if (timerMode === "pomodoro") {
          const nextSeconds = Math.max(0, prev - elapsedSeconds);
          if (nextSeconds === 0) {
            setIsTimerRunning(false);
            triggerFloatingHearts();
            toast.success("Pomodoro Focus Interval Complete! 🍅🎉", {
              description: "Great focus! Log your session or take a 5 min break with your partner.",
            });
            broadcastMessage({
              type: "TIMER_STOP",
              payload: {},
            });
          }
          return nextSeconds;
        }

        return prev + elapsedSeconds;
      });
    };

    const interval = setInterval(updateTimer, 1000);
    document.addEventListener("visibilitychange", updateTimer);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", updateTimer);
    };
  }, [isTimerRunning, timerMode]);

  // Periodic partner timer heartbeat broadcast when running
  useEffect(() => {
    if (!isTimerRunning) return;

    const heartbeat = setInterval(() => {
      broadcastMessage({
        type: "TIMER_UPDATE",
        payload: {
          isRunning: true,
          mode: timerMode,
          topic: timerTopic,
          category: timerCategory,
          seconds: timerSeconds,
          startedAt: new Date().toISOString(),
        },
      });
    }, 3000);

    return () => clearInterval(heartbeat);
  }, [isTimerRunning, timerMode, timerTopic, timerCategory, timerSeconds]);

  const startTimer = (topic: string, category: CodingSession["category"], mode: "stopwatch" | "pomodoro" = timerMode, pMinutes: number = pomodoroInitialMinutes) => {
    setTimerTopic(topic);
    setTimerCategory(category);
    setTimerMode(mode);
    setPomodoroInitialMinutes(pMinutes);

    const initialSecs = mode === "pomodoro" ? pMinutes * 60 : 0;
    setTimerSeconds(initialSecs);
    setIsTimerRunning(true);

    updateProfile({
      is_coding_now: true,
      active_session_topic: topic,
      active_session_mode: mode,
      active_session_started_at: new Date().toISOString(),
    });

    broadcastMessage({
      type: "TIMER_UPDATE",
      payload: {
        isRunning: true,
        mode,
        topic,
        category,
        seconds: initialSecs,
      },
    });

    toast.info(`Timer started: ${topic}`, {
      description: mode === "pomodoro" ? `${pMinutes} min Pomodoro Focus mode` : "Stopwatch tracking mode",
      icon: "⏱️",
    });
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    updateProfile({ is_coding_now: false });
    broadcastMessage({
      type: "TIMER_STOP",
      payload: {},
    });
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
    updateProfile({ is_coding_now: true });
    broadcastMessage({
      type: "TIMER_UPDATE",
      payload: {
        isRunning: true,
        mode: timerMode,
        topic: timerTopic,
        category: timerCategory,
        seconds: timerSeconds,
      },
    });
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    const secs = timerMode === "pomodoro" ? pomodoroInitialMinutes * 60 : 0;
    setTimerSeconds(secs);
    updateProfile({ is_coding_now: false, active_session_topic: null });
    broadcastMessage({
      type: "TIMER_STOP",
      payload: {},
    });
  };

  const saveCompletedSession = async (sessionData: Omit<CodingSession, "id" | "created_at" | "user_id">) => {
    const newSession: CodingSession = {
      ...sessionData,
      id: generateUUID(),
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
    };

    const nextSessions = [newSession, ...sessions];
    setSessions(nextSessions);
    try {
      localStorage.setItem(LOCAL_STORAGE_SESSIONS, JSON.stringify(nextSessions));
    } catch (e) {
      console.error(e);
    }

    // Update profile total hours and problems
    const hoursAdded = sessionData.duration_minutes / 60;
    const newTotalHours = Number((currentUser.total_hours + hoursAdded).toFixed(2));
    const newProblemsSolved = currentUser.problems_solved + sessionData.problems_completed;

    await updateProfile({
      total_hours: newTotalHours,
      problems_solved: newProblemsSolved,
      is_coding_now: false,
      active_session_topic: null,
    });

    // Check badges
    if (newTotalHours >= 10) unlockBadge(currentUser.id, "first_10_hours");
    if (newProblemsSolved >= 30) unlockBadge(currentUser.id, "problem_crusher");

    // Check Night Owl (after 11 PM)
    const currentHour = new Date().getHours();
    if (currentHour >= 23 || currentHour < 4) {
      unlockBadge(currentUser.id, "night_owl");
    }

    // Check Early Bird (before 9 AM)
    if (currentHour >= 5 && currentHour < 9) {
      unlockBadge(currentUser.id, "early_bird");
    }

    // Check Power Couple
    const partnerCodedToday = sessions.some(
      (s) => s.user_id === partnerUser.id && new Date(s.created_at).toDateString() === new Date().toDateString()
    );
    if (partnerCodedToday) {
      unlockBadge(currentUser.id, "power_couple");
      unlockBadge(partnerUser.id, "power_couple");
    }

    // Supabase persist
    if (isSupabaseActive && supabase) {
      try {
        await supabase.from("coding_sessions").insert(newSession);
      } catch (e) {
        console.error(e);
      }
    }

    broadcastMessage({
      type: "SESSION_SAVED",
      payload: newSession,
    });

    triggerFloatingHearts();
    toast.success("Session saved successfully! 🚀", {
      description: `Logged ${sessionData.duration_minutes} mins (+${sessionData.problems_completed} problems)`,
    });
  };

  const addWeakpoint = async (topic: string, category: string, difficulty: Weakpoint["difficulty"], cheer?: string) => {
    const newWp: Weakpoint = {
      id: generateUUID(),
      user_id: currentUser.id,
      topic,
      category,
      difficulty,
      status: "needs_practice",
      partner_cheer: cheer,
      created_at: new Date().toISOString(),
    };

    const updated = [newWp, ...weakpoints];
    setWeakpoints(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_WEAKPOINTS, JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseActive && supabase) {
      try {
        await supabase.from("weakpoints").insert(newWp);
      } catch (e) {}
    }

    broadcastMessage({
      type: "WEAKPOINT_UPDATE",
      payload: updated,
    });

    toast.success("Weakpoint added to your radar! 🎯", {
      description: "Track your progress as you practice and master this topic.",
    });
  };

  const updateWeakpointStatus = async (id: string, status: Weakpoint["status"]) => {
    const updated = weakpoints.map((w) => (w.id === id ? { ...w, status, updated_at: new Date().toISOString() } : w));
    setWeakpoints(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_WEAKPOINTS, JSON.stringify(updated));
    } catch (e) {}

    if (status === "mastered") {
      triggerFloatingHearts();
      unlockBadge(currentUser.id, "recursion_master");
      toast.success("Topic Mastered! Outstanding work! 🏆✨");
    }

    if (isSupabaseActive && supabase) {
      try {
        await supabase.from("weakpoints").update({ status }).eq("id", id);
      } catch (e) {}
    }

    broadcastMessage({
      type: "WEAKPOINT_UPDATE",
      payload: updated,
    });
  };

  const addCheerToWeakpoint = async (id: string, cheer: string) => {
    const updated = weakpoints.map((w) => (w.id === id ? { ...w, partner_cheer: cheer } : w));
    setWeakpoints(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_WEAKPOINTS, JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseActive && supabase) {
      try {
        await supabase.from("weakpoints").update({ partner_cheer: cheer }).eq("id", id);
      } catch (e) {}
    }

    broadcastMessage({
      type: "WEAKPOINT_UPDATE",
      payload: updated,
    });

    toast.success("Encouragement note attached! 💖");
  };

  const sendNote = async (message: string, noteType: CoupleNote["note_type"] = "love_note", emoji = "💖") => {
    const newNote: CoupleNote = {
      id: generateUUID(),
      sender_id: currentUser.id,
      receiver_id: partnerUser.id,
      message,
      note_type: noteType,
      emoji,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTES, JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseActive && supabase) {
      try {
        await supabase.from("couple_notes").insert(newNote);
      } catch (e) {}
    }

    broadcastMessage({
      type: "NUDGE",
      payload: {
        message,
        emoji,
      },
    });

    triggerFloatingHearts();
    toast.success("Sent with love! 💌");
  };

  const markNoteRead = async (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setNotes(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTES, JSON.stringify(updated));
    } catch (e) {}
  };

  const sendLoveNudge = (customMessage?: string, emoji = "💖") => {
    const defaultMessages = [
      "You got this, baby! Proud of your hard work! 🚀💖",
      "Hydration reminder! Drink some water and stretch 💧🧘‍♀️",
      "Sending you coffee & virtual kisses! ☕💋",
      "One bug at a time! Take a deep breath ✨",
    ];
    const chosen = customMessage || defaultMessages[Math.floor(Math.random() * defaultMessages.length)];

    broadcastMessage({
      type: "NUDGE",
      payload: {
        message: chosen,
        emoji,
      },
    });

    triggerFloatingHearts();
    toast.success(`Nudge sent to ${partnerUser.name}! 🚀`, {
      description: chosen,
      icon: emoji,
    });
  };

  const unlockBadge = (userId: string, badgeKey: string) => {
    const currentList = userBadges[userId] || [];
    if (!currentList.includes(badgeKey)) {
      const updated = {
        ...userBadges,
        [userId]: [...currentList, badgeKey],
      };
      setUserBadges(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_BADGES, JSON.stringify(updated));
      } catch (e) {}

      const foundBadge = BADGES.find((b) => b.key === badgeKey);
      if (foundBadge && userId === currentUser.id) {
        setRecentlyUnlockedBadge(foundBadge);
        triggerFloatingHearts();
      }
    }
  };

  const closeBadgeModal = () => {
    setRecentlyUnlockedBadge(null);
  };

  const getPartnerStats = (userId: string) => {
    const userSessions = sessions.filter((s) => s.user_id === userId);
    const today = new Date().toDateString();
    
    // Today's hours
    const todayMins = userSessions
      .filter((s) => new Date(s.created_at).toDateString() === today)
      .reduce((acc, s) => acc + s.duration_minutes, 0);
    const todayHours = Number((todayMins / 60).toFixed(1));

    // Past 7 days hours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekMins = userSessions
      .filter((s) => new Date(s.created_at) >= sevenDaysAgo)
      .reduce((acc, s) => acc + s.duration_minutes, 0);
    const weekHours = Number((weekMins / 60).toFixed(1));

    // Total problems
    const problemsCount = userSessions.reduce((acc, s) => acc + (s.problems_completed || 0), 0);

    const userProfile = [currentUser, partnerUser].find((p) => p.id === userId);
    const totalHours = userProfile?.total_hours || Number((userSessions.reduce((a, b) => a + b.duration_minutes, 0) / 60).toFixed(1));
    const streakDays = userProfile?.current_streak || 0;

    return {
      todayHours,
      weekHours,
      streakDays,
      problemsCount,
      totalHours,
    };
  };

  return (
    <SyncContext.Provider
      value={{
        sessions,
        saveCompletedSession,
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
        partnerTimerState,
        weakpoints,
        addWeakpoint,
        updateWeakpointStatus,
        addCheerToWeakpoint,
        notes,
        sendNote,
        markNoteRead,
        sendLoveNudge,
        userBadges,
        unlockBadge,
        recentlyUnlockedBadge,
        closeBadgeModal,
        getPartnerStats,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
};
