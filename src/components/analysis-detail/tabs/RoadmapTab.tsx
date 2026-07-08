"use client";

import { Card } from "@/components/ui/Card";
import { Map, Clock, ExternalLink, CheckCircle2 } from "lucide-react";
import type { Analysis, RoadmapMilestone, RoadmapStep } from "@/types";

interface RoadmapTabProps {
  analysis: Analysis;
}

export function RoadmapTab({ analysis }: RoadmapTabProps) {
  const roadmap = analysis.results?.roadmap;

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <p>No Learning Roadmap generated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Map className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Learning Roadmap</h3>
          <p className="text-sm text-zinc-400">Your personalized path to bridge skill gaps</p>
        </div>
      </div>

      <Card>
        <p className="text-zinc-300 leading-relaxed">{roadmap.overview}</p>
      </Card>

      <div className="space-y-6">
        {roadmap.milestones.map((milestone: RoadmapMilestone, i: number) => (
          <div key={i} className="relative">
            {/* Connecting line for timeline */}
            {i !== roadmap.milestones.length - 1 && (
              <div className="absolute left-6 top-14 bottom-[-24px] w-0.5 bg-zinc-800" />
            )}
            
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-zinc-950 bg-blue-500/20 text-blue-400 z-10 font-bold">
                M{i + 1}
              </div>
              
              <Card className="flex-1 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{milestone.title}</h4>
                  <p className="text-sm text-zinc-400 mt-1">{milestone.description}</p>
                </div>

                <div className="space-y-3">
                  {milestone.steps.map((step: RoadmapStep, j: number) => (
                    <div key={j} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h5 className="font-semibold text-zinc-200">{step.title}</h5>
                          <p className="text-sm text-zinc-400 mt-1">{step.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          {step.estimatedHours}h
                        </div>
                      </div>

                      {step.resources?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-800/60">
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Recommended Resources
                          </p>
                          <ul className="space-y-2">
                            {step.resources.map((res, k) => (
                              <li key={k} className="flex items-start gap-2 text-sm text-zinc-300">
                                <ExternalLink className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-medium text-zinc-200">{res.title}</span>
                                  <span className="text-zinc-500 ml-2 text-xs">({res.type})</span>
                                  <p className="text-xs text-zinc-400 mt-0.5">{res.reason}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {roadmap.interviewChecklist && roadmap.interviewChecklist.length > 0 && (
        <Card className="mt-12 bg-blue-500/5 border-blue-500/20">
          <h4 className="text-lg font-bold text-white mb-4">Interview Checklist</h4>
          <ul className="space-y-3">
            {roadmap.interviewChecklist.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
