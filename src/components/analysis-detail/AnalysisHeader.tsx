import { memo } from "react";
import { Briefcase, Download, ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Analysis, JobDescription } from "@/types";

// Note: Since we didn't fetch the full JobDescription object in GET_ANALYSIS, 
// we will need to fetch it or pass it. For now, we assume it's available via a hook or prop.
// Actually, GET_ANALYSIS in my queries didn't fetch job description details.
// Let's modify the GET_ANALYSIS query later if needed, but for now we can fetch it here or use a hook.

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface AnalysisHeaderProps {
  analysis: Analysis;
}

export const AnalysisHeader = memo(function AnalysisHeader({ analysis }: AnalysisHeaderProps) {
  const { data: job } = useQuery<JobDescription>({
    queryKey: ["job-description", analysis.jobDescriptionId],
    queryFn: () => apiFetch<JobDescription>(`/api/job-descriptions/${analysis.jobDescriptionId}`),
  });

  const formattedDate = new Date(analysis.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {job?.title || "Loading..."}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">{job?.company || "Loading..."}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="completed" dot>Analysis Completed</Badge>
            {analysis.results?.ats?.score && (
              <Badge variant={analysis.results.ats.score >= 80 ? "success" : analysis.results.ats.score >= 60 ? "warning" : "failed"}>
                ATS: {analysis.results.ats.score}%
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
          <ExternalLink className="h-4 w-4" />
          View Job
        </button>
        <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>
    </div>
  );
});
