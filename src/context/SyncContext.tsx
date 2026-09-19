"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import {
  CodingSession,
  Weakpoint,
  CoupleNote,
  Badge,
  LiveSyncMessage,
  PartnerChatMessage,
  Profile,
  Task,
  UserPresence,
  AnalyticsData,
} from "@/types";
import { INITIAL_SESSIONS, INITIAL_WEAKPOINTS, INITIAL_NOTES } from "@/data/initialData";
import { BADGES } from "@/data/badges";
import { useAuth } from "./AuthContext";
import {
  subscribeCodingSessions,
  createFirestoreSession,
  subscribeTasks,
  createFirestoreTask,
  updateFirestoreTask,
  deleteFirestoreTask,
  subscribeWeakpoints,
  createFirestoreWeakpoint,
  updateFirestoreWeakpoint,
  subscribeNotes,
  createFirestoreNote,
  markFirestoreNoteRead,
  subscribeMessages,
  sendFirestoreMessage,
  markFirestoreMessagesRead,
  subscribeUserBadges,
  unlockFirestoreBadge,
  subscribeAllPresence,
  updateUserPresence,
  subscribeAnalytics,
  saveFirestoreAnalytics,
} from "@/lib/firestoreService";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { generateUUID } from "@/lib/utils";

interface SyncContextType {
  // Tasks
  tasks: Task[];
  createTask: (title: string, description?: string, priority?: Task["priority"], assignedTo?: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;

  // Sessions
  sessions: CodingSession[];
  saveCompletedSession: (session: Omit<CodingSession, "id" | "createdAt" | "user_id">) => Promise<void>;

  // Timer
  isTimerRunning: boolean;
  timerMode: "stopwatch" | "pomodoro";
  timerSeconds: number;
  pomodoroInitialMinutes: number;
  timerTopic: string;
  timerCategory: CodingSession["category"];
  startTimer: (topic: string, category?: CodingSession["category"], mode?: "stopwatch" | "pomodoro", pMinutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;

  // Partner's live timer & presence
  partnerPresence: UserPresence | null;
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
  updateWeakpointStatus: (id: string, status: Weakpoint["status"], improvementScore?: number) => Promise<void>;
  addCheerToWeakpoint: (id: string, cheer: string) => Promise<void>;

  // Notes & Nudges
  notes: CoupleNote[];
  sendNote: (message: string, noteType?: CoupleNote["note_type"], emoji?: string) => Promise<void>;
  markNoteRead: (id: string) => Promise<void>;
  sendLoveNudge: (customMessage?: string, emoji?: string) => void;

  // Badges & Gamification
  userBadges: Record<string, string[]>;
  unlockBadge: (userId: string, badgeKey: string) => void;
  recentlyUnlockedBadge: Badge | null;
  closeBadgeModal: () => void;

  // Partner chat
  messages: PartnerChatMessage[];
  sendMessage: (text: string) => void;
  isPartnerTyping: boolean;
  setTyping: (typing: boolean) => void;
  updateProfileLive: (profileId: string, updated: Partial<Profile>) => Promise<void>;

  // Analytics
  analytics: AnalyticsData | null;

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

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, partnerUser, updateProfile, isFirebaseActive } = useAuth();

  // Shared state
  const [sessions, setSessions] = useState<CodingSession[]>(INITIAL_SESSIONS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weakpoints, setWeakpoints] = useState<Weakpoint[]>(INITIAL_WEAKPOINTS);
  const [notes, setNotes] = useState<CoupleNote[]>(INITIAL_NOTES);
  const [userBadges, setUserBadges] = useState<Record<string, string[]>>({});
  const [recentlyUnlockedBadge, setRecentlyUnlockedBadge] = useState<Badge | null>(null);
  const [messages, setMessages] = useState<PartnerChatMessage[]>([]);
  const [allPresence, setAllPresence] = useState<Record<string, UserPresence>>({});
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Active user's timer
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<"stopwatch" | "pomodoro">("pomodoro");
  const [pomodoroInitialMinutes, setPomodoroInitialMinutes] = useState<number>(25);
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerTopic, setTimerTopic] = useState<string>("");
  const [timerCategory, setTimerCategory] = useState<CodingSession["category"]>("Web Dev");

