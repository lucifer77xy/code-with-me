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
import { INITIAL_PROFILES, INITIAL_SESSIONS, INITIAL_WEAKPOINTS, INITIAL_NOTES } from "@/data/initialData";

export const DEFAULT_WORKSPACE_ID = "shared-couple-workspace";

type Unsubscribe = () => void;

// ============================================================================
// LOCAL STORAGE & BROADCASTCHANNEL REAL-TIME ENGINE (NO FIRESTORE / STORAGE)
// ============================================================================

const STORAGE_KEYS = {
  USERS: "codetogether_users",
  WORKSPACE: "codetogether_workspace",
  TASKS: "codetogether_tasks",
  SESSIONS: "codetogether_sessions",
  WEAKPOINTS: "codetogether_weakpoints",
  NOTES: "codetogether_notes",
  MESSAGES: "codetogether_messages",
  BADGES: "codetogether_badges",
  PRACTICE_HISTORY: "codetogether_practice_history",
  PRACTICE_SESSION: "codetogether_practice_session",
  PRESENCE: "codetogether_presence",
  ANALYTICS: "codetogether_analytics",
  QUIZ_RESULTS: "codetogether_quiz_results",
};

// Event target for same-tab updates and BroadcastChannel for cross-tab updates
let broadcastChannel: BroadcastChannel | null = null;
const eventTarget = typeof window !== "undefined" ? new EventTarget() : null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel("codetogether_storage_sync");
    broadcastChannel.onmessage = (event) => {
      const { type } = event.data || {};
      if (type && eventTarget) {
        eventTarget.dispatchEvent(new CustomEvent(type));
      }
    };
  } catch (e) {
    console.warn("BroadcastChannel not supported or failed:", e);
  }
}

const notifySubscribers = (key: string) => {
  if (eventTarget) {
    eventTarget.dispatchEvent(new CustomEvent(key));
  }
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: key });
    } catch {}
  }
};

const getLocalItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers(key);
  } catch (e) {
    console.warn("Failed to set localStorage key:", key, e);
  }
};

// ============================================================================
// 1. WORKSPACE MANAGEMENT
// ============================================================================
export const getOrCreateWorkspace = async (
  owner: Profile,
  partner: Profile
): Promise<Workspace> => {
  const existing = getLocalItem<Workspace | null>(STORAGE_KEYS.WORKSPACE, null);
  if (existing) return existing;

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

  setLocalItem(STORAGE_KEYS.WORKSPACE, newWorkspace);
  return newWorkspace;
};

// ============================================================================
// 2. USERS & PROFILES
// ============================================================================
export const subscribeUserProfiles = (
  callback: (profiles: Profile[]) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const profiles = getLocalItem<Profile[]>(STORAGE_KEYS.USERS, INITIAL_PROFILES);
    callback(profiles);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.USERS, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.USERS, handleUpdate);
  }
  return () => {};
};

export const saveUserProfile = async (profile: Profile): Promise<void> => {
  const profiles = getLocalItem<Profile[]>(STORAGE_KEYS.USERS, INITIAL_PROFILES);
  const index = profiles.findIndex((p) => p.id === profile.id);
  let updated: Profile[];
  if (index >= 0) {
    updated = [...profiles];
    updated[index] = { ...updated[index], ...profile, updated_at: new Date().toISOString() };
  } else {
    updated = [...profiles, { ...profile, updated_at: new Date().toISOString() }];
  }
  setLocalItem(STORAGE_KEYS.USERS, updated);
};

// ============================================================================
// 3. PRESENCE SYSTEM
// ============================================================================
export const updateUserPresence = async (
  userId: string,
  presence: Partial<UserPresence>
): Promise<void> => {
  const map = getLocalItem<Record<string, UserPresence>>(STORAGE_KEYS.PRESENCE, {});
  const existing = map[userId] || {
    userId,
    displayName: "Coder",
    online: true,
    lastSeen: new Date().toISOString(),
    currentlyCoding: false,
  };
  map[userId] = {
    ...existing,
    ...presence,
    userId,
    lastSeen: new Date().toISOString(),
  };
  setLocalItem(STORAGE_KEYS.PRESENCE, map);
};

export const subscribeAllPresence = (
  callback: (presenceMap: Record<string, UserPresence>) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const map = getLocalItem<Record<string, UserPresence>>(STORAGE_KEYS.PRESENCE, {});
    callback(map);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.PRESENCE, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.PRESENCE, handleUpdate);
  }
  return () => {};
};

