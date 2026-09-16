import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accentColor?: "violet" | "rose" | "emerald" | "amber" | "cyan";
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "rose",
}) => {
  const colorMap = {
    violet: "from-violet-500/20 to-purple-500/5 text-violet-400 border-violet-500/20",
    rose: "from-rose-500/20 to-pink-500/5 text-rose-400 border-rose-500/20",
    emerald: "from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/20",
    amber: "from-amber-500/20 to-yellow-500/5 text-amber-400 border-amber-500/20",
    cyan: "from-cyan-500/20 to-blue-500/5 text-cyan-400 border-cyan-500/20",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]",
        colorMap[accentColor]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="rounded-xl bg-white/5 p-2 backdrop-blur-sm">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-white">{value}</span>
        {trend && (
          <span className="text-[11px] font-semibold text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>}
    </div>
  );
};
