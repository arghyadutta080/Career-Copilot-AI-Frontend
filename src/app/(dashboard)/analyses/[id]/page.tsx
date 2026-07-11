"use client";

import { use, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useAnalysis, useAnalysisStatus } from "@/hooks/useAnalysis";
import { AnalysisProgress } from "@/components/analysis-detail/AnalysisProgress";
import { AnalysisHeader } from "@/components/analysis-detail/AnalysisHeader";
import { AnalysisTabs } from "@/components/analysis-detail/AnalysisTabs";
import { TabContentSkeleton } from "@/components/ui/Skeleton";

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Poll for status while not completed
  const { data: statusData } = useAnalysisStatus(id);
  const isRunning =
    statusData?.status === "pending" || statusData?.status === "running";

  // Only fetch full data if completed
  const { data: analysis, isLoading } = useAnalysis(isRunning ? undefined : id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        {/* {statusData?.status !== "completed" ? (
          <div
            className="p-2 rounded-xl bg-zinc-900/30 text-zinc-600 cursor-not-allowed opacity-50 border border-zinc-850"
            title="Analysis is currently running, please wait..."
          >
            <ChevronLeft className="h-5 w-5" />
          </div>
        ) : ( */}
          <Link
            href="/analyses"
            className="p-2 rounded-xl bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        {/* )} */}
        <div>
          <h1 className="text-xl font-bold text-white">Analysis Details</h1>
        </div>
      </div>

      {isRunning || (statusData?.status && !analysis && isLoading) ? (
        <AnalysisProgress analysisId={id} initialStatus={statusData} />
      ) : analysis ? (
        <div className="space-y-6">
          {/* Header */}
          <AnalysisHeader analysis={analysis} />

          {/* Tabs */}
          <AnalysisTabs analysis={analysis} />
        </div>
      ) : (
        <TabContentSkeleton />
      )}
    </div>
  );
}
