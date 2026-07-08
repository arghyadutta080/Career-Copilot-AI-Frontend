"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, Briefcase, PlayCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ResumeUploadStep } from "@/components/new-analysis/ResumeUploadStep";
import { JobDescriptionStep } from "@/components/new-analysis/JobDescriptionStep";
import { ReviewStep } from "@/components/new-analysis/ReviewStep";
import type { Resume, JobDescription } from "@/types";

type Step = "resume" | "job" | "review";

const steps = [
  { id: "resume", label: "Upload Resume", icon: FileText },
  { id: "job", label: "Job Description", icon: Briefcase },
  { id: "review", label: "Review & Start", icon: PlayCircle },
] as const;

export default function NewAnalysisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("resume");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);

  const handleNext = () => {
    if (currentStep === "resume" && selectedResume) {
      setCurrentStep("job");
    } else if (currentStep === "job" && selectedJob) {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "job") {
      setCurrentStep("resume");
    } else if (currentStep === "review") {
      setCurrentStep("job");
    }
  };

  const handleComplete = (analysisId: string) => {
    router.push(`/analyses/${analysisId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Analysis</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Compare your resume against a target job description.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-800 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-violet-600 rounded-full transition-all duration-500 ease-out"
          style={{
            width:
              currentStep === "resume"
                ? "0%"
                : currentStep === "job"
                ? "50%"
                : "100%",
          }}
        />
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted =
              (currentStep === "job" && index === 0) ||
              (currentStep === "review" && index <= 1);
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-3 w-32",
                  isCompleted || isCurrent ? "text-violet-400" : "text-zinc-500"
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300 bg-zinc-950",
                    isCompleted
                      ? "border-violet-500 bg-violet-500/10"
                      : isCurrent
                      ? "border-violet-500 bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)] text-white"
                      : "border-zinc-800 text-zinc-500"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300 text-center",
                    isCurrent ? "text-white" : isCompleted ? "text-zinc-300" : "text-zinc-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8">
        {currentStep === "resume" && (
          <ResumeUploadStep
            selectedResume={selectedResume}
            onSelectResume={setSelectedResume}
            onNext={handleNext}
          />
        )}
        
        {currentStep === "job" && (
          <JobDescriptionStep
            selectedJob={selectedJob}
            onSelectJob={setSelectedJob}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {currentStep === "review" && selectedResume && selectedJob && (
          <ReviewStep
            resume={selectedResume}
            jobDescription={selectedJob}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
