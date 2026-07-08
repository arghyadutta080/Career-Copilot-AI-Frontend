"use client";

import { useState } from "react";
import { Layout, Target, Zap, FileEdit, FileText, MessageSquare, Map } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import { Tabs } from "@/components/ui/Tabs";
import { OverviewTab } from "./tabs/OverviewTab";
import { ATSAnalysisTab } from "./tabs/ATSAnalysisTab";
import { SkillGapTab } from "./tabs/SkillGapTab";
import { ResumeOptimizerTab } from "./tabs/ResumeOptimizerTab";
import { CoverLetterTab } from "./tabs/CoverLetterTab";
import { InterviewTab } from "./tabs/InterviewTab";
import { RoadmapTab } from "./tabs/RoadmapTab";
import type { Analysis } from "@/types";

interface AnalysisTabsProps {
  analysis: Analysis;
}

const tabItems = [
  { id: "overview", label: "Overview", icon: <Layout className="h-4 w-4" /> },
  { id: "ats", label: "ATS Analysis", icon: <Target className="h-4 w-4" /> },
  { id: "skills", label: "Skill Gap", icon: <Zap className="h-4 w-4" /> },
  { id: "optimizer", label: "Resume Optimizer", icon: <FileEdit className="h-4 w-4" /> },
  { id: "cover-letter", label: "Cover Letter", icon: <FileText className="h-4 w-4" /> },
  { id: "interview", label: "Interview Prep", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "roadmap", label: "Learning Roadmap", icon: <Map className="h-4 w-4" /> },
];

export function AnalysisTabs({ analysis }: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { isGeneratingInterview, isGeneratingRoadmap } = useAnalysisProgressStore();

  // Keep SSE connection alive across tab switches if generation is ongoing
  useSSE(analysis.id, isGeneratingInterview || isGeneratingRoadmap);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2">
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
        />
      </div>

      <div className="min-h-[400px]">
        {activeTab === "overview" && <OverviewTab analysis={analysis} onNavigate={setActiveTab} />}
        {activeTab === "ats" && <ATSAnalysisTab analysisId={analysis.id} />}
        {activeTab === "skills" && <SkillGapTab analysisId={analysis.id} />}
        {activeTab === "optimizer" && <ResumeOptimizerTab analysisId={analysis.id} />}
        {activeTab === "cover-letter" && <CoverLetterTab analysisId={analysis.id} />}
        {activeTab === "interview" && <InterviewTab analysisId={analysis.id} status={analysis.toolStatus?.interview} />}
        {activeTab === "roadmap" && <RoadmapTab analysisId={analysis.id} status={analysis.toolStatus?.roadmap} interviewStatus={analysis.toolStatus?.interview} />}
      </div>
    </div>
  );
}
