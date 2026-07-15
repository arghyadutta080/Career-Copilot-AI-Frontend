"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Trash2, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useUsage } from "@/hooks/useAnalysis";
import { RecentAnalysisCard } from "@/components/dashboard/RecentAnalysisCard";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import type { Analysis, DashboardOverviewItem } from "@/types";

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
  const data = await apiFetch<DashboardOverviewItem[]>("/api/analyses/dashboard");

  return data.map((item) => {
    const job = item.jobDescription;
    const a = item.analysis;

    return {
      analysisId: a.id,
      title: job ? job.title : "Unknown Role",
      company: job ? job.company : "Unknown Company",
      status: a.status,
      atsScore: a.results?.ats?.score,
      interviewReady: a.toolStatus?.interview === "completed",
      date: a.createdAt,
    } satisfies AnalysisListItem;
  });
}

type StatusFilter = "all" | "completed" | "running" | "pending" | "failed";

export default function AnalysesPage() {
  const { plan, setPlan } = useAuthStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"recent" | "ats">("recent");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { data: usage } = useUsage();

  // Sync plan into global store in case user navigated directly to this page
  // without visiting the dashboard first.
  useEffect(() => {
    if (usage?.plan) setPlan(usage.plan);
  }, [usage?.plan]);

  const isAtLimit = usage ? usage.remainingAnalysis === 0 : false;

  const { data: analyses, isLoading, refetch } = useQuery<AnalysisListItem[]>({
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

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allFilteredSelected = useMemo(() => {
    if (filteredAnalyses.length === 0) return false;
    return filteredAnalyses.every((a) => selectedIds.includes(a.analysisId));
  }, [filteredAnalyses, selectedIds]);

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = filteredAnalyses.map((a) => a.analysisId);
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredAnalyses.map((a) => a.analysisId);
      setSelectedIds((prev) => {
        const newSelection = [...prev];
        filteredIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          apiFetch(`/api/analyses/${id}`, { method: "DELETE" }).catch((err) => {
            console.error(`Failed to delete analysis ${id}`, err);
          })
        )
      );
      setSelectedIds([]);
      await refetch();
    } catch (err) {
      console.error("Bulk deletion failed", err);
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

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

        {isAtLimit ? (
          <button
            id="analyses-new-analysis-limit-btn"
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-violet-500/50 hover:text-white transition-all duration-200 shadow-lg"
          >
            <Zap className="h-4 w-4 text-violet-400" />
            Upgrade to Create
          </button>
        ) : (
          <Link
            id="analyses-new-analysis-btn"
            href="/new-analysis"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Link>
        )}
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

      {/* Selection Control Bar */}
      {!isLoading && filteredAnalyses.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/20 text-sm text-zinc-300">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="select-all"
              checked={allFilteredSelected}
              onChange={handleSelectAll}
              className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-900/60 text-violet-600 focus:ring-violet-500/50 cursor-pointer accent-violet-600"
            />
            <label htmlFor="select-all" className="cursor-pointer select-none font-medium text-zinc-300 hover:text-white transition-colors">
              Select All ({filteredAnalyses.length} analyses)
            </label>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      )}

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
            <div key={a.analysisId} className="flex items-center gap-3 w-full group">
              <input
                type="checkbox"
                checked={selectedIds.includes(a.analysisId)}
                onChange={() => handleToggleSelect(a.analysisId)}
                className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-900/60 text-violet-600 focus:ring-violet-500/50 cursor-pointer accent-violet-600 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <RecentAnalysisCard
                  analysisId={a.analysisId}
                  title={a.title}
                  company={a.company}
                  status={a.status}
                  atsScore={a.atsScore}
                  interviewReady={a.interviewReady}
                  date={a.date}
                />
              </div>
            </div>
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
              isAtLimit ? (
                <button
                  id="analyses-empty-upgrade-btn"
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade Plan
                </button>
              ) : (
                <Link
                  href="/new-analysis"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Analysis
                </Link>
              )
            ) : undefined
          }
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Analyses?"
        message={`Are you sure you want to permanently delete the ${selectedIds.length} selected analyses? This action cannot be undone.`}
        isLoading={deleting}
      />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
