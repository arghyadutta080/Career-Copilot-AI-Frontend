"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useSSE } from "@/hooks/useSSE";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Analysis, ToolStatusValue } from "@/types";

interface AnalysisProgressProps {
  analysisId: string;
  initialStatus?: Pick<Analysis, "id" | "status" | "toolStatus">;
}

const pipelineSteps = [
  { id: "ats", label: "ATS Analysis" },
  { id: "skillGap", label: "Skill Gap Analysis" },
  { id: "optimizer", label: "Resume Optimization" },
  { id: "coverLetter", label: "Cover Letter Generation" },
  { id: "interview", label: "Interview Preparation" },
  { id: "roadmap", label: "Learning Roadmap" },
] as const;

export function AnalysisProgress({ analysisId, initialStatus }: AnalysisProgressProps) {
  // Connect to SSE stream
  useSSE(analysisId);
  const { progress, currentStep, hasError, events } = useAnalysisProgressStore();

  const getStepStatus = (
    stepId: string
  ): "pending" | "running" | "completed" | "error" => {
    // If we have live events that indicate completion, use them
    const stepEvents = events.filter((e) => e.step === stepId);
    if (stepEvents.some((e) => e.type === "error")) return "error";
    if (stepEvents.some((e) => e.type === "complete")) return "completed";

    // Fall back to initial polling status
    if (initialStatus?.toolStatus) {
      const status = initialStatus.toolStatus[stepId as keyof typeof initialStatus.toolStatus] as ToolStatusValue;
      if (status === "completed") return "completed";
      if (status === "failed") return "error";
      if (status === "running") return "running";
    }

    // Determine running based on current SSE step
    if (currentStep === stepId) return "running";

    // Infer completion based on step order if we don't have explicit status
    const currentIndex = pipelineSteps.findIndex((s) => s.id === currentStep);
    const thisIndex = pipelineSteps.findIndex((s) => s.id === stepId);
    
    if (currentIndex > thisIndex) return "completed";

    return "pending";
  };

  const latestMessage = useMemo(() => {
    if (events.length === 0) return "Starting analysis pipeline...";
    return events[events.length - 1].message;
  }, [events]);

  return (
    <Card className="max-w-2xl mx-auto space-y-8 p-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {progress === 100 ? "Analysis Complete" : "Analyzing Resume..."}
        </h2>
        <p className="text-sm text-zinc-400">
          {latestMessage}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-500 font-medium">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar
          value={progress}
          color={hasError ? "amber" : progress === 100 ? "emerald" : "violet"}
          size="md"
        />
      </div>

      <div className="space-y-4 pt-4">
        {pipelineSteps.map((step) => {
          const status = getStepStatus(step.id);

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                status === "completed"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : status === "running"
                  ? "border-violet-500/30 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                  : status === "error"
                  ? "border-red-500/20 bg-red-500/5"
                  : "border-zinc-800 bg-zinc-900/40"
              )}
            >
              <div className="shrink-0">
                {status === "completed" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {status === "running" && (
                  <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
                )}
                {status === "pending" && (
                  <Circle className="h-5 w-5 text-zinc-600" />
                )}
                {status === "error" && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    status === "completed"
                      ? "text-emerald-400"
                      : status === "running"
                      ? "text-violet-300"
                      : status === "error"
                      ? "text-red-400"
                      : "text-zinc-500"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
