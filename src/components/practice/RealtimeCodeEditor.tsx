"use client";

import React, { useState } from "react";
import { useRealtimePractice } from "@/lib/useRealtimePractice";
import { useAuth } from "@/context/AuthContext";
import { formatSeconds } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Code2, 
  Terminal, 
  Copy, 
  Check, 
  Radio, 
  Users, 
  Laptop, 
  Clock, 
  Flame, 
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface CodingChallengePreset {
  id: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: string;
  starterCode: string;
}

const CHALLENGE_PRESETS: CodingChallengePreset[] = [
  {
    id: "two-sum",
    title: "Two Sum Problem",
    category: "Algorithms",
    difficulty: "Easy",
    language: "typescript",
    starterCode: `// Two Sum Problem
// Given an array of integers 'nums' and an integer 'target', 
// return indices of the two numbers such that they add up to target.

function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  
  return [];
}

// Test Call
console.log("Result:", twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
`,
  },
  {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    category: "Data Structures",
    difficulty: "Easy",
    language: "typescript",
    starterCode: `// Valid Palindrome
// Return true if the string is a palindrome after converting all uppercase letters 
// into lowercase letters and removing all non-alphanumeric characters.

function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0;
  let right = clean.length - 1;
  
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  
  return true;
}

// Test Call
console.log("Is 'race a car' palindrome?", isPalindrome("race a car")); // false
console.log("Is 'A man, a plan, a canal: Panama' palindrome?", isPalindrome("A man, a plan, a canal: Panama")); // true
`,
  },
  {
    id: "debounce-fn",
    title: "Custom Debounce Function",
    category: "Web Dev",
    difficulty: "Medium",
    language: "typescript",
    starterCode: `// Implement a Debounce Function
// Debouncing ensures that execution of a function is delayed until after N milliseconds
// have elapsed since the last time it was invoked.

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// Demonstration
const logMessage = debounce((msg: string) => console.log("Logged:", msg), 500);
logMessage("Call 1");
logMessage("Call 2 (only this executes after 500ms)");
`,
  },
  {
    id: "sandbox",
    title: "Freeform Couple Sandbox",
    category: "Playground",
    difficulty: "Easy",
    language: "javascript",
    starterCode: `// Welcome to the Live Couple Coding Sandbox!
// Type code here and User B will see it in real-time.
// Have fun, test ideas, and solve problems together!

function pairGreeting(partnerA, partnerB) {
  return \`\${partnerA} & \${partnerB} are crushing it today! 💕\`;
}

console.log(pairGreeting("Me", "Girlfriend"));
`,
  },
];

interface RealtimeCodeEditorProps {
  practiceHook: ReturnType<typeof useRealtimePractice>;
}

