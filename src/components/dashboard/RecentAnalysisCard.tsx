"use client";

import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { AnalysisStatus } from "@/types";

interface RecentAnalysisCardProps {
  analysisId: string;
  title: string;
  company: string;
  status: AnalysisStatus;
  atsScore?: number;
  interviewReady: boolean;
  date: string;
}

const statusVariantMap: Record<AnalysisStatus, "completed" | "running" | "pending" | "failed"> = {
  completed: "completed",
  running: "running",
  pending: "pending",
  failed: "failed",
};

export const RecentAnalysisCard = memo(function RecentAnalysisCard({
  analysisId,
  title,
  company,
  status,
  atsScore,
  interviewReady,
  date,
}: RecentAnalysisCardProps) {
  // Support both numeric timestamp strings and standard ISO strings
  const parsedDate = isNaN(Number(date)) ? new Date(date) : new Date(Number(date));
  const formattedDate = !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Invalid Date";

  return (
    <Link
      href={`/analyses/${analysisId}`}
      className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/70 group"
    >
      {/* Company icon placeholder */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 text-violet-400 font-bold text-sm border border-violet-500/10">
        {company ? company.charAt(0).toUpperCase() : title.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
          {title}
        </p>
        <p className="text-xs text-zinc-500 truncate">{company || "No company"}</p>
      </div>

      {/* Status */}
      <Badge variant={statusVariantMap[status]} dot className="shrink-0">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>

      {/* ATS Score */}
      {atsScore !== undefined && status === "completed" && (
        <div className="hidden sm:flex flex-col items-end shrink-0 w-20">
          <span className="text-xs text-zinc-500">ATS Score</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{atsScore}%</span>
          </div>
        </div>
      )}

      {status === "running" && (
        <div className="hidden sm:block w-24 shrink-0">
          <ProgressBar value={50} color="blue" />
        </div>
      )}

      {/* Interview status */}
      {status === "completed" && (
        <div className="hidden md:block shrink-0">
          {interviewReady ? (
            <Badge variant="success" dot>Interview Ready</Badge>
          ) : (
            <Badge variant="warning">Not Interview Ready</Badge>
          )}
        </div>
      )}

      {/* Date */}
      <span className="hidden lg:block text-xs text-zinc-500 shrink-0 w-24 text-right">
        {formattedDate}
      </span>
    </Link>
  );
});