// ============================================================================
// 4. TASK TRACKING
// ============================================================================
export const subscribeTasks = (
  callback: (tasks: Task[]) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const tasks = getLocalItem<Task[]>(STORAGE_KEYS.TASKS, []);
    callback(tasks);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.TASKS, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.TASKS, handleUpdate);
  }
  return () => {};
};

export const createFirestoreTask = async (task: Task): Promise<void> => {
  const tasks = getLocalItem<Task[]>(STORAGE_KEYS.TASKS, []);
  setLocalItem(STORAGE_KEYS.TASKS, [task, ...tasks.filter((t) => t.id !== task.id)]);
};

export const updateFirestoreTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<void> => {
  const tasks = getLocalItem<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
  setLocalItem(STORAGE_KEYS.TASKS, updated);
};

export const deleteFirestoreTask = async (taskId: string): Promise<void> => {
  const tasks = getLocalItem<Task[]>(STORAGE_KEYS.TASKS, []);
  setLocalItem(STORAGE_KEYS.TASKS, tasks.filter((t) => t.id !== taskId));
};

// ============================================================================
// 5. CODING SESSIONS
// ============================================================================
export const subscribeCodingSessions = (
  callback: (sessions: CodingSession[]) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const sessions = getLocalItem<CodingSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    callback(sessions);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.SESSIONS, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.SESSIONS, handleUpdate);
  }
  return () => {};
};

export const createFirestoreSession = async (
  session: CodingSession
): Promise<void> => {
  const sessions = getLocalItem<CodingSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  setLocalItem(STORAGE_KEYS.SESSIONS, [session, ...sessions]);
};

// ============================================================================
// 6. WEAKPOINTS TRACKER
// ============================================================================
export const subscribeWeakpoints = (
  callback: (weakpoints: Weakpoint[]) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const list = getLocalItem<Weakpoint[]>(STORAGE_KEYS.WEAKPOINTS, INITIAL_WEAKPOINTS);
    callback(list);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.WEAKPOINTS, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.WEAKPOINTS, handleUpdate);
  }
  return () => {};
};

export const createFirestoreWeakpoint = async (
  weakpoint: Weakpoint
): Promise<void> => {
  const list = getLocalItem<Weakpoint[]>(STORAGE_KEYS.WEAKPOINTS, INITIAL_WEAKPOINTS);
  setLocalItem(STORAGE_KEYS.WEAKPOINTS, [weakpoint, ...list]);
};

export const updateFirestoreWeakpoint = async (
  id: string,
  updates: Partial<Weakpoint>
): Promise<void> => {
  const list = getLocalItem<Weakpoint[]>(STORAGE_KEYS.WEAKPOINTS, INITIAL_WEAKPOINTS);
  const updated = list.map((w) => (w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w));
  setLocalItem(STORAGE_KEYS.WEAKPOINTS, updated);
};

// ============================================================================
// 7. NOTES & LOVE NUDGES
// ============================================================================
export const subscribeNotes = (
  callback: (notes: CoupleNote[]) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const notes = getLocalItem<CoupleNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    callback(notes);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.NOTES, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.NOTES, handleUpdate);
  }
  return () => {};
};

export const createFirestoreNote = async (
  note: CoupleNote
): Promise<void> => {
  const notes = getLocalItem<CoupleNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
  setLocalItem(STORAGE_KEYS.NOTES, [note, ...notes]);
};

export const markFirestoreNoteRead = async (id: string): Promise<void> => {
  const notes = getLocalItem<CoupleNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
  const updated = notes.map((n) => (n.id === id ? { ...n, is_read: true } : n));
  setLocalItem(STORAGE_KEYS.NOTES, updated);
};

// ============================================================================
// 8. LIVE CHAT & MESSAGES
// ============================================================================
export const subscribeMessages = (
  callback: (messages: PartnerChatMessage[]) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const messages = getLocalItem<PartnerChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    callback(messages);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.MESSAGES, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.MESSAGES, handleUpdate);
  }
  return () => {};
};

export const sendFirestoreMessage = async (
  message: PartnerChatMessage
): Promise<void> => {
  const messages = getLocalItem<PartnerChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
  setLocalItem(STORAGE_KEYS.MESSAGES, [...messages, message]);
};

export const markFirestoreMessagesRead = async (
  userId: string,
  messages: PartnerChatMessage[]
): Promise<void> => {
  let changed = false;
  const updated = messages.map((m) => {
    if (m.senderId !== userId && (!m.readBy || !m.readBy.includes(userId))) {
      changed = true;
      return {
        ...m,
        readBy: Array.from(new Set([...(m.readBy || []), userId])),
        isRead: true,
      };
    }
    return m;
  });

  if (changed) {
    setLocalItem(STORAGE_KEYS.MESSAGES, updated);
  }
};

