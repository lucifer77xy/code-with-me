import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import {
  Profile,
  Workspace,
  Task,
  CodingSession,
  Weakpoint,
  CoupleNote,
  PartnerChatMessage,
  PracticeHistory,
  PracticeSession,
  UserPresence,
  AnalyticsData,
  QuizResult,
} from "@/types";

export const DEFAULT_WORKSPACE_ID = "shared-couple-workspace";

// ============================================================================
// 1. WORKSPACE MANAGEMENT
// ============================================================================
export const getOrCreateWorkspace = async (
  owner: Profile,
  partner: Profile
): Promise<Workspace> => {
  if (!isFirebaseConfigured()) {
    return {
      id: DEFAULT_WORKSPACE_ID,
      ownerId: owner.id,
      partnerId: partner.id,
      members: [owner.id, partner.id],
      owner,
      partner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const workspaceRef = doc(db, "workspaces", DEFAULT_WORKSPACE_ID);
  const snap = await getDoc(workspaceRef);

  if (snap.exists()) {
    return snap.data() as Workspace;
  }

  const newWorkspace: Workspace = {
    id: DEFAULT_WORKSPACE_ID,
    ownerId: owner.id,
    partnerId: partner.id,
    members: [owner.id, partner.id],
    owner,
    partner,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(workspaceRef, newWorkspace, { merge: true });
  return newWorkspace;
};

// ============================================================================
// 2. USERS & PROFILES
// ============================================================================
export const subscribeUserProfiles = (
  callback: (profiles: Profile[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const usersRef = collection(db, "users");
  return onSnapshot(
    usersRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Profile[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Profile);
        });
        callback(list);
      }
    },
    (err) => console.warn("Firestore users sync warning:", err)
  );
};

export const saveUserProfile = async (profile: Profile): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const userRef = doc(db, "users", profile.id);
  await setDoc(
    userRef,
    {
      ...profile,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
};

// ============================================================================
// 3. PRESENCE SYSTEM
// ============================================================================
export const updateUserPresence = async (
  userId: string,
  presence: Partial<UserPresence>
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const presenceRef = doc(db, "presence", userId);
  await setDoc(
    presenceRef,
    {
      ...presence,
      userId,
      lastSeen: new Date().toISOString(),
    },
    { merge: true }
  );
};

export const subscribeAllPresence = (
  callback: (presenceMap: Record<string, UserPresence>) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const presenceRef = collection(db, "presence");
  return onSnapshot(
    presenceRef,
    (snapshot) => {
      const map: Record<string, UserPresence> = {};
      snapshot.forEach((doc) => {
        map[doc.id] = doc.data() as UserPresence;
      });
      callback(map);
    },
    (err) => console.warn("Presence sync warning:", err)
  );
};

// ============================================================================
// 4. TASK TRACKING
// ============================================================================
export const subscribeTasks = (
  callback: (tasks: Task[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      callback(tasks);
    },
    (err) => console.warn("Tasks sync warning:", err)
  );
};

export const createFirestoreTask = async (task: Task): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const taskRef = doc(db, "tasks", task.id);
  await setDoc(taskRef, task);
};

export const updateFirestoreTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, updates);
};

export const deleteFirestoreTask = async (taskId: string): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
};

// ============================================================================
// 5. CODING SESSIONS
// ============================================================================
export const subscribeCodingSessions = (
  callback: (sessions: CodingSession[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const q = query(
    collection(db, "codingSessions"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const sessions: CodingSession[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as CodingSession;
        sessions.push({
          ...data,
          id: doc.id,
          duration: data.duration ?? data.duration_minutes ?? 0,
          duration_minutes: data.duration_minutes ?? data.duration ?? 0,
          completedProblems: data.completedProblems ?? data.problems_completed ?? 0,
          problems_completed: data.problems_completed ?? data.completedProblems ?? 0,
          createdAt: data.createdAt ?? data.created_at ?? new Date().toISOString(),
          created_at: data.created_at ?? data.createdAt ?? new Date().toISOString(),
        });
      });
      callback(sessions);
    },
    (err) => console.warn("Coding sessions sync warning:", err)
  );
};

export const createFirestoreSession = async (
  session: CodingSession
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const sessionRef = doc(db, "codingSessions", session.id);
  await setDoc(sessionRef, {
    ...session,
    duration: session.duration ?? session.duration_minutes ?? 0,
    duration_minutes: session.duration_minutes ?? session.duration ?? 0,
    completedProblems: session.completedProblems ?? session.problems_completed ?? 0,
    problems_completed: session.problems_completed ?? session.completedProblems ?? 0,
    createdAt: session.createdAt ?? session.created_at ?? new Date().toISOString(),
    created_at: session.created_at ?? session.createdAt ?? new Date().toISOString(),
  });
};

// ============================================================================
// 6. WEAKPOINTS TRACKER
// ============================================================================
export const subscribeWeakpoints = (
  callback: (weakpoints: Weakpoint[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const q = query(collection(db, "weakpoints"), orderBy("created_at", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Weakpoint[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Weakpoint);
      });
      callback(list);
    },
    (err) => console.warn("Weakpoints sync warning:", err)
  );
};

export const createFirestoreWeakpoint = async (
  weakpoint: Weakpoint
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "weakpoints", weakpoint.id);
  await setDoc(ref, weakpoint);
};

