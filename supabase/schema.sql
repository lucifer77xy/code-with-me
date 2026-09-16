-- ==============================================================================
-- CodeTogether - Database Schema for Supabase
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Dual user profile support for the couple)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  email text,
  name text not null,
  partner_label text default 'Partner', -- e.g. 'Boyfriend' or 'Girlfriend'
  avatar_url text,
  motto text default 'Coding together, growing together 💕',
  theme_color text default 'rose',
  current_streak integer default 1,
  total_hours numeric(6, 2) default 0.00,
  problems_solved integer default 0,
  is_coding_now boolean default false,
  active_session_topic text,
  active_session_started_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Coding Sessions Table
create table if not exists public.coding_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  category text not null check (category in ('Algorithms', 'Data Structures', 'Web Dev', 'System Design', 'SQL / Database', 'Other')),
  duration_minutes integer not null default 25,
  mode text not null check (mode in ('stopwatch', 'pomodoro')),
  notes text,
  problems_completed integer default 0,
  created_at timestamptz default now()
);

-- 3. Weakpoints Table (Topic stuck on & mastery tracker)
create table if not exists public.weakpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  topic text not null,
  category text not null,
  status text not null check (status in ('needs_practice', 'in_progress', 'mastered')),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  partner_cheer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Quiz Results Table
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  category text not null,
  score integer not null,
  total_questions integer not null,
  percentage integer not null,
  time_taken_seconds integer default 0,
  created_at timestamptz default now()
);

-- 5. User Badges Table
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  badge_key text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- 6. Couple Notes & Nudges Table
create table if not exists public.couple_notes (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  note_type text not null check (note_type in ('love_note', 'nudge', 'celebration')),
  emoji text default '💖',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.coding_sessions enable row level security;
alter table public.weakpoints enable row level security;
alter table public.quiz_results enable row level security;
alter table public.user_badges enable row level security;
alter table public.couple_notes enable row level security;

-- Open RLS policies for seamless couple access (all authenticated or anon users can read & manage couple data)
create policy "Allow all operations for profiles" on public.profiles for all using (true) with check (true);
create policy "Allow all operations for coding_sessions" on public.coding_sessions for all using (true) with check (true);
create policy "Allow all operations for weakpoints" on public.weakpoints for all using (true) with check (true);
create policy "Allow all operations for quiz_results" on public.quiz_results for all using (true) with check (true);
create policy "Allow all operations for user_badges" on public.user_badges for all using (true) with check (true);
create policy "Allow all operations for couple_notes" on public.couple_notes for all using (true) with check (true);

-- Enable Supabase Realtime for live synchronization
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.coding_sessions;
alter publication supabase_realtime add table public.weakpoints;
alter publication supabase_realtime add table public.quiz_results;
alter publication supabase_realtime add table public.couple_notes;

-- ==============================================================================
-- Initial Seed Data (Partner 1 & Partner 2)
-- ==============================================================================
insert into public.profiles (id, email, name, partner_label, avatar_url, motto, theme_color, current_streak, total_hours, problems_solved)
values 
  ('11111111-1111-1111-1111-111111111111', 'alex@codetogether.love', 'Alex', 'Boyfriend 💻', 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=b6e3f4', 'Debugged with patience, loved with passion ⚡', 'violet', 5, 24.5, 42),
  ('22222222-2222-2222-2222-222222222222', 'sam@codetogether.love', 'Sam', 'Girlfriend 🌸', 'https://api.dicebear.com/7.x/bottts/svg?seed=Sam&backgroundColor=ffdfbf', 'Building aesthetic apps and solving hard problems ✨', 'rose', 6, 28.0, 48)
on conflict (id) do nothing;

-- Initial Badges
insert into public.user_badges (user_id, badge_key) values
  ('11111111-1111-1111-1111-111111111111', 'night_owl'),
  ('11111111-1111-1111-1111-111111111111', 'first_10_hours'),
  ('11111111-1111-1111-1111-111111111111', 'streak_flame'),
  ('22222222-2222-2222-2222-222222222222', 'quiz_champion'),
  ('22222222-2222-2222-2222-222222222222', 'first_10_hours'),
  ('22222222-2222-2222-2222-222222222222', 'streak_flame')
on conflict do nothing;

-- Initial Weakpoints
insert into public.weakpoints (user_id, topic, category, status, difficulty, partner_cheer) values
  ('11111111-1111-1111-1111-111111111111', 'Dynamic Programming (Knapsack & Subsets)', 'Algorithms', 'in_progress', 'Hard', 'You mastered memoization yesterday! Next step is the 2D grid table 💪'),
  ('11111111-1111-1111-1111-111111111111', 'CSS Subgrid & Complex Flex Alignments', 'Web Dev', 'needs_practice', 'Medium', 'I will teach you grid layout over coffee this weekend! ☕'),
  ('22222222-2222-2222-2222-222222222222', 'Graph BFS & Shortest Path with Weights', 'Data Structures', 'in_progress', 'Hard', 'Remember Dijkstra is just BFS with a PriorityQueue! You got this 💖'),
  ('22222222-2222-2222-2222-222222222222', 'SQL Window Functions (ROW_NUMBER & RANK)', 'SQL / Database', 'mastered', 'Medium', 'Crushed it! You wrote that analytical query faster than me!')
on conflict do nothing;
