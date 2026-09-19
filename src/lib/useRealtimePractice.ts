"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PracticeHistory, PracticeSession, PresenceUser } from "@/types";
import { generateUUID } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  subscribePracticeSession,
  updatePracticeSession,
  subscribePracticeHistory,
  addFirestorePracticeHistory,
  updateUserPresence,
  subscribeAllPresence,
} from "@/lib/firestoreService";
import { isFirebaseConfigured } from "@/lib/firebase";

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
  roomId = "couple-practice-shared",
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
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isBroadcastingRef = useRef<boolean>(false);

  // 1. Subscribe to Firestore Practice Session for this room
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoadingHistory(false);
      return;
    }

    const unsubSession = subscribePracticeSession(roomId, (session) => {
      if (session) {
        setActiveSession(session);
        // Only update if not our own instant echo
        if (session.user_id !== userId) {
          if (session.code_snippet !== undefined) setCode(session.code_snippet);
          if (session.language) setLanguage(session.language);
          if (session.challenge_title) setChallengeTitle(session.challenge_title);
          if (typeof session.timer_duration_seconds === "number") {
            setTimerSeconds(session.timer_duration_seconds);
          }
          setIsTimerRunning(session.status === "active");
        }
      }
    });

    const unsubHistory = subscribePracticeHistory((history) => {
      setHistoryList(history);
      setIsLoadingHistory(false);
    });

    const unsubPresence = subscribeAllPresence((presenceMap) => {
      const list: PresenceUser[] = Object.values(presenceMap).map((p) => ({
        ...p,
        isOnline: p.online,
        isCoding: p.currentlyCoding,
        lastActive: p.lastSeen,
      }));
      setPresenceUsers(list);

      const partner = Object.values(presenceMap).find((p) => p.userId !== userId);
      if (partner?.isTyping) {
        setPartnerTyping({ isTyping: true, name: partner.displayName });
      } else {
        setPartnerTyping(null);
      }
    });

    // Mark current user as coding in this room
    void updateUserPresence(userId, {
      displayName,
      avatarUrl,
      partnerLabel,
      online: true,
      currentlyCoding: true,
      activeTopic: challengeTitle,
    });

    return () => {
      unsubSession();
      unsubHistory();
      unsubPresence();
      void updateUserPresence(userId, { currentlyCoding: false, isTyping: false });
    };
  }, [roomId, userId, displayName, avatarUrl, partnerLabel]);

  // 2. Wall-clock timer ticking
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // 3. Actions Exposed to Components
  const updateCode = useCallback(
    (newCode: string, broadcast = true) => {
      setCode(newCode);

      if (broadcast) {
        void updateUserPresence(userId, { isTyping: true });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          void updateUserPresence(userId, { isTyping: false });
        }, 2000);

        void updatePracticeSession(roomId, {
          user_id: userId,
          display_name: displayName,
          code_snippet: newCode,
          language,
          challenge_title: challengeTitle,
          timer_duration_seconds: timerSeconds,
        });
      }
    },
    [roomId, userId, displayName, language, challengeTitle, timerSeconds]
  );

  const startTimer = useCallback(
    (initialSecs?: number) => {
      const secs = typeof initialSecs === "number" ? initialSecs : timerSeconds;
      setIsTimerRunning(true);
      if (typeof initialSecs === "number") setTimerSeconds(initialSecs);

      void updatePracticeSession(roomId, {
        user_id: userId,
        status: "active",
        timer_duration_seconds: secs,
      });
    },
    [roomId, userId, timerSeconds]
  );

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);

    void updatePracticeSession(roomId, {
      user_id: userId,
      status: "paused",
      timer_duration_seconds: timerSeconds,
    });
  }, [roomId, userId, timerSeconds]);

  const resetTimer = useCallback(
    (resetValue = 0) => {
      setIsTimerRunning(false);
      setTimerSeconds(resetValue);

      void updatePracticeSession(roomId, {
        user_id: userId,
        status: "paused",
        timer_duration_seconds: resetValue,
      });
    },
    [roomId, userId]
  );

  const broadcastProfileUpdate = useCallback(
    (profileData: { name: string; motto?: string }) => {
      void updateUserPresence(userId, { displayName: profileData.name });
    },
    [userId]
  );

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

      setHistoryList((prev) => [newHistoryItem, ...prev.filter((i) => i.id !== newHistoryItem.id)]);

      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#ec4899", "#8b5cf6", "#10b981", "#3b82f6"],
        });
      } catch (e) {}

      await addFirestorePracticeHistory(newHistoryItem);

      await updatePracticeSession(roomId, {
        user_id: userId,
        status: "completed",
        completed_at: new Date().toISOString(),
      });

      toast.success("Practice challenge saved to shared history! 🚀", {
        description: `Saved "${title}" (${Math.round(duration / 60)} mins) for both partners.`,
      });
    },
    [code, timerSeconds, challengeTitle, language, userId, displayName, roomId]
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
