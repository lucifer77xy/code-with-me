-- ==============================================================================
-- CodeTogether - Complete Database Schema & Realtime Setup for Supabase
-- Run this entire script in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. Profiles Table (Dual user profile support for the couple)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  email text default '',
  name text not null default 'You',
  partner_label text default 'Partner',
  avatar_url text default '/boy-profile.jpg',
  motto text default 'Coding together, growing together 💕',
  theme_color text default 'rose',
  current_streak integer default 0,
  total_hours numeric(6, 2) default 0.00,
  problems_solved integer default 0,
  is_coding_now boolean default false,
  active_session_topic text,
  active_session_mode text default 'pomodoro',
  active_session_seconds integer default 0,
  active_session_started_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure all required columns exist even if profiles table was previously created
alter table public.profiles add column if not exists user_id text;
alter table public.profiles add column if not exists email text default '';
alter table public.profiles add column if not exists name text not null default 'You';
alter table public.profiles add column if not exists partner_label text default 'Partner';
alter table public.profiles add column if not exists avatar_url text default '/boy-profile.jpg';
alter table public.profiles add column if not exists motto text default 'Coding together, growing together 💕';
alter table public.profiles add column if not exists theme_color text default 'rose';
alter table public.profiles add column if not exists current_streak integer default 0;
alter table public.profiles add column if not exists total_hours numeric(6, 2) default 0.00;
alter table public.profiles add column if not exists problems_solved integer default 0;
alter table public.profiles add column if not exists is_coding_now boolean default false;
alter table public.profiles add column if not exists active_session_topic text;
alter table public.profiles add column if not exists active_session_mode text default 'pomodoro';
alter table public.profiles add column if not exists active_session_seconds integer default 0;
alter table public.profiles add column if not exists active_session_started_at timestamptz;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Seed initial couple profiles so the dashboard loads with synchronized profiles
insert into public.profiles (id, name, email, partner_label, avatar_url, motto, theme_color)
values
  ('00000000-0000-0000-0000-000000000001', 'Alex', 'alex@codetogether.love', 'Boyfriend', '/boy-profile.jpg', 'Building the future together 🚀', 'violet'),
  ('00000000-0000-0000-0000-000000000002', 'Sam', 'sam@codetogether.love', 'Girlfriend', '/girl-profile.jpg', 'One line of code at a time ✨', 'rose')
on conflict (id) do update set
  name = excluded.name,
  partner_label = excluded.partner_label,
  updated_at = now();

-- ==============================================================================
-- 2. Shared Practice Sessions Table (Active live collaborative room & editor)
-- ==============================================================================
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  display_name text not null,
  code_snippet text not null default '',
  timer_duration_seconds integer not null default 0,
  completed_at timestamptz,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  challenge_title text default 'Collaborative Practice',
  language text default 'javascript',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 3. Shared Practice History Table (Completed challenges & shared live log)
-- ==============================================================================
create table if not exists public.practice_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  display_name text not null,
  code_snippet text not null default '',
  timer_duration_seconds integer not null default 0,
  completed_at timestamptz default now(),
  status text not null default 'completed' check (status in ('completed', 'in_progress', 'passed', 'failed')),
  challenge_title text default 'Algorithm Practice',
  language text default 'javascript',
  created_at timestamptz default now()
);

-- ==============================================================================
-- 4. Coding Sessions Table (Focus timer logs)
-- ==============================================================================
create table if not exists public.coding_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  category text not null default 'Web Dev',
  duration_minutes integer not null default 25,
  mode text not null default 'pomodoro',
  notes text,
  problems_completed integer default 0,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 5. Weakpoints Table (Topic stuck on & mastery tracker)
