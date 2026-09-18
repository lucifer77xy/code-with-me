"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import { QUIZ_QUESTIONS } from "@/data/quizQuestions";
import { QuizQuestion, QuizResult } from "@/types";
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Timer, 
  Trophy, 
  ArrowRight, 
  RotateCcw,
  BookOpen
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { generateUUID } from "@/lib/utils";
import confetti from "canvas-confetti";
import { toast } from "sonner";

type QuizCategory = QuizQuestion["category"];

const CATEGORIES: QuizCategory[] = [
  "JavaScript",
  "Python",
  "Data Structures",
  "SQL",
  "Web Development",
];

export const QuizModule: React.FC = () => {
  const { currentUser, partnerUser } = useAuth();
  const { unlockBadge } = useSync();

  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>("JavaScript");
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(30);

  // Filter questions for the active category
  useEffect(() => {
    const list = QUIZ_QUESTIONS.filter((q) => q.category === selectedCategory);
    setCurrentQuestions(list);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
    setQuestionTimer(30);
  }, [selectedCategory]);

  const currentQ = currentQuestions[currentIndex];

  // Question countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!isAnswerSubmitted && !isQuizCompleted && currentQ) {
      timer = setInterval(() => {
        setQuestionTimer((prev) => {
          if (prev <= 1) {
            handleOptionSelect(-1); // timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnswerSubmitted, isQuizCompleted, currentQ, currentIndex]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionIndex);
    setIsAnswerSubmitted(true);

    if (currentQ && optionIndex === currentQ.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuestionTimer(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsQuizCompleted(true);
    const finalScore = score + (selectedOption === currentQ?.correctAnswerIndex ? 1 : 0);
    const total = currentQuestions.length;
    const percentage = Math.round((finalScore / total) * 100);

    if (percentage === 100) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
      unlockBadge(currentUser.id, "quiz_champion");
    }

    // Save result
    const result: QuizResult = {
      id: generateUUID(),
      user_id: currentUser.id,
      category: selectedCategory,
      score: finalScore,
      total_questions: total,
      percentage,
      time_taken_seconds: 30 * total - questionTimer,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from("quiz_results").insert(result);
        if (error) throw error;
      } catch (e) {
        console.error(e);
        toast.error("Quiz result was not saved to the shared backend.");
      }
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
    setQuestionTimer(30);
  };

  return (
    <div className="space-y-6">
      {/* Category selector pills */}
      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-slate-900/80 p-3 backdrop-blur-xl shadow-lg">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-md shadow-rose-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quiz Runner or Quiz Completed Card */}
      {!isQuizCompleted && currentQ ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          {/* Header info */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-300 border border-violet-500/30">
                {currentQ.category} • {currentQ.difficulty}
              </span>
              <span className="text-xs text-slate-400">
                Question {currentIndex + 1} of {currentQuestions.length}
              </span>
            </div>

            {/* Timer countdown */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs font-bold">
              <Timer className={`h-4 w-4 ${questionTimer <= 5 ? "text-rose-500 animate-bounce" : "text-amber-400"}`} />
              <span className={questionTimer <= 5 ? "text-rose-400" : "text-slate-200"}>
                {questionTimer}s
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Code Snippet if applicable */}
            {currentQ.codeSnippet && (
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950 p-4 font-mono text-xs text-rose-300">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctAnswerIndex;

              let btnStyle = "border-white/10 bg-slate-950/60 text-slate-300 hover:border-violet-500/40 hover:bg-slate-950";
              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold";
                } else if (isSelected) {
                  btnStyle = "border-rose-500/50 bg-rose-500/10 text-rose-300 font-semibold";
                } else {
                  btnStyle = "border-white/5 bg-slate-950/30 text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left rounded-2xl border p-4 text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswerSubmitted && (
                    <div>
                      {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                      {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback and Explanation */}
          {isAnswerSubmitted && (
            <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-4 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
                <BookOpen className="h-4 w-4 text-violet-400" />
                Explanation
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswerSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <span>
                  {currentIndex + 1 < currentQuestions.length ? "Next Question" : "View Results"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished View */
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center backdrop-blur-xl shadow-xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-violet-600 p-0.5 shadow-xl shadow-rose-500/30">
            <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-slate-950">
              <Trophy className="h-10 w-10 text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">
              {selectedCategory} Quiz Complete
            </span>
            <h2 className="text-3xl font-black text-white">
              {score} / {currentQuestions.length} Correct
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {score === currentQuestions.length
                ? "Flawless score! You are a master at this topic! 🌟 Quiz Champion badge unlocked!"
                : "Great practice! Reviewing these explanations together is how we level up!"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={restartQuiz}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4 text-slate-400" />
              Try Again
            </button>
            <button
              onClick={() => {
                const nextCatIndex = (CATEGORIES.indexOf(selectedCategory) + 1) % CATEGORIES.length;
                setSelectedCategory(CATEGORIES[nextCatIndex]);
              }}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" />
              Next Category Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
