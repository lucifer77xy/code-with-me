"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Github,
  Eye,
  EyeOff,
  User,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type AuthTab = "signin" | "signup" | "forgot";

const PARTNER_OPTIONS = [
  { label: "Boyfriend", emoji: "💙", color: "from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300" },
  { label: "Girlfriend", emoji: "💖", color: "from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-300" },
  { label: "Partner", emoji: "💜", color: "from-violet-500/20 to-purple-500/20 border-violet-500/40 text-violet-300" },
];

export default function LoginPage() {
  const router = useRouter();
  const {
    allProfiles,
    switchUser,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    signInWithGoogle,
    signInWithGitHub,
    isFirebaseActive,
  } = useAuth();

  // Mode tab: signin | signup | forgot
  const [tab, setTab] = useState<AuthTab>("signin");

  // Form states
  const [name, setName] = useState("");
  const [partnerLabel, setPartnerLabel] = useState("Boyfriend");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await signInWithGoogle();
      if (success) {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // GitHub OAuth
  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const success = await signInWithGitHub();
      if (success) {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email / Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await signInWithEmail(email, password);
      if (success) {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email / Password Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-check.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await signUpWithEmail(email, password, name.trim(), partnerLabel);
      if (success) {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your account email.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await sendPasswordReset(email);
      if (success) {
        setTab("signin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Persona selection
  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-rose-950/40 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-pink-600 to-rose-600 p-0.5 shadow-lg shadow-rose-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
              <Heart className="h-7 w-7 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            CodeTogether
          </h1>
          <p className="text-xs text-slate-400">
            Pair Programming Progress Portal for Couples
          </p>

          {/* Firebase connection status badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{isFirebaseActive ? "Firebase Auth Connected" : "Firebase Client Configured"}</span>
          </div>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        {tab !== "forgot" ? (
          <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={`rounded-xl py-2 transition-all ${
                tab === "signin"
                  ? "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-md shadow-rose-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`rounded-xl py-2 transition-all ${
                tab === "signup"
                  ? "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-md shadow-rose-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </button>
            <span className="text-xs font-bold text-slate-300">Reset Password</span>
          </div>
        )}

        {/* OAuth Social Buttons (Show on signin and signup) */}
        {tab !== "forgot" && (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 active:scale-98 transition-all shadow-sm disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 active:scale-98 transition-all shadow-sm disabled:opacity-50"
            >
              <Github className="h-4 w-4" />
              <span>Continue with GitHub</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-slate-900 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Or with Email & Password
              </span>
            </div>
          </div>
        )}

        {/* 1. Sign In Form */}
        {tab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@codetogether.love"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setTab("forgot")}
                  className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In with Firebase</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. Create Account Form */}
        {tab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Your Name
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Role in the Relationship
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PARTNER_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setPartnerLabel(opt.label)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                      partnerLabel === opt.label
                        ? `bg-gradient-to-r ${opt.color} shadow-sm`
                        : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@codetogether.love"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Password (6+ chars)
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Confirm Password
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Create Firebase Account</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. Password Reset Form */}
        {tab === "forgot" && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your registered email address and Firebase will instantly dispatch a secure password reset link to your inbox.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Account Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Send Password Reset Email</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 1-Click Couple Persona Picker (For instant local 2-partner testing) */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Quick Test Personas:
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> 2-Way Sync Ready
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {allProfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickLogin(p.id)}
                className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-rose-500/40 hover:bg-white/10 transition-all text-center group active:scale-95"
              >
                <img
                  src={p.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.name)}`}
                  alt={p.name}
                  className="h-10 w-10 rounded-full border border-white/20 bg-slate-800 object-cover group-hover:scale-105 transition-transform"
                />
                <span className="mt-2 text-xs font-bold text-white">{p.name}</span>
                <span className="text-[10px] text-slate-400">{p.partner_label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info & direct navigation */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secured with Firebase Authentication</span>
          </p>
          <div>
            <Link href="/dashboard" className="text-rose-400 hover:underline inline-block font-medium">
              Explore Live Dashboard without login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
