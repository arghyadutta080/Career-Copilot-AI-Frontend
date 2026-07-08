"use client";

import { useState } from "react";
import { Layout, Target, Zap, FileEdit, FileText, MessageSquare, Map } from "lucide-react";
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
        {activeTab === "ats" && <ATSAnalysisTab analysis={analysis} />}
        {activeTab === "skills" && <SkillGapTab analysis={analysis} />}
        {activeTab === "optimizer" && <ResumeOptimizerTab analysis={analysis} />}
        {activeTab === "cover-letter" && <CoverLetterTab analysis={analysis} />}
        {activeTab === "interview" && <InterviewTab analysis={analysis} />}
        {activeTab === "roadmap" && <RoadmapTab analysis={analysis} />}
      </div>
    </div>
  );
}