-- ==============================================================================
create table if not exists public.weakpoints (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  topic text not null,
  category text not null default 'Algorithms',
  status text not null default 'needs_practice',
  difficulty text not null default 'Medium',
  partner_cheer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 6. Quiz Results Table
-- ==============================================================================
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  category text not null,
  score integer not null,
  total_questions integer not null,
  percentage integer not null,
  time_taken_seconds integer default 0,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 7. User Badges Table
-- ==============================================================================
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  badge_key text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- ==============================================================================
-- 8. Couple Notes Table (Love notes & nudges)
-- ==============================================================================
create table if not exists public.couple_notes (
  id uuid primary key default gen_random_uuid(),
  sender_id text not null,
  receiver_id text not null,
  message text not null,
  note_type text not null default 'love_note',
  emoji text default '💖',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 9. Partner Messages Table (Live chat)
-- ==============================================================================
create table if not exists public.partner_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id text not null,
  sender text not null,
  text text not null,
  created_at timestamptz default now()
);

-- ==============================================================================
-- Enable Replica Identity for Realtime Payloads
-- ==============================================================================
alter table public.profiles replica identity full;
alter table public.sessions replica identity full;
alter table public.practice_history replica identity full;
alter table public.coding_sessions replica identity full;
alter table public.weakpoints replica identity full;
alter table public.quiz_results replica identity full;
alter table public.user_badges replica identity full;
alter table public.couple_notes replica identity full;
alter table public.partner_messages replica identity full;

-- ==============================================================================
-- Enable Row Level Security (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.practice_history enable row level security;
alter table public.coding_sessions enable row level security;
alter table public.weakpoints enable row level security;
alter table public.quiz_results enable row level security;
alter table public.user_badges enable row level security;
alter table public.couple_notes enable row level security;
alter table public.partner_messages enable row level security;

-- ==============================================================================
-- Open Permissive RLS Policies (Allows seamless couple pair synchronization)
-- ==============================================================================
drop policy if exists "Allow all operations for profiles" on public.profiles;
create policy "Allow all operations for profiles" on public.profiles for all using (true) with check (true);

drop policy if exists "Allow all operations for sessions" on public.sessions;
create policy "Allow all operations for sessions" on public.sessions for all using (true) with check (true);

drop policy if exists "Allow all operations for practice_history" on public.practice_history;
create policy "Allow all operations for practice_history" on public.practice_history for all using (true) with check (true);

drop policy if exists "Allow all operations for coding_sessions" on public.coding_sessions;
create policy "Allow all operations for coding_sessions" on public.coding_sessions for all using (true) with check (true);

drop policy if exists "Allow all operations for weakpoints" on public.weakpoints;
create policy "Allow all operations for weakpoints" on public.weakpoints for all using (true) with check (true);

drop policy if exists "Allow all operations for quiz_results" on public.quiz_results;
create policy "Allow all operations for quiz_results" on public.quiz_results for all using (true) with check (true);

drop policy if exists "Allow all operations for user_badges" on public.user_badges;
create policy "Allow all operations for user_badges" on public.user_badges for all using (true) with check (true);

drop policy if exists "Allow all operations for couple_notes" on public.couple_notes;
create policy "Allow all operations for couple_notes" on public.couple_notes for all using (true) with check (true);

drop policy if exists "Allow all operations for partner_messages" on public.partner_messages;
create policy "Allow all operations for partner_messages" on public.partner_messages for all using (true) with check (true);

-- ==============================================================================
-- Enable Supabase Realtime Publication for all tables
-- ==============================================================================
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

do $$
declare
  tbl text;
  tbls text[] := array['profiles', 'sessions', 'practice_history', 'coding_sessions', 'weakpoints', 'quiz_results', 'user_badges', 'couple_notes', 'partner_messages'];
begin
  foreach tbl in array tbls loop
    if not exists (
      select 1 from pg_publication_rel r
      join pg_class c on c.oid = r.prrelid
      join pg_namespace n on n.oid = c.relnamespace
      where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
        and n.nspname = 'public' and c.relname = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I;', tbl);
    end if;
  end loop;
end $$;
