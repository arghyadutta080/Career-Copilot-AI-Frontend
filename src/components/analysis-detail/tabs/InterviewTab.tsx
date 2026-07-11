"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useAnalysisInterview, useGenerateInterview } from "@/hooks/useAnalysis";
import { GeneratingUI } from "@/components/ui/GeneratingUI";
import { TabContentSkeleton } from "@/components/ui/Skeleton";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import type { InterviewQuestion, InterviewFollowUp } from "@/types";
import { useEffect, useState } from "react";

interface InterviewTabProps {
  analysisId: string;
  status?: string;
}

export function InterviewTab({ analysisId, status }: InterviewTabProps) {
  const { data: analysis, isLoading } = useAnalysisInterview(analysisId);
  const { mutate: generateInterview, isPending } = useGenerateInterview();
  const queryClient = useQueryClient();
  const { events, isGeneratingInterview, setIsGeneratingInterview } = useAnalysisProgressStore();
  
  const interview = analysis?.results?.interview;
  const [activeCategory, setActiveCategory] = useState("resume");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isGeneratingInterview) {
      const isComplete = events.some(
        (e) => e.step === "Interview Questions" && e.progress === 100
      );
      if (isComplete) {
        setIsGeneratingInterview(false);
        queryClient.invalidateQueries({ queryKey: ["analysis", analysisId, "interview"] });
        queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
      }
    }
  }, [events, isGeneratingInterview, analysisId, queryClient, setIsGeneratingInterview]);

  const handleGenerate = () => {
    setIsGeneratingInterview(true);
    generateInterview(analysisId);
  };

  // 1. If initially loading data from server, show skeleton
  if (isLoading && !interview?.resumeBased?.length) {
    return <TabContentSkeleton />;
  }

  // 2. If generating or waiting for mutation, show generating UI
  if (isGeneratingInterview || isPending) {
    return <GeneratingUI type="interview" />;
  }

  // 3. If data is not present, show the generation button
  if (!interview?.resumeBased?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 mb-2 border border-violet-500/20">
          <MessageSquare className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold text-white">Interview Preparation</h3>
        <p className="text-zinc-400 max-w-md pb-4">
          Generate role-specific interview questions based on your resume and the job description.
        </p>
        <button
          onClick={handleGenerate}
          className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/20"
        >
          Generate Questions
        </button>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <p>No Interview questions generated.</p>
      </div>
    );
  }

  const categories = [
    // { id: "hr", label: "HR", data: interview.hr },
    { id: "resume", label: "Resume Based", data: interview.resumeBased },
    { id: "experience", label: "Experience", data: interview.experienceBased },
    { id: "project", label: "Project Based", data: interview.projectBased },
    { id: "technical", label: "Technical", data: interview.technical },
    { id: "coding", label: "Coding", data: interview.coding },
    // { id: "behavioral", label: "Behavioral", data: interview.behavioral },
    { id: "followups", label: "Follow-up Questions", data: interview.followUps },
  ];

  const currentQuestions = categories.find((c) => c.id === activeCategory)?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Interview Preparation</h3>
          <p className="text-sm text-zinc-400">Practice with role-specific questions</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2">
        <Tabs
          tabs={categories.map((c) => ({
            id: c.id,
            label: c.label,
            count: c.data?.length || 0,
          }))}
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
          variant="pills"
        />
      </div>

      <div className="space-y-4">
        {activeCategory === "followups" ? (
          ((categories.find((c) => c.id === "followups")?.data || []) as InterviewFollowUp[]).length > 0 ? (
            ((categories.find((c) => c.id === "followups")?.data || []) as InterviewFollowUp[]).map((group: InterviewFollowUp, i: number) => {
              const isExpanded = expandedId === `followup-${i}`;

              return (
                <Card key={i} className="p-0 overflow-hidden border border-zinc-800 bg-zinc-950/40">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : `followup-${i}`)}
                    className="w-full flex items-start gap-4 p-5 text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 text-sm font-semibold border border-violet-500/20">
                      P{i + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-zinc-200">{group.parentQuestion}</h4>
                      <p className="text-xs text-violet-400 font-medium mt-1">
                        {group.followUps?.length || 0} Follow-up Question{(group.followUps?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500 shrink-0 mt-1" />
                    )}
                  </button>

                  {isExpanded && group.followUps && (
                    <div className="px-5 pb-5 pt-4 border-t border-zinc-800 bg-zinc-900/20 space-y-4">
                      {group.followUps.map((q: InterviewQuestion, j: number) => (
                        <div key={q.id || j} className="pl-4 border-l-2 border-violet-500/30 space-y-2 py-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-violet-400 bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/15">
                              Follow-up {j + 1}
                            </span>
                            {q.difficulty && (
                              <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                                {q.difficulty}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-zinc-300">{q.question}</p>
                          {q.topics && q.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {q.topics.map((topic, k) => (
                                <span key={k} className="inline-flex items-center rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-700/30">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                          {q.answer && (
                            <div className="mt-2 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/50">
                              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                                Suggested Answer
                              </p>
                              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                {q.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 text-zinc-500">
              No follow-up questions available.
            </div>
          )
        ) : (
          currentQuestions.length > 0 ? (
            (currentQuestions as InterviewQuestion[]).map((q: InterviewQuestion, i: number) => {
              const isExpanded = expandedId === q.id;

              return (
                <Card key={q.id || i} className="p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : (q.id || i.toString()))}
                    className="w-full flex items-start gap-4 p-5 text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-400">
                      Q{i + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-zinc-200">{q.question}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {q.difficulty && (
                          <span className="inline-flex items-center rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
                            {q.difficulty}
                          </span>
                        )}
                        {q.topics?.map((topic, j) => (
                          <span key={j} className="inline-flex items-center rounded bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500 shrink-0 mt-1" />
                    )}
                  </button>
                  
                  {isExpanded && q.answer && (
                    <div className="px-5 pb-5 pt-2 border-t border-zinc-800/60 bg-zinc-900/40">
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Suggested Answer
                      </p>
                      <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {q.answer}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 text-zinc-500">
              No questions available for this category.
            </div>
          )
        )}
      </div>
    </div>
  );
}
