"use client";

import React, { useState } from "react";
import { JOKES_AND_QUOTES, Item } from "@/data/jokesAndQuotes";
import { Smile, Quote, Sparkles, RefreshCw, Heart, MessageCircle } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-2 text-white">
            <Smile className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Motivation & Mind Refreshers</h3>
            <p className="text-[11px] text-slate-400">Jokes, wholesome dev love, and quotes</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 p-1">
          <button
            onClick={() => {
              setFilter("all");
              setCurrentIndex(0);
            }}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
              filter === "all"
                ? "bg-white/15 text-white"
                : "text-slate-400 hover:text-white"
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
      </div>

      {/* Content Display Card */}
      <div className={`my-5 transition-opacity duration-300 ${isRotating ? "opacity-30" : "opacity-100"}`}>
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
          <p className="mt-2 text-sm font-bold text-rose-400">
            {currentItem.authorOrPunchline}
          </p>
        </div>
      </div>

      {/* Refresh and Action Bar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-[11px] text-slate-400 italic">
          Keep your spirits bright while debugging!
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