  const timerLastUpdatedAtRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Partner's presence and timer state
  const partnerPresence = allPresence[partnerUser.id] || null;

  const partnerTimerState = {
    isRunning: partnerPresence?.currentlyCoding || partnerUser.is_coding_now,
    mode: partnerUser.active_session_mode || ("pomodoro" as const),
    topic: partnerPresence?.activeTopic || partnerUser.active_session_topic || "",
    category: "Web Dev",
    seconds: partnerUser.active_session_seconds || 0,
    startedAt: partnerUser.active_session_started_at || undefined,
  };

  // Cross-tab broadcast channel for instantaneous zero-latency local sync
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("codetogether_sync_channel");
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const msg: LiveSyncMessage = event.data;
        if (msg.senderId !== currentUser.id) {
          if (msg.type === "NUDGE") {
            triggerFloatingHearts();
            toast(msg.payload.message || "Your partner sent you love! 💖", {
              icon: msg.payload.emoji || "💖",
              description: `From ${partnerUser.name}: Keep going, you're doing amazing!`,
            });
          }
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [currentUser.id, partnerUser.name]);

  // 1. Subscribe to Firestore Collections via onSnapshot
  useEffect(() => {
    if (!isFirebaseActive) return;

    const unsubSessions = subscribeCodingSessions((data) => {
      if (data) setSessions(data);
    });

    const unsubTasks = subscribeTasks((data) => {
      if (data) setTasks(data);
    });

    const unsubWeakpoints = subscribeWeakpoints((data) => {
      if (data) setWeakpoints(data);
    });

    const unsubNotes = subscribeNotes((data) => {
      if (data) setNotes(data);
    });

    const unsubBadges = subscribeUserBadges((data) => {
      if (data) setUserBadges(data);
    });

    const unsubMessages = subscribeMessages((data) => {
      if (data) {
        setMessages(data);
        // Automatically mark messages as read if recipient
        void markFirestoreMessagesRead(currentUser.id, data);
      }
    });

    const unsubPresence = subscribeAllPresence((presenceMap) => {
      if (presenceMap) setAllPresence(presenceMap);
    });

    const unsubAnalytics = subscribeAnalytics((data) => {
      if (data) setAnalytics(data);
    });

    return () => {
      unsubSessions();
      unsubTasks();
      unsubWeakpoints();
      unsubNotes();
      unsubBadges();
      unsubMessages();
      unsubPresence();
      unsubAnalytics();
    };
  }, [isFirebaseActive, currentUser.id]);

  // Floating hearts confetti
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

  // Recompute & persist analytics
  const recomputeAndSaveAnalytics = useCallback(async () => {
    const today = new Date().toDateString();
    const allUserSessions = sessions;
    const completedTasksList = tasks.filter((t) => t.status === "completed");

    // Days mapping (past 7 days)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyProgress = [6, 5, 4, 3, 2, 1, 0].map((offset) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const dateStr = d.toDateString();
      const daySessions = allUserSessions.filter(
        (s) => new Date(s.createdAt || s.created_at || "").toDateString() === dateStr
      );
      const dayTasks = completedTasksList.filter((t) => t.completedAt && new Date(t.completedAt).toDateString() === dateStr);
      const hours = Number((daySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60).toFixed(1));
      const problems = daySessions.reduce((acc, s) => acc + (s.completedProblems || 0), 0);
      return {
        date: days[d.getDay()],
        hours,
        problems,
        tasksCompleted: dayTasks.length,
      };
    });

    const totalHours = Number((allUserSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60).toFixed(1));
    const totalProblems = allUserSessions.reduce((acc, s) => acc + (s.completedProblems || 0), 0);
    const completionRate = tasks.length > 0 ? Math.round((completedTasksList.length / tasks.length) * 100) : 100;
    const productivityScore = Math.min(100, Math.round(completionRate * 0.4 + Math.min(60, totalHours * 3)));

