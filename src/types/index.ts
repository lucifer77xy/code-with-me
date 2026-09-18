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

export interface CodingSession {
  id: string;
  user_id: string;
  title: string;
  category: 'Algorithms' | 'Data Structures' | 'Web Dev' | 'System Design' | 'SQL / Database' | 'Other';
  duration_minutes: number;
  mode: 'stopwatch' | 'pomodoro';
  notes?: string;
  problems_completed: number;
  created_at: string;
}

export interface Weakpoint {
  id: string;
  user_id: string;
  topic: string;
  category: string;
  status: 'needs_practice' | 'in_progress' | 'mastered';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  partner_cheer?: string;
  created_at: string;
  updated_at?: string;
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

export interface CoupleNote {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  note_type: 'love_note' | 'nudge' | 'celebration';
  emoji: string;
  is_read: boolean;
  created_at: string;
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
    | 'CHALLENGE_COMPLETED';
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
}

// 8. Practice Sessions (Shared room/active editor)
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
}

// 9. Practice History (Shared completed logs)
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
}

// 10. Presence User
export interface PresenceUser {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  partnerLabel?: string;
  isOnline: boolean;
  isCoding: boolean;
  isTyping?: boolean;
  activeTopic?: string;
  lastActive: string;
}