export const RealtimeCodeEditor: React.FC<RealtimeCodeEditorProps> = ({ practiceHook }) => {
  const { currentUser, partnerUser } = useAuth();
  const {
    code,
    language,
    challengeTitle,
    timerSeconds,
    isTimerRunning,
    presenceUsers,
    partnerTyping,
    isConnected,
    updateCode,
    setLanguage,
    setChallengeTitle,
    startTimer,
    pauseTimer,
    resetTimer,
    saveCompletedPractice,
  } = practiceHook;

  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Challenge selection handler
  const handleSelectPreset = (preset: CodingChallengePreset) => {
    setChallengeTitle(preset.title);
    setLanguage(preset.language);
    updateCode(preset.starterCode);
    toast.info(`Switched to challenge: ${preset.title}`, {
      description: "Code and challenge synced to your partner.",
    });
  };

  // Safe run code simulation
  const handleRunCode = () => {
    setIsRunningCode(true);
    setConsoleOutput(["[Executing in browser sandbox...]"]);

    setTimeout(() => {
      const logs: string[] = [];
      const originalLog = console.log;

      try {
        console.log = (...args: any[]) => {
          logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
        };

        // Basic execution for quick verification
        // eslint-disable-next-line no-eval
        const result = eval(code);
        if (result !== undefined && logs.length === 0) {
          logs.push(`Returned: ${typeof result === "object" ? JSON.stringify(result) : String(result)}`);
        }

        if (logs.length === 0) {
          logs.push("[Code executed successfully with 0 console logs]");
        }
        setConsoleOutput(logs);
      } catch (err: any) {
        setConsoleOutput([`Error: ${err?.message || "Syntax or Runtime Error"}`]);
      } finally {
        console.log = originalLog;
        setIsRunningCode(false);
      }
    }, 400);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.info("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompleteChallenge = async () => {
    setIsSubmitting(true);
    try {
      await saveCompletedPractice({
        codeSnippet: code,
        timerDurationSeconds: timerSeconds,
        status: "completed",
        challengeTitle,
        language,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check which users are in presence
  const isPartnerOnline = presenceUsers.some(
    (u) => u.userId === partnerUser.id || (u.displayName && u.displayName === partnerUser.name)
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
      {/* Top Header: Session & Presence Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-violet-600 to-rose-600 p-2 text-white shadow-md">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {challengeTitle}
                </h2>
                <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300 border border-violet-500/30">
                  {language}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live Collaborative Pair Programming Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Live Presence & Connection Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* WebSocket status pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isConnected ? "bg-emerald-400" : "bg-amber-400"
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="text-[11px] font-medium text-slate-300">
              {isConnected ? "Realtime WebSocket" : "Connecting..."}
            </span>
          </div>

          {/* Partner Presence Pill */}
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs">
            <div className="relative">
              <img
                src={partnerUser.avatar_url || "/girl-profile.jpg"}
                alt={partnerUser.name}
                className="h-6 w-6 rounded-full object-cover border border-rose-400"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-slate-900 ${
                  isPartnerOnline ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
            </div>
            <span className="font-semibold text-rose-200 text-[11px]">
              {partnerUser.name}: {isPartnerOnline ? "Online in Room" : "Away"}
            </span>
          </div>
        </div>
      </div>

      {/* Challenge Presets & Timer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Challenge selector dropdown */}
        <div className="md:col-span-6 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-rose-400" />
            Preset:
          </span>
          <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CHALLENGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`rounded-xl px-2.5 py-1 text-xs font-medium whitespace-nowrap border transition-all ${
                  challengeTitle === preset.title
                    ? "border-rose-500/50 bg-rose-500/20 text-rose-200 font-bold"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Synchronized Timer Controls */}
        <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-2 bg-slate-950/80 rounded-2xl border border-white/10 p-1.5 px-3">
          <div className="flex items-center gap-1.5 font-mono text-sm font-black text-rose-400">
            <Clock className="h-4 w-4 text-rose-400" />
            <span>{formatSeconds(timerSeconds)}</span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {isTimerRunning ? (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-1 rounded-xl bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => startTimer()}
              className="flex items-center gap-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-emerald-300" />
              <span>Start Timer</span>
            </button>
          )}

          <button
            onClick={() => resetTimer(0)}
            className="rounded-xl border border-white/10 bg-white/5 p-1 text-slate-400 hover:text-white transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Typing Indicator if partner is writing code */}
      {partnerTyping?.isTyping && (
        <div className="flex items-center gap-2 rounded-xl bg-violet-600/10 border border-violet-500/20 px-3 py-1.5 text-xs text-violet-300 animate-pulse">
          <Laptop className="h-3.5 w-3.5 animate-bounce text-violet-400" />
          <span>
            <strong>{partnerTyping.name}</strong> is typing code right now...
          </span>
        </div>
      )}

      {/* Live Synchronized Code Editor Area */}
      <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden shadow-inner">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-slate-400">solution.ts</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Textarea Code Input */}
        <div className="relative flex">
          {/* Line Numbers gutter */}
          <div className="select-none py-3 px-2 text-right font-mono text-xs text-slate-600 border-r border-white/5 bg-slate-950/80 w-10">
            {code.split("\n").map((_, idx) => (
              <div key={idx} className="leading-6">
                {idx + 1}
              </div>
            ))}
          </div>

          {/* Actual Editable Area */}
          <textarea
            value={code}
            onChange={(e) => updateCode(e.target.value, true)}
            spellCheck={false}
            rows={Math.max(14, code.split("\n").length + 2)}
            className="flex-1 bg-transparent p-3 font-mono text-xs text-slate-100 leading-6 outline-none resize-none selection:bg-rose-500/30"
            placeholder="// Type or paste your code here. Every stroke syncs across to your partner..."
          />
        </div>
      </div>

      {/* Bottom Action Controls: Run Code & Complete Challenge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunningCode}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition-colors disabled:opacity-50"
          >
            <Terminal className="h-4 w-4 text-violet-400" />
            <span>{isRunningCode ? "Running..." : "Run Test"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCompleteChallenge}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isSubmitting ? "Saving..." : "Complete & Save to Shared History"}</span>
          </button>
        </div>
      </div>

      {/* Terminal / Run Console Output */}
      {consoleOutput.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-950 p-3.5 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-violet-300">
              <Terminal className="h-3.5 w-3.5" /> Output Console
            </span>
            <button
              onClick={() => setConsoleOutput([])}
              className="text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 pt-1">
            {consoleOutput.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.startsWith("Error:")
                    ? "text-rose-400"
                    : line.startsWith("[")
                    ? "text-slate-500"
                    : "text-emerald-300"
                }
              >
                &gt; {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
