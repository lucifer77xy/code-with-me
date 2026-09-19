export interface Profile {
  id: string;
  user_id?: string;
  email: string;
  name: string;
  partner_label: string; // e.g. 'Boyfriend' | 'Girlfriend' | 'Partner'
  avatar_url: string;
  motto: string;
  theme_color: 'violet' | 'rose' | 'emerald' | 'amber' | 'cyan';
  current_streak: number;
  total_hours: number;
  problems_solved: number;
  is_coding_now: boolean;
  active_session_topic?: string | null;
  active_session_started_at?: string | null;
  active_session_mode?: 'stopwatch' | 'pomodoro' | null;
  active_session_seconds?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Workspace {
  id: string;
  ownerId: string;
  partnerId?: string;
  members: string[]; // [ownerId, partnerId]
  owner: Partial<Profile>;
  partner: Partial<Profile>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string | null;
  assignedTo: string; // user id or name
  workspaceId?: string;
}

export interface CodingSession {
  id: string;
  user_id: string;
  title: string;
  category?: 'Algorithms' | 'Data Structures' | 'Web Dev' | 'System Design' | 'SQL / Database' | 'Other';
  duration?: number; // minutes
  duration_minutes?: number; // backwards compatibility
  language?: string;
  completedProblems?: number;
  problems_completed?: number; // backwards compatibility
  mode?: 'stopwatch' | 'pomodoro';
  notes?: string;
  createdAt?: string;
  created_at?: string; // backwards compatibility
  workspaceId?: string;
}

export interface Weakpoint {
  id: string;
  user_id: string;
  topic: string;
  category: string;
  status: 'needs_practice' | 'in_progress' | 'mastered';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  improvementScore?: number; // 0-100 score
  partner_cheer?: string;
  created_at: string;
  updated_at?: string;
  workspaceId?: string;
}

export interface QuizQuestion {
  id: string;
  category: 'JavaScript' | 'Python' | 'Data Structures' | 'SQL' | 'Web Development';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  category: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken_seconds: number;
  created_at: string;
  workspaceId?: string;
}

export interface Badge {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'hours' | 'problems' | 'quiz' | 'couple' | 'special';
  unlockedAt?: string;
}

export interface UserBadge {
  id?: string;
  userId: string;
  badgeId: string;
  unlockedAt: string;
  workspaceId?: string;
}

export interface CoupleNote {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  note_type: 'love_note' | 'nudge' | 'celebration';
  emoji: string;
  is_read: boolean;
  created_at: string;
  workspaceId?: string;
}

export interface LiveSyncMessage {
  type: 
    | 'TIMER_UPDATE' 
    | 'TIMER_STOP' 
    | 'SESSION_SAVED' 
    | 'NUDGE' 
    | 'WEAKPOINT_UPDATE' 
    | 'PROFILE_UPDATE' 
    | 'CHAT_MESSAGE'
    | 'CODE_UPDATE'
    | 'CHALLENGE_COMPLETED'
    | 'TASK_UPDATE';
  senderId: string;
  payload: any;
  timestamp: number;
}

export interface PartnerChatMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: string;
  readBy?: string[];
  isRead?: boolean;
  workspaceId?: string;
}

// Practice Sessions (Shared room/active editor)
export interface PracticeSession {
  id: string;
  user_id: string;
  display_name: string;
  code_snippet: string;
  timer_duration_seconds: number;
  completed_at?: string | null;
  status: 'active' | 'paused' | 'completed';
  challenge_title?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  workspaceId?: string;
}

// Practice History (Shared completed logs)
export interface PracticeHistory {
  id: string;
  user_id: string;
  display_name: string;
  code_snippet: string;
  timer_duration_seconds: number;
  completed_at: string;
  status: 'completed' | 'in_progress' | 'passed' | 'failed';
  challenge_title?: string;
  language?: string;
  created_at?: string;
  workspaceId?: string;
}

// Presence System
export interface UserPresence {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  partnerLabel?: string;
  online: boolean;
  lastSeen: string;
  currentlyCoding: boolean;
  activeTask?: string;
  activeTopic?: string;
  isTyping?: boolean;
}

// Backwards compatibility alias for PresenceUser
export type PresenceUser = UserPresence & { isOnline: boolean; isCoding: boolean; lastActive: string };

// Progress Dashboard Analytics
export interface AnalyticsData {
  dailyProgress: { date: string; hours: number; problems: number; tasksCompleted: number }[];
  weeklyProgress: { week: string; hours: number; problems: number; completionRate: number }[];
  monthlyProgress: { month: string; hours: number; problems: number; productivityScore: number }[];
  completionRate: number; // 0-100%
  productivityScore: number; // 0-100 composite score
  streakTracking: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
  };
  totalHours: number;
  totalProblems: number;
  totalTasksCompleted: number;
  updatedAt: string;
}
