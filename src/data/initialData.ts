import { Profile, CodingSession, Weakpoint, CoupleNote } from "@/types";

export const INITIAL_PROFILES: Profile[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "alex@codetogether.love",
    name: "Alex",
    partner_label: "Boyfriend 💻",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=b6e3f4",
    motto: "Refactoring code & cherishing you 💕",
    theme_color: "violet",
    current_streak: 5,
    total_hours: 24.5,
    problems_solved: 42,
    is_coding_now: false,
    active_session_topic: null,
    active_session_started_at: null,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "sam@codetogether.love",
    name: "Sam",
    partner_label: "Girlfriend 🌸",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Sam&backgroundColor=ffdfbf",
    motto: "Clean architectures & sweet moments ✨",
    theme_color: "rose",
    current_streak: 6,
    total_hours: 28.0,
    problems_solved: 48,
    is_coding_now: true,
    active_session_topic: "Next.js 14 App Router Optimization",
    active_session_started_at: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    active_session_mode: "pomodoro",
    active_session_seconds: 1440,
  }
];

export const INITIAL_SESSIONS: CodingSession[] = [
  {
    id: "s1",
    user_id: "11111111-1111-1111-1111-111111111111",
    title: "LeetCode Daily: Two Sum & Valid Anagram",
    category: "Algorithms",
    duration_minutes: 45,
    mode: "stopwatch",
    notes: "Solved in O(N) using HashMap lookups. Feeling smoother!",
    problems_completed: 2,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "s2",
    user_id: "11111111-1111-1111-1111-111111111111",
    title: "PostgreSQL Indexing & Explain Analyze",
    category: "SQL / Database",
    duration_minutes: 60,
    mode: "pomodoro",
    notes: "B-Tree vs Hash indexes comparison.",
    problems_completed: 1,
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
  {
    id: "s3",
    user_id: "22222222-2222-2222-2222-222222222222",
    title: "Binary Tree Traversals & Depth Calculation",
    category: "Data Structures",
    duration_minutes: 50,
    mode: "stopwatch",
    notes: "Implemented recursive and iterative DFS / BFS with queue.",
    problems_completed: 3,
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: "s4",
    user_id: "22222222-2222-2222-2222-222222222222",
    title: "Tailwind CSS Responsive Navbar & Animations",
    category: "Web Dev",
    duration_minutes: 55,
    mode: "pomodoro",
    notes: "Polishing glassmorphism and mobile drawer transitions.",
    problems_completed: 1,
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  }
];

export const INITIAL_WEAKPOINTS: Weakpoint[] = [
  {
    id: "w1",
    user_id: "11111111-1111-1111-1111-111111111111",
    topic: "Dynamic Programming (0/1 Knapsack & Subset Sum)",
    category: "Algorithms",
    status: "in_progress",
    difficulty: "Hard",
    partner_cheer: "You mastered the top-down memoization yesterday! Next step is the 2D grid table 💪",
    created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
  },
  {
    id: "w2",
    user_id: "11111111-1111-1111-1111-111111111111",
    topic: "CSS Subgrid & Complex Flex Alignments",
    category: "Web Dev",
    status: "needs_practice",
    difficulty: "Medium",
    partner_cheer: "I will make us matcha lattes and walk you through flex-shrink & subgrid! 🍵",
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
  },
  {
    id: "w3",
    user_id: "22222222-2222-2222-2222-222222222222",
    topic: "Graph BFS & Shortest Path with Dijkstra",
    category: "Data Structures",
    status: "in_progress",
    difficulty: "Hard",
    partner_cheer: "Remember Dijkstra is just BFS with a min-heap PriorityQueue! You've got this 💖",
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
  {
    id: "w4",
    user_id: "22222222-2222-2222-2222-222222222222",
    topic: "SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK)",
    category: "SQL / Database",
    status: "mastered",
    difficulty: "Medium",
    partner_cheer: "Crushed it! You wrote that query faster than me yesterday!",
    created_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  }
];

export const INITIAL_NOTES: CoupleNote[] = [
  {
    id: "n1",
    sender_id: "22222222-2222-2222-2222-222222222222",
    receiver_id: "11111111-1111-1111-1111-111111111111",
    message: "Good luck on your mock system design interview today! Remember: explain your tradeoffs clearly! 🚀💖",
    note_type: "love_note",
    emoji: "💌",
    is_read: true,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: "n2",
    sender_id: "11111111-1111-1111-1111-111111111111",
    receiver_id: "22222222-2222-2222-2222-222222222222",
    message: "Hydration check! Drink some water and take a 5-minute eye rest from your screen 💧👀",
    note_type: "nudge",
    emoji: "💧",
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  }
];
