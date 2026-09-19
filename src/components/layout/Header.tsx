"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { Heart, RefreshCw, Sparkles, Radio, Pencil, LogOut, LogIn } from "lucide-react";
import { toast } from "sonner";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";

export const Header: React.FC = () => {
  const { currentUser, partnerUser, switchUser, isFirebaseActive, firebaseUser, logout } = useAuth();
  const { sendLoveNudge, partnerTimerState } = useSync();
  const [isNudging, setIsNudging] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  const handleQuickNudge = () => {
    setIsNudging(true);
    sendLoveNudge();
    setTimeout(() => setIsNudging(false), 1000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="CodeTogether Logo" className="h-10 w-10 rounded-lg object-contain transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
                  Couple Portal
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {currentUser.name} & {partnerUser.name}&apos;s Coding Journey
              </span>
            </div>
          </Link>
        </div>

        {/* Center Live Sync indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-200">
            {isFirebaseActive ? "Firebase Realtime Synced" : "Firebase Cache Synced"}
          </span>
          {partnerTimerState.isRunning && (
            <span className="ml-1.5 flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300 animate-pulse">
              <Radio className="h-3 w-3 text-rose-400" />
              {partnerUser.name} is coding!
            </span>
          )}
        </div>

        {/* Right actions: Quick Nudge & Persona switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Love Nudge Button */}
          <button
            onClick={handleQuickNudge}
            disabled={isNudging}
            title={`Send an instant encouragement nudge to ${partnerUser.name}`}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/20 to-pink-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:from-rose-500/30 hover:to-pink-500/30 active:scale-95 transition-all shadow-sm shadow-rose-500/10"
          >
            <Sparkles className={`h-3.5 w-3.5 text-rose-400 ${isNudging ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Nudge</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          </button>

          <button
            onClick={() => setIsProfileEditorOpen(true)}
            title="Edit profiles"
            aria-label="Edit profiles"
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* User profile toggle switcher */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 p-1 pl-2">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-full border border-violet-400/40 bg-slate-800 object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentUser.partner_label}
                </span>
              </div>
            </div>

            {/* Switch user button */}
            <button
              onClick={() => switchUser()}
              className="flex items-center gap-1 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 px-2 py-1 text-[11px] font-medium text-violet-200 border border-violet-500/30 transition-colors"
              title={`Switch view to ${partnerUser.name}`}
            >
              <RefreshCw className="h-3 w-3 text-violet-300" />
              <span className="hidden sm:inline">Switch</span>
            </button>

            {/* Firebase Auth Sign In / Sign Out */}
            {firebaseUser ? (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 px-2 py-1 text-[11px] font-medium text-rose-200 border border-rose-500/30 transition-colors"
                title="Sign out of Firebase"
              >
                <LogOut className="h-3 w-3 text-rose-300" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 rounded-xl bg-white/5 hover:bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-300 border border-white/10 transition-colors"
                title="Sign in with Firebase"
              >
                <LogIn className="h-3 w-3 text-slate-300" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>

        </div>
      </div>
      <ProfileEditor isOpen={isProfileEditorOpen} onClose={() => setIsProfileEditorOpen(false)} />
    </header>
  );
};
