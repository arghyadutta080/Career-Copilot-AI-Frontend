import { cn } from "@/lib/cn";
import { FileQuestion } from "lucide-react";
import { memo, type ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = memo(function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500 mb-4">
        {icon || <FileQuestion className="h-7 w-7" />}
      </div>
      <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-zinc-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
});
