import { RadialScore } from "@/components/ui/RadialScore";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useAnalysisATS } from "@/hooks/useAnalysis";
import { TabContentSkeleton } from "@/components/ui/Skeleton";

interface ATSAnalysisTabProps {
  analysisId: string;
}

export function ATSAnalysisTab({ analysisId }: ATSAnalysisTabProps) {
  const { data: analysis, isLoading } = useAnalysisATS(analysisId);
  const ats = analysis?.results?.ats;

  if (isLoading) {
    return <TabContentSkeleton />;
  }

  if (!ats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <p>No ATS analysis results available.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="flex flex-col items-center justify-center py-12">
        <RadialScore score={ats.score} size="lg" />
        <p className="mt-8 text-center text-zinc-300 max-w-sm">
          {ats.summary}
        </p>
      </Card>

      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Strengths
          </h3>
          <ul className="space-y-3">
            {ats.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Weaknesses
          </h3>
          <ul className="space-y-3">
            {ats.weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {ats.missingKeywords.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-400" />
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {ats.missingKeywords.map((keyword, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 border border-red-500/20"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
