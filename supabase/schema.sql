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
  current_streak integer default 0,
  total_hours numeric(6, 2) default 0.00,
  problems_solved integer default 0,
  is_coding_now boolean default false,
  active_session_topic text,
  active_session_mode text check (active_session_mode in ('stopwatch', 'pomodoro')),
  active_session_seconds integer default 0,
  active_session_started_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists active_session_mode text;
alter table public.profiles add column if not exists active_session_seconds integer default 0;

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

-- 7. Persisted partner chat
create table if not exists public.partner_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade,
  sender text not null,
  text text not null,
  created_at timestamptz default now()
);

-- Remove the old local/demo couple when this schema is applied to an existing database.
delete from public.user_badges where user_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
delete from public.couple_notes where sender_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
) or receiver_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
delete from public.weakpoints where user_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
delete from public.coding_sessions where user_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
delete from public.profiles where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.coding_sessions enable row level security;
alter table public.weakpoints enable row level security;
alter table public.quiz_results enable row level security;
alter table public.user_badges enable row level security;
alter table public.couple_notes enable row level security;
alter table public.partner_messages enable row level security;

-- Open RLS policies for seamless couple access (all authenticated or anon users can read & manage couple data)
drop policy if exists "Allow all operations for profiles" on public.profiles;
create policy "Allow all operations for profiles" on public.profiles for all using (true) with check (true);
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

-- Enable Supabase Realtime for live synchronization
do $$
begin
  if not exists (
    select 1 from pg_publication_rel r
    join pg_class c on c.oid = r.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public' and c.relname = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
  if not exists (
    select 1 from pg_publication_rel r
    join pg_class c on c.oid = r.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public' and c.relname = 'coding_sessions'
  ) then
    alter publication supabase_realtime add table public.coding_sessions;
  end if;
  if not exists (
    select 1 from pg_publication_rel r
    join pg_class c on c.oid = r.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public' and c.relname = 'weakpoints'
  ) then
    alter publication supabase_realtime add table public.weakpoints;
  end if;
  if not exists (
    select 1 from pg_publication_rel r
    join pg_class c on c.oid = r.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public' and c.relname = 'quiz_results'
  ) then
    alter publication supabase_realtime add table public.quiz_results;
  end if;
  if not exists (
    select 1 from pg_publication_rel r
    join pg_class c on c.oid = r.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public' and c.relname = 'couple_notes'
  ) then
    alter publication supabase_realtime add table public.couple_notes;
  end if;
  if not exists (
    select 1 from pg_publication_rel r
    join pg_class c on c.oid = r.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public' and c.relname = 'partner_messages'
  ) then
    alter publication supabase_realtime add table public.partner_messages;
  end if;
  if not exists (
    select 1 from pg_publication_rel r
    join pg_class c on c.oid = r.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public' and c.relname = 'sessions'
  ) then
    alter publication supabase_realtime add table public.sessions;
  end if;
  if not exists (
    select 1 from pg_publication_rel r
    join pg_class c on c.oid = r.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where r.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public' and c.relname = 'practice_history'
  ) then
    alter publication supabase_realtime add table public.practice_history;
  end if;
end $$;

-- ==============================================================================
-- 8. Shared Practice Sessions Table (Active live collaborative room & editor state)
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
-- 9. Shared Practice History Table (Completed challenges & shared live log)
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

-- Replica Identity for Realtime updates & deletes
alter table public.sessions replica identity full;
alter table public.practice_history replica identity full;

-- Enable Row Level Security (RLS)
alter table public.sessions enable row level security;
alter table public.practice_history enable row level security;

-- Open RLS policies for shared practice sessions
drop policy if exists "Allow all operations for sessions" on public.sessions;
create policy "Allow all operations for sessions" on public.sessions
  for all using (true) with check (true);

-- Explicit policies for SELECT, INSERT, UPDATE on sessions
drop policy if exists "Allow select for sessions" on public.sessions;
create policy "Allow select for sessions" on public.sessions
  for select using (true);

drop policy if exists "Allow insert for sessions" on public.sessions;
create policy "Allow insert for sessions" on public.sessions
  for insert with check (true);

drop policy if exists "Allow update for sessions" on public.sessions;
create policy "Allow update for sessions" on public.sessions
  for update using (true) with check (true);

-- Open RLS policies for shared practice history
drop policy if exists "Allow all operations for practice_history" on public.practice_history;
create policy "Allow all operations for practice_history" on public.practice_history
  for all using (true) with check (true);

-- Explicit policies for SELECT, INSERT, UPDATE on practice_history
drop policy if exists "Allow select for practice_history" on public.practice_history;
create policy "Allow select for practice_history" on public.practice_history
  for select using (true);

drop policy if exists "Allow insert for practice_history" on public.practice_history;
create policy "Allow insert for practice_history" on public.practice_history
  for insert with check (true);

drop policy if exists "Allow update for practice_history" on public.practice_history;
create policy "Allow update for practice_history" on public.practice_history
  for update using (true) with check (true);


