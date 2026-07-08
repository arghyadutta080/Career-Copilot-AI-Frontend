"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getGraphQLClient } from "@/lib/graphql";
import { GET_ANALYSIS } from "@/lib/queries/analysis";
import { RecentAnalysisCard } from "@/components/dashboard/RecentAnalysisCard";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Analysis, AnalysisListMeta, JobDescription } from "@/types";

interface AnalysisListItem {
  analysisId: string;
  title: string;
  company: string;
  status: Analysis["status"];
  atsScore?: number;
  interviewReady: boolean;
  date: string;
}

async function fetchAllAnalyses(): Promise<AnalysisListItem[]> {
  const jobs = await apiFetch<JobDescription[]>("/api/job-descriptions");
  const client = getGraphQLClient();

  const all = await Promise.all(
    jobs.map(async (job) => {
      const metas = await apiFetch<AnalysisListMeta[]>(
        `/api/job-descriptions/${job._id}/analyses`
      );

      return Promise.all(
        metas.map(async (m) => {
          try {
            const { getAnalysis: a } = await client.request<{
              getAnalysis: Analysis;
            }>(GET_ANALYSIS, { id: m._id });

            return {
              analysisId: a.id,
              title: job.title,
              company: job.company,
              status: a.status,
              atsScore: a.results?.ats?.score,
              interviewReady: a.toolStatus?.interview === "completed",
              date: a.createdAt,
            } satisfies AnalysisListItem;
          } catch {
            return {
              analysisId: m._id,
              title: job.title,
              company: job.company,
              status: "failed" as const,
              interviewReady: false,
              date: m.createdAt,
            } satisfies AnalysisListItem;
          }
        })
      );
    })
  );

  return all
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

type StatusFilter = "all" | "completed" | "running" | "pending" | "failed";

export default function AnalysesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"recent" | "ats">("recent");

  const { data: analyses, isLoading } = useQuery<AnalysisListItem[]>({
    queryKey: ["all-analyses"],
    queryFn: fetchAllAnalyses,
    staleTime: 30 * 1000,
  });

  const filteredAnalyses = useMemo(() => {
    if (!analyses) return [];

    let result = analyses;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Sort
    if (sortBy === "ats") {
      result = [...result].sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
    }

    return result;
  }, [analyses, search, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analyses</h1>
          <p className="mt-1 text-sm text-zinc-400">
            All your resume analyses in one place.
          </p>
        </div>
        <Link
          href="/new-analysis"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20"
        >
          <Plus className="h-4 w-4" />
          New Analysis
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search analyses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 cursor-pointer appearance-none"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "ats")}
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 cursor-pointer appearance-none"
        >
          <option value="recent">Sort by: Recent</option>
          <option value="ats">Sort by: ATS Score</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      ) : filteredAnalyses.length > 0 ? (
        <div className="space-y-3">
          {filteredAnalyses.map((a) => (
            <RecentAnalysisCard
              key={a.analysisId}
              analysisId={a.analysisId}
              title={a.title}
              company={a.company}
              status={a.status}
              atsScore={a.atsScore}
              interviewReady={a.interviewReady}
              date={a.date}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No analyses found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Start a new analysis to see results here."
          }
          icon={<SlidersHorizontal className="h-7 w-7" />}
          action={
            !search && statusFilter === "all" ? (
              <Link
                href="/new-analysis"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Analysis
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
