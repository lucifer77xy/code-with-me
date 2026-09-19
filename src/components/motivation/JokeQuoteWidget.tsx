"use client";

import React, { useState } from "react";
import { JOKES_AND_QUOTES, Item } from "@/data/jokesAndQuotes";
import { Smile, Quote, Sparkles, RefreshCw, Heart, MessageCircle, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

export const JokeQuoteWidget: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "joke" | "couple_meme" | "quote">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  const filteredItems = JOKES_AND_QUOTES.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const currentItem = filteredItems[currentIndex % filteredItems.length] || JOKES_AND_QUOTES[0];

  const handleNext = () => {
    setIsRotating(true);
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
    setTimeout(() => setIsRotating(false), 300);
  };

  const handleTellMeAJoke = () => {
    setFilter("joke");
    const jokes = JOKES_AND_QUOTES.filter((i) => i.type === "joke" || i.type === "couple_meme");
    const randomIndex = Math.floor(Math.random() * jokes.length);
    setIsRotating(true);
    setCurrentIndex(randomIndex);
    setTimeout(() => setIsRotating(false), 300);

    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  const handleRandomEncouragement = () => {
    setFilter("quote");
    const quotes = JOKES_AND_QUOTES.filter((i) => i.type === "quote" || i.type === "couple_meme");
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setIsRotating(true);
    setCurrentIndex(randomIndex);
    setTimeout(() => setIsRotating(false), 300);
  };

  const getBadgeColor = (type: Item["type"]) => {
    switch (type) {
      case "joke":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "couple_meme":
        return "bg-rose-500/10 text-rose-300 border-rose-500/20";
      case "quote":
        return "bg-violet-500/10 text-violet-300 border-violet-500/20";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-2 text-white">
            <Smile className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Motivation & Joke System</h3>
            <p className="text-[11px] text-slate-400">Coding jokes, relationship memes, and daily encouragement</p>
          </div>
        </div>

        {/* Feature Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTellMeAJoke}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Tell Me A Joke</span>
            <PartyPopper className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleRandomEncouragement}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Encourage Me</span>
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 p-1">
        <button
          onClick={() => {
            setFilter("all");
            setCurrentIndex(0);
          }}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
            filter === "all" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setFilter("joke");
            setCurrentIndex(0);
          }}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
            filter === "joke"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Jokes 🪲
        </button>
        <button
          onClick={() => {
            setFilter("couple_meme");
            setCurrentIndex(0);
          }}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
            filter === "couple_meme"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Couple Love 💖
        </button>
        <button
          onClick={() => {
            setFilter("quote");
            setCurrentIndex(0);
          }}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
            filter === "quote"
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Quotes 📜
        </button>
      </div>

      {/* Content Display Card */}
      <div className={`my-4 transition-opacity duration-300 ${isRotating ? "opacity-30" : "opacity-100"}`}>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getBadgeColor(
              currentItem.type
            )}`}
          >
            {currentItem.tag}
          </span>
          <span className="text-[11px] text-slate-500">
            {currentIndex + 1} of {filteredItems.length}
          </span>
        </div>

        <div className="mt-3 min-h-[70px]">
          <p className="text-base sm:text-lg font-medium text-slate-100 leading-snug">
            &ldquo;{currentItem.content}&rdquo;
          </p>
          <p className="mt-2 text-sm font-bold text-rose-400">{currentItem.authorOrPunchline}</p>
        </div>
      </div>

      {/* Refresh and Action Bar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-[11px] text-slate-400 italic">
          Keep your spirits bright while debugging together!
        </span>
        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-rose-400 ${isRotating ? "animate-spin" : ""}`} />
          <span>Next Joke / Quote</span>
        </button>
      </div>
    </div>
  );
};
