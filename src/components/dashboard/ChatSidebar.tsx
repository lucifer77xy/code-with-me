"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, CheckCheck, Check, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";

export const ChatSidebar: React.FC = () => {
  const { currentUser, partnerUser } = useAuth();
  const { messages, sendMessage, isPartnerTyping, setTyping } = useSync();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isPartnerTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    setTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setTyping(false);

    sendMessage(draft.trim());
    setDraft("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-rose-400/30 bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-rose-950/40 transition-transform hover:scale-105 active:scale-95"
        aria-label="Open partner chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Partner Chat</span>
        {messages.length > 0 && (
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-extrabold">
            {messages.length}
          </span>
        )}
      </button>

      {isOpen && (
        <aside
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-slate-950 shadow-2xl backdrop-blur-2xl"
          aria-label="Partner chat"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={partnerUser.avatar_url}
                  alt={partnerUser.name}
                  className="h-9 w-9 rounded-full border border-rose-500/40 bg-slate-800 object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{partnerUser.name}</span>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300 font-semibold">
                    {partnerUser.partner_label}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  {isPartnerTyping ? (
                    <span className="text-pink-400 font-semibold animate-pulse">Typing...</span>
                  ) : (
                    "Firebase Realtime Chat"
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close partner chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="my-12 text-center space-y-2">
                <Sparkles className="h-8 w-8 text-rose-400 mx-auto opacity-70" />
                <p className="text-sm font-semibold text-slate-300">No messages yet</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Say hello, share a quick tip, or cheer on your partner!
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine = message.senderId === currentUser.id;
                const isRead =
                  message.isRead ||
                  (message.readBy && message.readBy.some((id) => id !== message.senderId));

                return (
                  <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                        isMine
                          ? "rounded-br-sm bg-gradient-to-r from-violet-600 to-rose-600 text-white"
                          : "rounded-bl-sm bg-slate-900 border border-white/10 text-slate-100"
                      }`}
                    >
                      <p className="mb-1 text-[10px] font-bold opacity-75">
                        {isMine ? "You" : message.sender}
                      </p>
                      <p className="break-words text-xs sm:text-sm leading-relaxed">{message.text}</p>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                        <time dateTime={message.timestamp}>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </time>
                        {isMine && (
                          <span title={isRead ? "Seen by partner" : "Delivered"}>
                            {isRead ? (
                              <CheckCheck className="h-3 w-3 text-cyan-300" />
                            ) : (
                              <Check className="h-3 w-3 opacity-60" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing indicator bubble */}
            {isPartnerTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-slate-900 border border-white/10 px-3.5 py-2 text-slate-400 text-xs flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-bounce" />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <span className="ml-1 text-[11px] text-slate-400">{partnerUser.name} is typing...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Message input */}
          <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 bg-slate-900/60">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950 p-1.5 focus-within:border-rose-500">
              <input
                value={draft}
                onChange={handleInputChange}
                onBlur={() => setTyping(false)}
                placeholder={`Message ${partnerUser.name}...`}
                maxLength={500}
                className="min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="rounded-lg bg-gradient-to-r from-rose-500 to-violet-600 p-2 text-white transition-all hover:brightness-110 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
};
