import { cn } from "@/lib/cn";
import { memo } from "react";

type BadgeVariant = "completed" | "running" | "pending" | "failed" | "default" | "success" | "warning";

const variantStyles: Record<BadgeVariant, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pending: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  default: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge = memo(function Badge({
  variant = "default",
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-emerald-400": variant === "completed" || variant === "success",
            "bg-blue-400 animate-pulse": variant === "running",
            "bg-zinc-400": variant === "pending" || variant === "default",
            "bg-red-400": variant === "failed",
            "bg-amber-400": variant === "warning",
          })}
        />
      )}
      {children}
    </span>
  );
});
