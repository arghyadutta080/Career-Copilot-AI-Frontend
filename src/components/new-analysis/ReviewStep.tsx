import { useState } from "react";
import { PlayCircle, FileText, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useCreateAnalysis, useStartAnalysis } from "@/hooks/useAnalysis";
import type { Resume, JobDescription } from "@/types";

interface ReviewStepProps {
  resume: Resume;
  jobDescription: JobDescription;
  onBack: () => void;
  onComplete: (analysisId: string) => void;
}

export function ReviewStep({
  resume,
  jobDescription,
  onBack,
  onComplete,
}: ReviewStepProps) {
  const { mutateAsync: createAnalysis } = useCreateAnalysis();
  const { mutateAsync: startAnalysis } = useStartAnalysis();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setStarting(true);
    setError(null);

    try {
      // 1. Create analysis record
      const analysis = await createAnalysis({
        resumeId: resume._id,
        jobDescriptionId: jobDescription._id,
      });

      // 2. Start the pipeline
      await startAnalysis(analysis.id);

      // 3. Navigate to progress view
      onComplete(analysis.id);
    } catch (err: any) {
      setError(err.message || "Failed to start analysis");
      setStarting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_30px_rgba(139,92,246,0.3)] text-white mb-6">
          <PlayCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Ready to Analyze</h2>
        <p className="mt-2 text-zinc-400 max-w-sm mx-auto">
          We will analyze your resume against this job description and generate personalized insights.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
              Selected Resume
            </p>
            <p className="text-sm font-medium text-white truncate">
              {resume.originalName}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
              Target Job
            </p>
            <p className="text-sm font-medium text-white truncate">
              {jobDescription.title}
            </p>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {jobDescription.company}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
        <h3 className="text-sm font-medium text-violet-300 mb-2">What you'll get:</h3>
        <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-zinc-400">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            ATS Compatibility Score
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Skill Gap Analysis
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Resume Optimization
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Custom Cover Letter
          </li>
        </ul>
      </div>

      {error && (
        <p className="text-sm text-center text-red-400 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-zinc-800/60 mt-8">
        <button
          onClick={onBack}
          disabled={starting}
          className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleStart}
          disabled={starting}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
        >
          {starting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Starting Analysis...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Start Analysis
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
