import { cn } from "@/lib/cn";
import { memo, type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = memo(function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6",
        hover && "transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80",
        className
      )}
    >
      {children}
    </div>
  );
});
