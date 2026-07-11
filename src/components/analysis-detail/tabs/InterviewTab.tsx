"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useAnalysisInterview, useGenerateInterview, useGenerateInterviewAnswer } from "@/hooks/useAnalysis";
import { GeneratingUI } from "@/components/ui/GeneratingUI";
import { TabContentSkeleton } from "@/components/ui/Skeleton";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import type { InterviewQuestion, InterviewFollowUp, InterviewAnswer } from "@/types";
import { useEffect, useState } from "react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface InterviewTabProps {
  analysisId: string;
  status?: string;
}

interface AnswerSectionProps {
  q: InterviewQuestion;
  analysisId: string;
}

function AnswerSection({ q, analysisId }: AnswerSectionProps) {
  const queryClient = useQueryClient();
  const { mutate: generateAnswer, isPending } = useGenerateInterviewAnswer();
  const { events, setIsGeneratingAnswer } = useAnalysisProgressStore();

  const getAnswerObj = (question: InterviewQuestion): InterviewAnswer => {
    const ans = question.answer;
    if (!ans) {
      return { content: null, status: "not_started", generatedAt: null };
    }
    if (typeof ans === "string") {
      return { content: ans, status: "completed", generatedAt: null };
    }
    return {
      content: ans.content ?? null,
      status: ans.status ?? "not_started",
      generatedAt: ans.generatedAt ?? null
    };
  };

  const answerObj = getAnswerObj(q);

  const categoryEvents = events.filter((e) => e.questionId === q.id);
  const hasStartEvent = categoryEvents.some((e) => e.type === "answer_started");
  const hasCompleteEvent = categoryEvents.some((e) => e.type === "answer_completed");
  const hasErrorEvent = categoryEvents.some((e) => e.type === "answer_error");

  const isGeneratingLocally = hasStartEvent && !hasCompleteEvent && !hasErrorEvent;
  const isGenerating = answerObj.status === "generating" || isGeneratingLocally;
  const isCompleted = answerObj.status === "completed" || (hasCompleteEvent && !isGeneratingLocally);
  const isFailed = answerObj.status === "failed" || (hasErrorEvent && !isGeneratingLocally);

  const streamedText = categoryEvents
    .filter((e) => e.type === "answer_delta")
    .map((e) => e.delta)
    .join("");

  const handleGenerateAnswer = () => {
    // Activate SSE connection BEFORE firing mutation so we don't miss any events
    setIsGeneratingAnswer(true);
    generateAnswer(
      { analysisId, questionId: q.id },
      {
        onError: () => {
          // If the mutation itself fails (network/GQL error), clear the flag
          setIsGeneratingAnswer(false);
        },
      }
    );
  };

  if (isCompleted) {
    const contentToShow = answerObj.content || streamedText;
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Suggested Answer
          </p>
          <button
            onClick={handleGenerateAnswer}
            className="hidden text-xs text-violet-400 hover:text-violet-300 font-semibold"
          >
            Regenerate Answer
          </button>
        </div>
        <div className="mt-2">
          <MarkdownRenderer className="text-sm">
            {contentToShow || ""}
          </MarkdownRenderer>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold">
          <div className="animate-spin h-3.5 w-3.5 border-2 border-violet-500 border-t-transparent rounded-full" />
          <span>Generating answer...</span>
        </div>
        <div className="mt-2">
          <MarkdownRenderer className="text-sm">
            {streamedText || "*AI is typing...*"}
          </MarkdownRenderer>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
          <span>Failed to generate answer. Please try again.</span>
        </div>
        <button
          onClick={handleGenerateAnswer}
          disabled={isPending}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-4 py-2 rounded-lg border border-red-500/20 transition-all cursor-pointer"
        >
          Retry Generation
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 text-center space-y-3 bg-zinc-900/20 rounded-lg border border-zinc-800/40 p-4">
      <p className="text-sm text-zinc-400 font-semibold">No answer generated for this question yet.</p>
      <button
        onClick={handleGenerateAnswer}
        disabled={isPending}
        className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-violet-500/10 inline-flex items-center gap-2 cursor-pointer"
      >
        {isPending ? "Starting..." : "Generate Answer"}
      </button>
    </div>
  );
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

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[events.length - 1];
      if (
        latest &&
        (latest.type === "answer_started" ||
          latest.type === "answer_completed" ||
          latest.type === "answer_error")
      ) {
        queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
        queryClient.invalidateQueries({ queryKey: ["analysis", analysisId, "interview"] });
      }
    }
  }, [events, analysisId, queryClient]);

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
                          <div className="mt-3">
                            <AnswerSection q={q} analysisId={analysisId} />
                          </div>
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
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-zinc-800/60 bg-zinc-900/40">
                      <AnswerSection q={q} analysisId={analysisId} />
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