export const updateFirestoreWeakpoint = async (
  id: string,
  updates: Partial<Weakpoint>
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "weakpoints", id);
  await updateDoc(ref, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
};

// ============================================================================
// 7. NOTES & LOVE NUDGES
// ============================================================================
export const subscribeNotes = (
  callback: (notes: CoupleNote[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const q = query(collection(db, "notes"), orderBy("created_at", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const notes: CoupleNote[] = [];
      snapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() } as CoupleNote);
      });
      callback(notes);
    },
    (err) => console.warn("Notes sync warning:", err)
  );
};

export const createFirestoreNote = async (
  note: CoupleNote
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "notes", note.id);
  await setDoc(ref, note);
};

export const markFirestoreNoteRead = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "notes", id);
  await updateDoc(ref, { is_read: true });
};

// ============================================================================
// 8. LIVE CHAT & MESSAGES
// ============================================================================
export const subscribeMessages = (
  callback: (messages: PartnerChatMessage[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"), limit(200));
  return onSnapshot(
    q,
    (snapshot) => {
      const messages: PartnerChatMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as PartnerChatMessage);
      });
      callback(messages);
    },
    (err) => console.warn("Messages sync warning:", err)
  );
};

export const sendFirestoreMessage = async (
  message: PartnerChatMessage
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "messages", message.id);
  await setDoc(ref, {
    ...message,
    readBy: message.readBy || [message.senderId],
    isRead: false,
  });
};

export const markFirestoreMessagesRead = async (
  userId: string,
  messages: PartnerChatMessage[]
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  for (const m of messages) {
    if (m.senderId !== userId && (!m.readBy || !m.readBy.includes(userId))) {
      const ref = doc(db, "messages", m.id);
      const readBy = Array.from(new Set([...(m.readBy || []), userId]));
      void updateDoc(ref, { readBy, isRead: true });
    }
  }
};

// ============================================================================
// 9. BADGES & ACHIEVEMENTS
// ============================================================================
export const subscribeUserBadges = (
  callback: (badgesMap: Record<string, string[]>) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const ref = collection(db, "badges");
  return onSnapshot(
    ref,
    (snapshot) => {
      const map: Record<string, string[]> = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as { userId?: string; user_id?: string; badgeId?: string; badge_key?: string };
        const uId = data.userId || data.user_id;
        const bId = data.badgeId || data.badge_key;
        if (uId && bId) {
          map[uId] = Array.from(new Set([...(map[uId] || []), bId]));
        }
      });
      callback(map);
    },
    (err) => console.warn("Badges sync warning:", err)
  );
};

export const unlockFirestoreBadge = async (
  userId: string,
  badgeKey: string
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const id = `${userId}_${badgeKey}`;
  const ref = doc(db, "badges", id);
  await setDoc(ref, {
    id,
    userId,
    user_id: userId,
    badgeId: badgeKey,
    badge_key: badgeKey,
    unlockedAt: new Date().toISOString(),
    unlocked_at: new Date().toISOString(),
  });
};

// ============================================================================
// 10. REALTIME PRACTICE STUDIO (Shared Editor & Timer)
// ============================================================================
export const subscribePracticeSession = (
  roomId: string,
  callback: (session: PracticeSession | null) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const ref = doc(db, "practiceSessions", roomId);
  return onSnapshot(
    ref,
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as PracticeSession);
      } else {
        callback(null);
      }
    },
    (err) => console.warn("Practice session sync warning:", err)
  );
};

export const updatePracticeSession = async (
  roomId: string,
  data: Partial<PracticeSession>
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "practiceSessions", roomId);
  await setDoc(
    ref,
    {
      ...data,
      id: roomId,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
};

export const subscribePracticeHistory = (
  callback: (history: PracticeHistory[]) => void,
  maxItems = 40
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const q = query(
    collection(db, "practiceHistory"),
    orderBy("completed_at", "desc"),
    limit(maxItems)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list: PracticeHistory[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PracticeHistory);
      });
      callback(list);
    },
    (err) => console.warn("Practice history sync warning:", err)
  );
};

export const addFirestorePracticeHistory = async (
  item: PracticeHistory
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "practiceHistory", item.id);
  await setDoc(ref, item);
};

// ============================================================================
// 11. ANALYTICS & COMPUTED PROGRESS
// ============================================================================
export const subscribeAnalytics = (
  callback: (analytics: AnalyticsData | null) => void
): Unsubscribe => {
  if (!isFirebaseConfigured()) return () => {};

  const ref = doc(db, "analytics", "couple-overview");
  return onSnapshot(
    ref,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data() as AnalyticsData);
      } else {
        callback(null);
      }
    },
    (err) => console.warn("Analytics sync warning:", err)
  );
};

export const saveFirestoreAnalytics = async (
  analytics: AnalyticsData
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "analytics", "couple-overview");
  await setDoc(ref, analytics, { merge: true });
};

// ============================================================================
// 12. QUIZ RESULTS
// ============================================================================
export const saveFirestoreQuizResult = async (
  result: QuizResult
): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "quizResults", result.id);
  await setDoc(ref, result);
};
