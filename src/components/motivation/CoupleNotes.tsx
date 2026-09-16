"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { CoupleNote } from "@/types";
import { 
  Heart, 
  Send, 
  Sparkles, 
  MessageCircleHeart, 
  Clock, 
  Check, 
  Smile,
  PartyPopper
} from "lucide-react";
import { getRelativeTime } from "@/lib/utils";

export const CoupleNotes: React.FC = () => {
  const { currentUser, partnerUser } = useAuth();
  const { notes, sendNote, markNoteRead } = useSync();

  const [message, setMessage] = useState("");
  const [noteType, setNoteType] = useState<CoupleNote["note_type"]>("love_note");
  const [selectedEmoji, setSelectedEmoji] = useState("💌");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendNote(message.trim(), noteType, selectedEmoji);
    setMessage("");
  };

  const emojis = ["💌", "💖", "☕", "🍪", "🔥", "🚀", "🌸", "💪", "🎉"];

  return (
    <div className="space-y-6">
      {/* Compose Note Card */}
      <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-rose-950/30 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
          <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-2 text-white">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Leave a Sweet Note for {partnerUser.name}
            </h3>
            <p className="text-[11px] text-slate-400">
              Surprise your partner with sweet words, encouragement, or cheers
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <textarea
            rows={3}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Write a cute message or cheering thought for ${partnerUser.name}...`}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Note Type & Emoji Picker */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                className="rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="love_note">💌 Love Note</option>
                <option value="nudge">💧 Gentle Nudge</option>
                <option value="celebration">🎉 Celebration</option>
              </select>

              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950 p-1">
                {emojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setSelectedEmoji(em)}
                    className={`rounded-lg px-2 py-0.5 text-sm transition-transform ${
                      selectedEmoji === em ? "bg-white/20 scale-110" : "hover:scale-105 opacity-75"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Send to {partnerUser.name}</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Sticky Notes Wall */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Couple Sticky Notes Wall</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map((note) => {
            const sender = note.sender_id === currentUser.id ? currentUser : partnerUser;
            const isMine = note.sender_id === currentUser.id;

            return (
              <div
                key={note.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-5 backdrop-blur-xl transition-all ${
                  isMine
                    ? "border-violet-500/20 bg-slate-900/60"
                    : "border-rose-500/30 bg-gradient-to-br from-slate-900/90 to-rose-950/20 shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{note.emoji}</span>
                      <span className="text-xs font-bold text-slate-200">
                        {isMine ? "You wrote to " + partnerUser.name : sender.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {getRelativeTime(note.created_at)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    &ldquo;{note.message}&rdquo;
                  </p>
                </div>

                {!isMine && !note.is_read && (
                  <div className="mt-4 flex justify-end border-t border-white/5 pt-3">
                    <button
                      onClick={() => markNoteRead(note.id)}
                      className="flex items-center gap-1 rounded-xl bg-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/30 transition-colors"
                    >
                      <Check className="h-3 w-3" /> Mark as Read
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