    const computed: AnalyticsData = {
      dailyProgress,
      weeklyProgress: [
        { week: "Week 1", hours: 14.5, problems: 18, completionRate: 85 },
        { week: "Week 2", hours: 18.2, problems: 24, completionRate: 90 },
        { week: "Week 3", hours: 22.0, problems: 30, completionRate: 95 },
        { week: "This Week", hours: totalHours, problems: totalProblems, completionRate },
      ],
      monthlyProgress: [
        { month: "Jan", hours: 45, problems: 60, productivityScore: 82 },
        { month: "Feb", hours: 58, problems: 75, productivityScore: 88 },
        { month: "Mar", hours: 70, problems: 92, productivityScore: 94 },
      ],
      completionRate,
      productivityScore,
      streakTracking: {
        currentStreak: Math.max(currentUser.current_streak, partnerUser.current_streak, 1),
        longestStreak: 14,
        lastActiveDate: today,
      },
      totalHours,
      totalProblems,
      totalTasksCompleted: completedTasksList.length,
      updatedAt: new Date().toISOString(),
    };

    setAnalytics(computed);
    await saveFirestoreAnalytics(computed);
  }, [sessions, tasks, currentUser.current_streak, partnerUser.current_streak]);

  // Recalculate analytics when sessions or tasks change
  useEffect(() => {
    void recomputeAndSaveAnalytics();
  }, [sessions.length, tasks.length]);

  // Timer interval with wall-clock compensation
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
              description: "Great focus! Log your session or take a 5-minute break with your partner.",
            });
            void updateUserPresence(currentUser.id, { currentlyCoding: false });
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
  }, [isTimerRunning, timerMode, currentUser.id]);

  // ==========================================================================
  // TASK ACTIONS
  // ==========================================================================
  const createTask = async (
    title: string,
    description = "",
    priority: Task["priority"] = "medium",
    assignedTo = currentUser.name
  ) => {
    const newTask: Task = {
      id: generateUUID(),
      title: title.trim(),
      description: description.trim(),
      status: "todo",
      priority,
      createdAt: new Date().toISOString(),
      completedAt: null,
      assignedTo,
    };

    setTasks((prev) => [newTask, ...prev]);
    await createFirestoreTask(newTask);
    toast.success("Task created! 📋", {
      description: `Assigned to ${assignedTo}`,
    });
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
    await updateFirestoreTask(taskId, updates);
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await deleteFirestoreTask(taskId);
    toast.info("Task removed.");
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus: Task["status"] = task.status === "completed" ? "todo" : "completed";
    const completedAt = nextStatus === "completed" ? new Date().toISOString() : null;

    const updates: Partial<Task> = { status: nextStatus, completedAt };
    await updateTask(taskId, updates);

    if (nextStatus === "completed") {
      triggerFloatingHearts();
      toast.success(`Task completed! 🎉`, {
        description: `"${task.title}" checked off!`,
      });
    }
  };

  // ==========================================================================
  // TIMER ACTIONS
  // ==========================================================================
  const startTimer = (
    topic: string,
    category: CodingSession["category"] = "Web Dev",
    mode: "stopwatch" | "pomodoro" = timerMode,
    pMinutes: number = pomodoroInitialMinutes
  ) => {
    setTimerTopic(topic);
    setTimerCategory(category);
    setTimerMode(mode);
    setPomodoroInitialMinutes(pMinutes);

    const initialSecs = mode === "pomodoro" ? pMinutes * 60 : 0;
    setTimerSeconds(initialSecs);
    setIsTimerRunning(true);

    void updateProfile({
      is_coding_now: true,
      active_session_topic: topic,
      active_session_mode: mode,
      active_session_started_at: new Date().toISOString(),
    });

    void updateUserPresence(currentUser.id, {
      currentlyCoding: true,
      activeTopic: topic,
    });

    toast.info(`Timer started: ${topic}`, {
      description: mode === "pomodoro" ? `${pMinutes} min Pomodoro Focus` : "Stopwatch tracking",
      icon: "⏱️",
    });
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    void updateProfile({ is_coding_now: false });
    void updateUserPresence(currentUser.id, { currentlyCoding: false });
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
    void updateProfile({ is_coding_now: true });
    void updateUserPresence(currentUser.id, { currentlyCoding: true, activeTopic: timerTopic });
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    const secs = timerMode === "pomodoro" ? pomodoroInitialMinutes * 60 : 0;
    setTimerSeconds(secs);
    void updateProfile({ is_coding_now: false, active_session_topic: null });
    void updateUserPresence(currentUser.id, { currentlyCoding: false, activeTopic: undefined });
  };

  // ==========================================================================
  // SESSION ACTIONS
  // ==========================================================================
  const saveCompletedSession = async (
    sessionData: Omit<CodingSession, "id" | "createdAt" | "user_id">
  ) => {
    const duration = sessionData.duration ?? sessionData.duration_minutes ?? 0;
    const completedProblems = sessionData.completedProblems ?? sessionData.problems_completed ?? 0;

    const newSession: CodingSession = {
      ...sessionData,
      id: generateUUID(),
      user_id: currentUser.id,
      duration,
      duration_minutes: duration,
      language: sessionData.language || "typescript",
      completedProblems,
      problems_completed: completedProblems,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);
    await createFirestoreSession(newSession);

    // Update profile total hours and problems
    const hoursAdded = duration / 60;
    const newTotalHours = Number((currentUser.total_hours + hoursAdded).toFixed(2));
    const newProblemsSolved = currentUser.problems_solved + completedProblems;

    await updateProfile({
      total_hours: newTotalHours,
      problems_solved: newProblemsSolved,
      is_coding_now: false,
      active_session_topic: null,
    });

    await updateUserPresence(currentUser.id, { currentlyCoding: false, activeTopic: undefined });

    // Check achievement badges
    if (newTotalHours >= 10) unlockBadge(currentUser.id, "first_10_hours");
    if (newProblemsSolved >= 30) unlockBadge(currentUser.id, "problem_crusher");

    const currentHour = new Date().getHours();
    if (currentHour >= 23 || currentHour < 4) unlockBadge(currentUser.id, "night_owl");
    if (currentHour >= 5 && currentHour < 9) unlockBadge(currentUser.id, "early_bird");

    const partnerCodedToday = sessions.some(
      (s) =>
        s.user_id === partnerUser.id &&
        new Date(s.createdAt || s.created_at || "").toDateString() === new Date().toDateString()
    );
    if (partnerCodedToday) {
      unlockBadge(currentUser.id, "power_couple");
      unlockBadge(partnerUser.id, "power_couple");
    }

    triggerFloatingHearts();
    toast.success("Session saved to Firebase! 🚀", {
      description: `Logged ${duration} mins (+${completedProblems} problems)`,
    });
  };

  // ==========================================================================
  // WEAKPOINT ACTIONS
  // ==========================================================================
  const addWeakpoint = async (
    topic: string,
    category: string,
    difficulty: Weakpoint["difficulty"],
    cheer?: string
  ) => {
    const newWp: Weakpoint = {
      id: generateUUID(),
      user_id: currentUser.id,
      topic,
      category,
      difficulty,
      status: "needs_practice",
      improvementScore: 20,
      partner_cheer: cheer,
      created_at: new Date().toISOString(),
    };

    setWeakpoints((prev) => [newWp, ...prev]);
    await createFirestoreWeakpoint(newWp);
    toast.success("Weakpoint added to your radar! 🎯");
  };

  const updateWeakpointStatus = async (
    id: string,
    status: Weakpoint["status"],
    improvementScore?: number
  ) => {
    const score = improvementScore ?? (status === "mastered" ? 100 : status === "in_progress" ? 60 : 25);
    const updates = { status, improvementScore: score };
    setWeakpoints((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    await updateFirestoreWeakpoint(id, updates);

    if (status === "mastered") {
      triggerFloatingHearts();
      unlockBadge(currentUser.id, "recursion_master");
      toast.success("Topic Mastered! Outstanding work! 🏆✨");
    }
  };

  const addCheerToWeakpoint = async (id: string, cheer: string) => {
    const updates = { partner_cheer: cheer };
    setWeakpoints((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    await updateFirestoreWeakpoint(id, updates);
    toast.success("Encouragement attached! 💖");
  };

  // ==========================================================================
  // NOTES & NUDGES
  // ==========================================================================
  const sendNote = async (
    message: string,
    noteType: CoupleNote["note_type"] = "love_note",
    emoji = "💖"
  ) => {
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

    setNotes((prev) => [newNote, ...prev]);
    await createFirestoreNote(newNote);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "NUDGE",
        senderId: currentUser.id,
        payload: { message, emoji },
        timestamp: Date.now(),
      });
    }

    triggerFloatingHearts();
    toast.success("Sent with love! 💌");
  };

  const markNoteRead = async (id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await markFirestoreNoteRead(id);
  };

  const sendLoveNudge = (customMessage?: string, emoji = "💖") => {
    const defaultMessages = [
      "You got this, baby! Proud of your hard work! 🚀💖",
      "Hydration reminder! Drink some water and stretch 💧🧘‍♀️",
      "Sending you coffee & virtual kisses! ☕💋",
      "One bug at a time! Take a deep breath ✨",
    ];
    const chosen = customMessage || defaultMessages[Math.floor(Math.random() * defaultMessages.length)];

    void sendNote(chosen, "nudge", emoji);
  };

  // ==========================================================================
  // BADGES
  // ==========================================================================
  const unlockBadge = async (userId: string, badgeKey: string) => {
    const currentList = userBadges[userId] || [];
    if (!currentList.includes(badgeKey)) {
      const updated = {
        ...userBadges,
        [userId]: [...currentList, badgeKey],
      };
      setUserBadges(updated);
      await unlockFirestoreBadge(userId, badgeKey);

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

  // ==========================================================================
  // CHAT & MESSAGES
  // ==========================================================================
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const message: PartnerChatMessage = {
      id: generateUUID(),
      sender: currentUser.name,
      senderId: currentUser.id,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      readBy: [currentUser.id],
      isRead: false,
    };

    setMessages((prev) => [...prev, message]);
    await sendFirestoreMessage(message);
    void updateUserPresence(currentUser.id, { isTyping: false });
  };

  const setTyping = (typing: boolean) => {
    void updateUserPresence(currentUser.id, { isTyping: typing });
  };

  const isPartnerTyping = partnerPresence?.isTyping || false;

  const updateProfileLive = async (profileId: string, updated: Partial<Profile>) => {
    await updateProfile(updated, profileId);
  };

  // Stats calculation
  const getPartnerStats = (userId: string) => {
    const userSessions = sessions.filter((s) => s.user_id === userId);
    const today = new Date().toDateString();

    const todayMins = userSessions
      .filter((s) => new Date(s.createdAt || s.created_at || "").toDateString() === today)
      .reduce((acc, s) => acc + (s.duration || 0), 0);
    const todayHours = Number((todayMins / 60).toFixed(1));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekMins = userSessions
      .filter((s) => new Date(s.createdAt || s.created_at || 0) >= sevenDaysAgo)
      .reduce((acc, s) => acc + (s.duration || 0), 0);
    const weekHours = Number((weekMins / 60).toFixed(1));

    const problemsCount = userSessions.reduce((acc, s) => acc + (s.completedProblems || 0), 0);
    const userProfile = [currentUser, partnerUser].find((p) => p.id === userId);
    const totalHours = userProfile?.total_hours || Number((userSessions.reduce((a, b) => a + (b.duration || 0), 0) / 60).toFixed(1));
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
        tasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
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
        partnerPresence,
        partnerTimerState,
        weakpoints,
        addWeakpoint,
        updateWeakpointStatus,
        addCheerToWeakpoint,
        notes,
        sendNote,
        markNoteRead,
        sendLoveNudge,
        messages,
        sendMessage,
        isPartnerTyping,
        setTyping,
        updateProfileLive,
        userBadges,
        unlockBadge,
        recentlyUnlockedBadge,
        closeBadgeModal,
        analytics,
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
