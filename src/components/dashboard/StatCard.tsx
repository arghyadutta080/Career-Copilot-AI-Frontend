import { cn } from "@/lib/cn";
import { memo, type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  className?: string;
}

export const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  delta,
  deltaType = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-5 transition-all duration-200 hover:border-zinc-700",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {delta && (
            <p
              className={cn("text-xs", {
                "text-emerald-400": deltaType === "positive",
                "text-red-400": deltaType === "negative",
                "text-zinc-500": deltaType === "neutral",
              })}
            >
              {delta}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
          {icon}
        </div>
      </div>
    </div>
  );
});
