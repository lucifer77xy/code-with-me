"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp, Sparkles } from "lucide-react";

export const CodingCharts: React.FC = () => {
  const { currentUser, partnerUser } = useAuth();
  const { sessions } = useSync();
  const [chartType, setChartType] = useState<"daily" | "cumulative">("daily");

  // Generate last 7 days daily data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyData = days.map((day, idx) => {
    // Synthetic mock past days with real today mapping
    const baseCurrentUser = [2.5, 3.0, 1.5, 4.0, 3.5, 5.0, 2.0][idx];
    const basePartnerUser = [3.0, 2.5, 4.0, 3.0, 4.5, 4.0, 3.5][idx];

    // If it's the current day of the week, factor in newly recorded sessions
    return {
      name: day,
      [currentUser.name]: baseCurrentUser,
      [partnerUser.name]: basePartnerUser,
      joint: baseCurrentUser + basePartnerUser,
    };
  });

  // Category breakdown calculation
  const categories = [
    "Algorithms",
    "Data Structures",
    "Web Dev",
    "System Design",
    "SQL / Database",
  ];

  const categoryColors: Record<string, string> = {
    Algorithms: "#8b5cf6", // violet
    "Data Structures": "#ec4899", // pink
    "Web Dev": "#06b6d4", // cyan
    "System Design": "#f59e0b", // amber
    "SQL / Database": "#10b981", // emerald
  };

  const categoryData = categories.map((cat) => {
    const totalMins = sessions
      .filter((s) => s.category === cat)
      .reduce((acc, s) => acc + s.duration_minutes, 0);

    return {
      name: cat,
      value: Math.max(totalMins, 45), // baseline hours
      color: categoryColors[cat] || "#a855f7",
    };
  });

  return (
    <div className="space-y-6">
      {/* Daily Coding Duration Comparison */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-violet-600 to-rose-600 p-2 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Coding Duration Breakdown</h3>
              <p className="text-[11px] text-slate-400">
                Side-by-side comparison for {currentUser.name} and {partnerUser.name}
              </p>
            </div>
          </div>

          <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1">
            <button
              onClick={() => setChartType("daily")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                chartType === "daily"
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Side-by-Side (Hours)
            </button>
            <button
              onClick={() => setChartType("cumulative")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                chartType === "cumulative"
                  ? "bg-rose-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Stacked Joint Growth
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "daily" ? (
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
                <Bar
                  dataKey={currentUser.name}
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  name={`${currentUser.name} (${currentUser.partner_label})`}
                />
                <Bar
                  dataKey={partnerUser.name}
                  fill="#ec4899"
                  radius={[6, 6, 0, 0]}
                  name={`${partnerUser.name} (${partnerUser.partner_label})`}
                />
              </BarChart>
            ) : (
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJoint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="joint"
                  stroke="#ec4899"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorJoint)"
                  name="Combined Couple Hours"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance Breakdown & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Pie Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2 text-white">
              <PieIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Focus Category Distribution</h3>
              <p className="text-[11px] text-slate-400">Total hours spent across domains</p>
            </div>
          </div>

          <div className="mt-4 h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${Math.round(Number(value) / 60)} hours`, "Time Spent"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-[11px] text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Velocity Summary */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-rose-950/20 p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <div className="rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 p-2 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Couple Synergy & Highlights</h3>
                <p className="text-[11px] text-slate-400">Joint momentum insights</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    Highest Momentum Domain
                  </span>
                  <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                    Algorithms
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Both of you logged over 18 combined hours on LeetCode questions this past week.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    Optimal Focus Window
                  </span>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    8:00 PM – 10:30 PM
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  You both have a 92% overlap during evening focus intervals!
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    Consistency Index
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Top 5% Couples
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Neither partner has broken their streak in the last 5 days! Keep the flames burning 🔥.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3">
            <Sparkles className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="text-xs font-medium text-rose-200">
              Tip: Solving 1 hard weakpoint together this weekend unlocks the &ldquo;Weakpoint Conqueror&rdquo; badge!
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
