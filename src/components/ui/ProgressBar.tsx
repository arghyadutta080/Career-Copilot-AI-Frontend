import { cn } from "@/lib/cn";
import { memo } from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: "violet" | "emerald" | "blue" | "amber";
  showLabel?: boolean;
  size?: "sm" | "md";
}

const colorMap = {
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
};

export const ProgressBar = memo(function ProgressBar({
  value,
  max = 100,
  className,
  color = "violet",
  showLabel = false,
  size = "sm",
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex-1 rounded-full bg-zinc-800 overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorMap[color]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-400 tabular-nums w-10 text-right">
          {percent}%
        </span>
      )}
    </div>
  );
});
