"use client";

import { useState } from "react";
import { Briefcase, Search, Plus, Trash2 } from "lucide-react";
import { useJobDescriptions } from "@/hooks/useAnalysis";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function JobDescriptionsPage() {
  const { data: jobs, isLoading, refetch } = useJobDescriptions();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await apiFetch(`/api/job-descriptions/${confirmDeleteId}`, { method: "DELETE" });
      await refetch();
    } catch (err) {
      console.error("Failed to delete job description", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filteredJobs = jobs?.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Descriptions</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Target roles you are applying for.
          </p>
        </div>
        <Link
          href="/new-analysis"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20"
        >
          <Plus className="h-4 w-4" />
          Add Job
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search job titles or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-48">
              <ListItemSkeleton />
            </Card>
          ))
        ) : filteredJobs && filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job._id} className="flex flex-col h-48 group relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setConfirmDeleteId(job._id)}
                  disabled={deletingId === job._id}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Delete Job Description"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-4 pr-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 font-bold">
                  {job.company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {job.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 truncate">
                    {job.company}
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-3 mb-4 flex-1">
                {job.description}
              </p>
              <div className="text-xs text-zinc-600 pt-3 border-t border-zinc-800/60">
                Added {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No job descriptions found"
              description="Add a target job description when starting a new analysis."
              icon={<Briefcase className="h-7 w-7" />}
              action={
                <Link
                  href="/new-analysis"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Start Analysis
                </Link>
              }
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Job Description?"
        message="Are you sure you want to delete this job description? Deleting it will also permanently delete all associated analyses. This action cannot be undone."
        isLoading={deletingId !== null}
      />
    </div>
  );
}
