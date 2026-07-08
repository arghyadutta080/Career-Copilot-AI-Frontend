"use client";

import { useState, useMemo } from "react";

import { CheckCircle2, Circle, Loader2, AlertCircle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
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
  { id: "ats", name: "ATS", label: "ATS Analysis" },
  { id: "skillGap", name: "Skill Gap", label: "Skill Gap Analysis" },
  { id: "optimizer", name: "Resume Optimizer", label: "Resume Optimization" },
  { id: "coverLetter", name: "Cover Letter", label: "Cover Letter Generation" },
] as const;

export function AnalysisProgress({ analysisId, initialStatus }: AnalysisProgressProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
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

  const renderStepData = (eventMessage: string | undefined, eventData: any) => {
    if (!eventData || !eventMessage) return null;

    switch (eventMessage) {
      case "ATS Score Calculation completed":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-300">ATS Score:</span>
              <span
                className={cn(
                  "text-sm font-bold px-2 py-0.5 rounded-full",
                  eventData.score >= 80
                    ? "bg-emerald-500/10 text-emerald-400"
                    : eventData.score >= 50
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
                )}
              >
                {eventData.score}/100
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {eventData.summary}
            </p>
          </div>
        );
      case "Skill Gap analysis completed":
        return (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400 leading-relaxed">
              {eventData.summary}
            </p>
          </div>
        );
      case "Resume optimization completed.":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">
                  Current Score
                </span>
                <span className="text-lg font-bold text-zinc-300">
                  {eventData.atsImpact?.currentScore || 0}
                </span>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-600" />
              <div className="flex flex-col gap-1 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] text-emerald-500/70 uppercase font-semibold tracking-wider">
                  Expected Score
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  {eventData.atsImpact?.expectedScore || 0}
                </span>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {eventData.atsImpact?.reason}
            </p>
          </div>
        );
      case "Cover letter generated.":
        return (
          <div className="space-y-3">
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
              <p className="text-sm font-medium text-zinc-200">
                <span className="text-zinc-500 mr-2">Subject:</span>
                {eventData.subject}
              </p>
            </div>
            <div className="relative">
              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 whitespace-pre-line">
                {eventData.content}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-zinc-950/50 to-transparent pointer-events-none" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
                "rounded-xl border transition-colors overflow-hidden",
                status === "completed"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : status === "running"
                  ? "border-violet-500/30 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                  : status === "error"
                  ? "border-red-500/20 bg-red-500/5"
                  : "border-zinc-800 bg-zinc-900/40"
              )}
            >
              <button
                disabled={status !== "completed"}
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="w-full flex items-center gap-4 p-4 text-left focus:outline-none"
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
                {status === "completed" && (
                  <div className="shrink-0">
                    {expandedStep === step.id ? (
                      <ChevronUp className="h-5 w-5 text-emerald-500/50" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-emerald-500/50" />
                    )}
                  </div>
                )}
              </button>
              
              {/* Expandable Data View */}
              {expandedStep === step.id && status === "completed" && (
                <div className="px-4 pb-4 border-t border-emerald-500/10 pt-4">
                  <div className="bg-zinc-950/50 rounded-xl p-5 border border-zinc-800/50">
                    {(() => {
                      const eventWithData = events.find(
                        (e) => e.step === step.name && e.data
                      );
                      return renderStepData(
                        eventWithData?.message,
                        eventWithData?.data
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
