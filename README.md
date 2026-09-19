# 💖 CodeTogether — Couple Coding Tracker & Growth Portal

> A synchronized, pair-programming & technical growth platform built for developer couples to study, build, and conquer career milestones hand-in-hand.

---

## 🌟 Key Features

- ⏱️ **Live Synchronized Dual Tracker**: Track daily, weekly, and total coding sessions side-by-side. See your partner's live status and active focus intervals in real time.
- 📋 **Shared Couple Tasks**: Full task tracking with priority, assignee, status, and instant live sync.
- 💻 **Pair Programming Studio**: Realtime shared code editor with synchronized timer, live presence, and shared practice logs.
- 🍅 **Pomodoro & Stopwatch Focus Timer**: Run Pomodoro focus intervals or open stopwatch tracking with wall-clock compensation that never drifts when tabs are hidden.
- 📊 **Firebase-Powered Analytics & Charts**: Interactive graphs powered by Recharts (Productivity graph, Time spent comparison, Task completion, and Cumulative progression trend).
- 🎯 **Weakpoint Radar**: Track tricky topics, assign difficulty, monitor improvement scores (0-100%), and attach partner cheer notes.
- 🧠 **Interactive Quizzes**: 5 categories (JavaScript, Python, Data Structures, SQL, Web Dev) with 30-second timers and instant score tracking.
- 🏆 **Rivalry & Achievement Badges**: Unlockable achievements (Night Owl, Early Bird, Power Couple, Recursion Master) with celebratory confetti.
- 💌 **Love Notes & Instant Nudges**: Send real-time encouragements, coffee reminders, and heart floats with sound & visual feedback.
- 💬 **Live Partner Chat**: Instant messaging with typing indicators, read receipts, and timestamps.
- 😂 **Daily Motivation & Joke System**: "Tell Me A Joke" button returning randomized coding jokes and couple-friendly developer humor.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS, Lucide React icons
- **Visualizations**: Recharts
- **Animations & Celebrations**: Framer Motion, Canvas Confetti
- **Notifications**: Sonner
- **Backend / Database / Auth**: Firebase (Firebase Authentication, Cloud Firestore with multi-tab offline persistence, Firestore Security Rules)
- **Zero-Config Fallback**: Multi-tab IndexedDB cache and Web BroadcastChannel API ensure 100% functionality out of the box even before adding Firebase credentials.

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

> **Tip for Multi-Tab Testing**: Open two browser windows side-by-side. In Window 1, enter as **Alex**. In Window 2, click "Switch" to view as **Sam**. Start a timer, create a task, or send a nudge in one window, and watch the other window sync live in real time!

---

## 🔥 Firebase Setup

1. Create a free project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication**:
   - Enable **Google** and **GitHub** sign-in providers in Authentication > Sign-in method.
3. Enable **Cloud Firestore**:
   - Create a Firestore database in test or production mode.
   - Deploy the included `firestore.rules`:
     ```bash
     firebase deploy --only firestore:rules
     ```
4. Copy your Web App configuration credentials into `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYourFirebaseApiKeyHere
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```
5. Restart your development server (`npm run dev`).

---

## ☁️ Deploying to Vercel

```text
GitHub Push
        ↓
Vercel Auto Deploy
        ↓
Firebase Backend
        ↓
Live Sync
```

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the Firebase environment variables (`NEXT_PUBLIC_FIREBASE_*`) in the Vercel project settings.
4. Click **Deploy**.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx            # App root, fonts, providers & toaster
│   ├── page.tsx              # Welcome & portal landing page
│   ├── dashboard/page.tsx    # Side-by-side live tracker dashboard
│   ├── practice/page.tsx     # Pair programming code studio
│   ├── analytics/page.tsx    # Recharts analytics & weakpoint radar
│   ├── quiz/page.tsx         # Interactive quizzes module
│   ├── leaderboard/page.tsx  # Couple rivalry & badges gallery
│   ├── notes/page.tsx        # Couple sticky notes & motivation
│   └── login/page.tsx        # Firebase Authentication (Google/GitHub) & persona picker
├── components/
│   ├── layout/               # Header, Sidebar, MobileNav
│   ├── dashboard/            # DualTracker, LiveTimer, StatsCard, ChatSidebar, QuickLogModal
│   ├── tasks/                # TaskTracker (CRUD, priority, assignee, live sync)
│   ├── analytics/            # CodingCharts (4 Recharts graphs), WeakpointTracker
│   ├── practice/             # RealtimeCodeEditor, HistoryList
│   ├── quiz/                 # QuizModule
│   ├── gamification/         # LeaderboardView, BadgeUnlockModal
│   └── motivation/           # JokeQuoteWidget, CoupleNotes
├── context/
│   ├── AuthContext.tsx       # Firebase Auth, persistent accounts & couple workspace
│   └── SyncContext.tsx       # Firestore onSnapshot subscriptions, presence & analytics
├── data/
│   ├── initialData.ts        # Starter profiles, sessions, and weakpoints
│   ├── jokesAndQuotes.ts     # Curated developer jokes & couple memes
│   ├── quizQuestions.ts      # Categorized question bank
│   └── badges.ts             # Unlockable badges definitions
├── lib/
│   ├── firebase.ts           # Firebase App, Firestore offline persistence & Auth
│   ├── firestoreService.ts   # Firestore collections, tasks, sessions, chat & presence
│   ├── useRealtimePractice.ts# Realtime code editor synchronization
│   └── utils.ts              # Time formatting & helpers
└── types/
    └── index.ts              # TypeScript interfaces (Task, Session, Workspace, Presence, etc.)
```