// ============================================================================
// 9. BADGES & ACHIEVEMENTS
// ============================================================================
export const subscribeUserBadges = (
  callback: (badgesMap: Record<string, string[]>) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const map = getLocalItem<Record<string, string[]>>(STORAGE_KEYS.BADGES, {});
    callback(map);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.BADGES, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.BADGES, handleUpdate);
  }
  return () => {};
};

export const unlockFirestoreBadge = async (
  userId: string,
  badgeKey: string
): Promise<void> => {
  const map = getLocalItem<Record<string, string[]>>(STORAGE_KEYS.BADGES, {});
  const userList = map[userId] || [];
  if (!userList.includes(badgeKey)) {
    map[userId] = [...userList, badgeKey];
    setLocalItem(STORAGE_KEYS.BADGES, map);
  }
};

// ============================================================================
// 10. REALTIME PRACTICE STUDIO (Shared Editor & Timer)
// ============================================================================
export const subscribePracticeSession = (
  roomId: string,
  callback: (session: PracticeSession | null) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const session = getLocalItem<PracticeSession | null>(`${STORAGE_KEYS.PRACTICE_SESSION}_${roomId}`, null);
    callback(session);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(`${STORAGE_KEYS.PRACTICE_SESSION}_${roomId}`, handleUpdate);
    return () => eventTarget.removeEventListener(`${STORAGE_KEYS.PRACTICE_SESSION}_${roomId}`, handleUpdate);
  }
  return () => {};
};

export const updatePracticeSession = async (
  roomId: string,
  data: Partial<PracticeSession>
): Promise<void> => {
  const existing = getLocalItem<PracticeSession | null>(`${STORAGE_KEYS.PRACTICE_SESSION}_${roomId}`, null);
  const updated: PracticeSession = {
    ...(existing || {
      id: roomId,
      user_id: "",
      display_name: "",
      code_snippet: "",
      timer_duration_seconds: 0,
      status: "active",
      created_at: new Date().toISOString(),
    }),
    ...data,
    updated_at: new Date().toISOString(),
  };
  setLocalItem(`${STORAGE_KEYS.PRACTICE_SESSION}_${roomId}`, updated);
};

export const subscribePracticeHistory = (
  callback: (history: PracticeHistory[]) => void,
  maxItems = 40
): Unsubscribe => {
  const handleUpdate = () => {
    const history = getLocalItem<PracticeHistory[]>(STORAGE_KEYS.PRACTICE_HISTORY, []);
    callback(history.slice(0, maxItems));
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.PRACTICE_HISTORY, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.PRACTICE_HISTORY, handleUpdate);
  }
  return () => {};
};

export const addFirestorePracticeHistory = async (
  item: PracticeHistory
): Promise<void> => {
  const history = getLocalItem<PracticeHistory[]>(STORAGE_KEYS.PRACTICE_HISTORY, []);
  setLocalItem(STORAGE_KEYS.PRACTICE_HISTORY, [item, ...history.filter((h) => h.id !== item.id)]);
};

// ============================================================================
// 11. ANALYTICS & COMPUTED PROGRESS
// ============================================================================
export const subscribeAnalytics = (
  callback: (analytics: AnalyticsData | null) => void
): Unsubscribe => {
  const handleUpdate = () => {
    const analytics = getLocalItem<AnalyticsData | null>(STORAGE_KEYS.ANALYTICS, null);
    callback(analytics);
  };

  handleUpdate();
  if (eventTarget) {
    eventTarget.addEventListener(STORAGE_KEYS.ANALYTICS, handleUpdate);
    return () => eventTarget.removeEventListener(STORAGE_KEYS.ANALYTICS, handleUpdate);
  }
  return () => {};
};

export const saveFirestoreAnalytics = async (
  analytics: AnalyticsData
): Promise<void> => {
  setLocalItem(STORAGE_KEYS.ANALYTICS, analytics);
};

// ============================================================================
// 12. QUIZ RESULTS
// ============================================================================
export const saveFirestoreQuizResult = async (
  result: QuizResult
): Promise<void> => {
  const results = getLocalItem<QuizResult[]>(STORAGE_KEYS.QUIZ_RESULTS, []);
  setLocalItem(STORAGE_KEYS.QUIZ_RESULTS, [result, ...results]);
};
