"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";

export const ChatSidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const { messages, sendMessage } = useSync();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-rose-950/40 transition-transform hover:scale-105" aria-label="Open partner chat">
        <MessageCircle className="h-5 w-5" />
        <span>Partner chat</span>
        {messages.length > 0 && <span className="rounded-full bg-white/20 px-1.5 text-xs">{messages.length}</span>}
      </button>

      {isOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-slate-950 shadow-2xl" aria-label="Partner chat">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-bold text-white">Partner chat</h2>
              <p className="text-xs text-slate-400">Live conversation for your coding session</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close partner chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-500">Start the conversation with your partner.</p>
            ) : messages.map((message) => {
              const isMine = message.senderId === currentUser.id;
              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${isMine ? "rounded-br-sm bg-violet-600 text-white" : "rounded-bl-sm bg-slate-800 text-slate-100"}`}>
                    <p className="mb-1 text-[10px] font-semibold opacity-70">{isMine ? "You" : message.sender}</p>
                    <p className="break-words text-sm">{message.text}</p>
                    <time className="mt-1 block text-[10px] opacity-60" dateTime={message.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 p-1.5 focus-within:border-violet-400">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." maxLength={500} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500" />
              <button type="submit" disabled={!draft.trim()} className="rounded-lg bg-violet-600 p-2 text-white transition-colors hover:bg-violet-500 disabled:opacity-40" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
};
