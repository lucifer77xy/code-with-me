"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { allProfiles, switchUser, loginWithEmail, isSupabaseActive } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const success = await loginWithEmail(email);
    setIsLoading(false);

    if (success) {
      router.push("/dashboard");
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gradient-to-tr from-rose-600/20 via-pink-600/20 to-violet-600/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 backdrop-blur-2xl shadow-2xl shadow-rose-950/40 space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-rose-600 p-0.5 shadow-lg shadow-rose-500/30">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
              <Heart className="h-7 w-7 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            CodeTogether
          </h1>
          <p className="text-xs text-slate-400">
            Couple Coding Tracker & Growth Portal
          </p>
        </div>

        {/* 1-Click Couple Profile Picker */}
        <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Quick Select Partner:
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Ready to sync
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

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-slate-900 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Or Login with Credentials
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Together</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500">
          <p>
            {isSupabaseActive
              ? "Connected with Supabase Auth & Realtime Database."
              : "Demo Mode active. Ready for local preview and instant testing."}
          </p>
          <Link href="/dashboard" className="text-rose-400 hover:underline mt-1 inline-block">
            Skip to Live Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
