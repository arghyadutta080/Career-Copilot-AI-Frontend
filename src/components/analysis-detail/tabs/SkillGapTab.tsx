import { Card } from "@/components/ui/Card";
import { Zap, BookOpen, AlertCircle } from "lucide-react";
import { useAnalysisSkillGap } from "@/hooks/useAnalysis";
import { TabContentSkeleton } from "@/components/ui/Skeleton";

interface SkillGapTabProps {
  analysisId: string;
}

export function SkillGapTab({ analysisId }: SkillGapTabProps) {
  const { data: analysis, isLoading } = useAnalysisSkillGap(analysisId);
  const skillGap = analysis?.results?.skillGap;

  if (isLoading) {
    return <TabContentSkeleton />;
  }

  if (!skillGap) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <p>No Skill Gap results available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-zinc-300">{skillGap.summary}</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Missing Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillGap.missingSkills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 border border-red-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Recommended Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillGap.recommendedSkills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-400 border border-amber-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-400" />
          Learning Priority
        </h3>
        <div className="space-y-4">
          {skillGap.learningPriority.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-lg bg-violet-500/10 text-violet-400 font-bold">
                #{i + 1}
              </span>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-white">{item.skill}</h4>
                <p className="text-sm text-zinc-400 mt-1">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
