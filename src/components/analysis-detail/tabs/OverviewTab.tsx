import { RadialScore } from "@/components/ui/RadialScore";
import { Card } from "@/components/ui/Card";
import { Target, Zap, MessageSquare, Map, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import type { Analysis } from "@/types";

interface OverviewTabProps {
  analysis: Analysis;
  onNavigate: (tabId: string) => void;
}

export function OverviewTab({ analysis, onNavigate }: OverviewTabProps) {
  const { results } = analysis;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Key Stats */}
      <div className="md:col-span-1 space-y-6">
        <Card className="flex flex-col items-center justify-center py-8">
          <h3 className="text-sm font-medium text-zinc-400 mb-6">ATS Compatibility</h3>
          <RadialScore score={results?.ats?.score || 0} size="lg" />
          <p className="mt-6 text-sm text-center text-zinc-400 px-4">
            {results?.ats?.score && results.ats.score >= 80
              ? "Your resume is highly optimized for this role."
              : "There is room for improvement to pass ATS filters."}
          </p>
          <button
            onClick={() => onNavigate("ats")}
            className="mt-6 text-sm text-violet-400 hover:text-violet-300 font-medium"
          >
            View Details &rarr;
          </button>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate("optimizer")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <FileText className="h-4 w-4 text-blue-400" />
              Get Optimized Resume
            </button>
            <button
              onClick={() => onNavigate("cover-letter")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <FileText className="h-4 w-4 text-emerald-400" />
              Copy Cover Letter
            </button>
            <button
              onClick={() => onNavigate("interview")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-violet-400" />
              Practice Interview
            </button>
          </div>
        </Card>
      </div>

      {/* Right Column: Summaries */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Top Strengths
            </h3>
            <button onClick={() => onNavigate("ats")} className="text-xs text-violet-400 hover:text-violet-300">
              View all
            </button>
          </div>
          <ul className="space-y-3">
            {results?.ats?.strengths?.slice(0, 3).map((strength, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-red-400" />
              Areas to Improve
            </h3>
            <button onClick={() => onNavigate("skills")} className="text-xs text-violet-400 hover:text-violet-300">
              View Skill Gap
            </button>
          </div>
          <ul className="space-y-3">
            {results?.ats?.weaknesses?.slice(0, 3).map((weakness, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-400" />
              Next Steps
            </h3>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300">
            {results?.roadmap?.overview || "Loading learning roadmap overview..."}
          </div>
          <button
            onClick={() => onNavigate("roadmap")}
            className="mt-4 w-full py-2.5 rounded-xl bg-zinc-800 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            View Full Learning Roadmap
          </button>
        </Card>
      </div>
    </div>
  );
}
