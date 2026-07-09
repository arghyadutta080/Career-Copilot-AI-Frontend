"use client";

import { useState } from "react";
import { FileText, Plus, Search, Trash2, Eye, X, ExternalLink } from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { ParsedResumeView } from "@/components/resumes/ParsedResumeView";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function ResumesPage() {
  const { data: resumes, isLoading, refetch } = useResumes();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await apiFetch(`/api/resumes/${confirmDeleteId}`, { method: "DELETE" });
      await refetch();
    } catch (err) {
      console.error("Failed to delete resume", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filteredResumes = resumes?.filter((r) =>
    r.originalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Library</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your uploaded resumes.
          </p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search resumes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-40">
              <ListItemSkeleton />
            </Card>
          ))
        ) : filteredResumes && filteredResumes.length > 0 ? (
          filteredResumes.map((resume) => (
            <Card key={resume._id} className="flex flex-col justify-between h-40 group relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <button
                  onClick={() => setPreviewResume(resume)}
                  className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Preview Resume"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(resume._id)}
                  disabled={deletingId === resume._id}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Delete Resume"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white truncate max-w-[180px]">
                    {resume.originalName}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Badge variant={resume.isActive ? "success" : "default"}>
                  {resume.isActive ? "Active" : "Archived"}
                </Badge>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No resumes found"
              description="Upload a resume when starting a new analysis."
              icon={<FileText className="h-7 w-7" />}
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white truncate pr-4">{previewResume.originalName}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewResume.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">View Original</span>
                </a>
                <div className="h-6 w-px bg-zinc-800 mx-1"></div>
                <button
                  onClick={() => setPreviewResume(null)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:text-red-400 rounded-lg transition-colors"
                  title="Close Preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 bg-zinc-950/80 relative flex overflow-hidden">
              <ParsedResumeView data={previewResume.parsedData} />
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Resume?"
        message="Are you sure you want to delete this resume? Deleting this resume will also permanently delete all associated analyses. This action cannot be undone."
        isLoading={deletingId !== null}
      />
    </div>
  );
}
