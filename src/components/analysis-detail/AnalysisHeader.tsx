import { memo, useState } from "react";
import { Briefcase, Download, ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Analysis, JobDescription } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { JobDescriptionModal } from "@/components/ui/JobDescriptionModal";

interface AnalysisHeaderProps {
  analysis: Analysis;
}

export const AnalysisHeader = memo(function AnalysisHeader({ analysis }: AnalysisHeaderProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { data: job } = useQuery<JobDescription>({
    queryKey: ["job-description", analysis.jobDescriptionId],
    queryFn: () => apiFetch<JobDescription>(`/api/job-descriptions/${analysis.jobDescriptionId}`),
  });

  // Support both numeric timestamp strings and standard ISO strings
  const parsedDate = isNaN(Number(analysis.createdAt)) 
    ? new Date(analysis.createdAt) 
    : new Date(Number(analysis.createdAt));
  const formattedDate = !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Invalid Date";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
          <Briefcase className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white break-words">
            {job?.title || "Loading..."}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300 truncate">{job?.company || "Loading..."}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="completed" dot>Analysis Completed</Badge>
            {analysis.results?.ats?.score && (
              <Badge variant={analysis.results.ats.score >= 80 ? "success" : analysis.results.ats.score >= 60 ? "warning" : "failed"}>
                ATS: {analysis.results.ats.score}%
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors cursor-pointer w-full md:w-auto"
        >
          <ExternalLink className="h-4 w-4" />
          View Job
        </button>
      </div>

      {/* Preview Modal */}
      <JobDescriptionModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        job={job || null}
      />
    </div>
  );
});
