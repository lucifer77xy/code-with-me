# CodeTogether 💻💕
### A Joint Coding Tracker & Learning Portal for Couples

**CodeTogether** is a modern, full-stack web application designed for a couple learning, practicing, and leveling up their coding skills together. Featuring side-by-side live synchronized timers, performance analytics with Recharts, a weakpoint radar, interactive technical quizzes, daily programmer humor, and a friendly gamified leaderboard with badges.

---

## ✨ Key Features

1. **Dual Profile Access & Quick Persona Switch**:
   - Custom login page and one-click profile switching between **Alex (Boyfriend 💻)** and **Sam (Girlfriend 🌸)**.
   - Customizable avatars, mottos, and streaks.

2. **Side-by-Side Dual Tracker Dashboard (Live Sync)**:
   - Split layout: **My Progress** on the left and **Partner's Progress** on the right.
   - **Live Focus Timer**: Stopwatch mode and Pomodoro mode (presets for 15, 25, 45, 50 mins).
   - Real-time presence: When your partner starts a session, their timer pulses live on your screen!
   - Instant metrics: Hours coded today, weekly total, active daily streak, problems solved counter.
   - **Send Love Nudges**: Instant encouragement buttons that trigger floating hearts and cheerful toasts on your partner's screen.

3. **Performance Analytics & Weakpoint Tracking**:
   - Interactive charts with Recharts: Daily coding duration comparison and category distribution (Algorithms, Data Structures, Web Dev, System Design, SQL).
   - **Weakpoint Radar**: Log tricky concepts (e.g. Dynamic Programming, CSS Grid), track status (`Needs Practice` 🔴, `In Progress` 🟡, `Mastered` 🟢), and attach partner cheer notes!

4. **Daily Motivation & Mind Refreshers**:
   - Curated library of 40+ programming jokes, developer couple pick-up lines, and inspiring tech quotes.
   - Category filtering and quick "Next Joke / Quote" button with smooth animations.

5. **Interactive Quizzes**:
   - Categorized multiple-choice questions for **JavaScript**, **Python**, **Data Structures**, **SQL**, and **Web Development**.
   - Countdown timer per question, instant correctness feedback with detailed explanations, and score tracking.

6. **Gamification: Leaderboard & Badges**:
   - Head-to-head comparison on Total Hours, Problems Solved, and Streaks.
   - 10 unlockable badges (e.g., *Night Owl*, *First 10 Hours*, *Weakpoint Conqueror*, *Quiz Champion*, *Power Couple*).
   - Animated unlock modal with confetti celebrations.

7. **Couple Sticky Notes**:
   - Leave sweet notes and hydration reminders on the persistent notes wall.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS, Lucide React icons
- **Visualizations**: Recharts
- **Animations & Celebrations**: Framer Motion, Canvas Confetti
- **Notifications**: Sonner
- **Backend / Database / Auth**: Supabase (PostgreSQL, Realtime subscriptions, RLS policies)
- **Zero-Config Fallback**: Web BroadcastChannel API + LocalStorage ensures 100% functionality out of the box even before configuring Supabase credentials.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
cd code-with-me
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Tip for Multi-Tab Testing**: Open two browser windows side-by-side. In Window 1, enter as **Alex**. In Window 2, click "Switch" to view as **Sam**. Start a timer or send a nudge in one window, and watch the other window sync live in real-time!

---

## 🗄️ Supabase Setup (Optional for Full Cloud Sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, paste the entire SQL script, and click **Run**.
   - This creates all necessary tables (`profiles`, `coding_sessions`, `weakpoints`, `quiz_results`, `user_badges`, `couple_notes`).
   - Enables Row Level Security (RLS) policies.
   - Adds tables to the Supabase Realtime publication.
   - Inserts initial starter seed data.
4. Copy your Supabase Project URL and Anon API Key into `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```
5. Restart your development server (`npm run dev`).

---

## ☁️ Deploying to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Add the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings if using Supabase.
4. Click **Deploy**.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx            # App root, fonts, providers & toaster
│   ├── page.tsx              # Welcome & portal landing page
│   ├── dashboard/page.tsx    # Side-by-side live tracker dashboard
│   ├── analytics/page.tsx    # Recharts analytics & weakpoint radar
│   ├── quiz/page.tsx         # Interactive quizzes module
│   ├── leaderboard/page.tsx  # Couple rivalry & badges gallery
│   ├── notes/page.tsx        # Couple sticky notes & motivation
│   └── login/page.tsx        # Authentication & persona picker
├── components/
│   ├── layout/               # Header, Sidebar, MobileNav
│   ├── dashboard/            # DualTracker, LiveTimer, StatsCard, QuickLogModal
│   ├── analytics/            # CodingCharts, WeakpointTracker
│   ├── quiz/                 # QuizModule
│   ├── gamification/         # LeaderboardView, BadgeUnlockModal
│   └── motivation/           # JokeQuoteWidget, CoupleNotes
├── context/
│   ├── AuthContext.tsx       # Profile management & active user switcher
│   └── SyncContext.tsx       # Live sessions, timer, broadcast & realtime sync
├── data/
│   ├── initialData.ts        # Seed profiles, sessions, and weakpoints
│   ├── jokesAndQuotes.ts     # Curated developer jokes & couple memes
│   ├── quizQuestions.ts      # Categorized question bank
│   └── badges.ts             # Unlockable badges definitions
├── lib/
│   ├── supabaseClient.ts     # Supabase client initializer
│   └── utils.ts              # Time formatting & helpers
└── types/
    └── index.ts              # TypeScript interfaces
```
