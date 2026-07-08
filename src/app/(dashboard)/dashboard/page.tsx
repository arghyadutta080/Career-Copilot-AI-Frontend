"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart3, Target, MessageSquare, Briefcase, Plus, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useJobDescriptions } from "@/hooks/useAnalysis";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAnalysisCard } from "@/components/dashboard/RecentAnalysisCard";
import { StatCardSkeleton, ListItemSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql";
import { GET_ANALYSIS } from "@/lib/queries/analysis";
import type { Analysis, AnalysisListMeta, JobDescription } from "@/types";

/** Aggregated analysis data for dashboard stats & list */
interface DashboardAnalysis {
  analysisId: string;
  title: string;
  company: string;
  status: Analysis["status"];
  atsScore?: number;
  interviewReady: boolean;
  date: string;
}

/** Fetch all analyses across all job descriptions, then load full details for each */
async function fetchDashboardData(): Promise<DashboardAnalysis[]> {
  const jobs = await apiFetch<JobDescription[]>("/api/job-descriptions");

  // Fetch analysis metadata for each job
  const analysisPromises = jobs.map(async (job) => {
    const analyses = await apiFetch<AnalysisListMeta[]>(
      `/api/job-descriptions/${job._id}/analyses`
    );

    return analyses.map((a) => ({
      ...a,
      jobTitle: job.title,
      jobCompany: job.company,
    }));
  });

  const nestedAnalyses = await Promise.all(analysisPromises);
  const flatAnalyses = nestedAnalyses.flat();

  // Fetch full details for each analysis via GraphQL
  const client = getGraphQLClient();
  const detailPromises = flatAnalyses.map(async (meta) => {
    try {
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS,
        { id: meta._id }
      );
      const analysis = data.getAnalysis;
      return {
        analysisId: analysis.id,
        title: meta.jobTitle,
        company: meta.jobCompany,
        status: analysis.status,
        atsScore: analysis.results?.ats?.score,
        interviewReady: analysis.toolStatus?.interview === "completed",
        date: analysis.createdAt,
      } satisfies DashboardAnalysis;
    } catch {
      return {
        analysisId: meta._id,
        title: meta.jobTitle,
        company: meta.jobCompany,
        status: "failed" as const,
        interviewReady: false,
        date: meta.createdAt,
      } satisfies DashboardAnalysis;
    }
  });

  const results = await Promise.all(detailPromises);
  return results.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: analyses, isLoading } = useQuery<DashboardAnalysis[]>({
    queryKey: ["dashboard-analyses"],
    queryFn: fetchDashboardData,
    staleTime: 30 * 1000,
  });

  const stats = useMemo(() => {
    if (!analyses) return { total: 0, avgAts: 0, interviewReady: 0, applications: 0 };

    const completed = analyses.filter((a) => a.status === "completed");
    const avgAts =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, a) => sum + (a.atsScore || 0), 0) /
              completed.length
          )
        : 0;

    return {
      total: analyses.length,
      avgAts,
      interviewReady: analyses.filter((a) => a.interviewReady).length,
      applications: analyses.length,
    };
  }, [analyses]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Track your applications and AI analysis results.
          </p>
        </div>
        <Link
          href="/new-analysis"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-violet-500 shadow-lg shadow-violet-600/20"
        >
          <Plus className="h-4 w-4" />
          New Analysis
        </Link>
      </div>

      {/* Stats Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Analyses"
            value={stats.total}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard
            label="Average ATS Score"
            value={`${stats.avgAts}%`}
            icon={<Target className="h-5 w-5" />}
          />
          <StatCard
            label="Interview Ready"
            value={stats.interviewReady}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <StatCard
            label="Applications"
            value={stats.applications}
            icon={<Briefcase className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>
          {analyses && analyses.length > 4 && (
            <Link
              href="/analyses"
              className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        ) : analyses && analyses.length > 0 ? (
          <div className="space-y-3">
            {analyses.slice(0, 5).map((analysis) => (
              <RecentAnalysisCard
                key={analysis.analysisId}
                analysisId={analysis.analysisId}
                title={analysis.title}
                company={analysis.company}
                status={analysis.status}
                atsScore={analysis.atsScore}
                interviewReady={analysis.interviewReady}
                date={analysis.date}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No analyses yet"
            description="Create your first analysis to get AI-powered insights on your resume."
            action={
              <Link
                href="/new-analysis"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Analysis
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
