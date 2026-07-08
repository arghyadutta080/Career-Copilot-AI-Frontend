"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";
import { useAnalysisProgressStore } from "@/stores/analysisStore";

interface GeneratingUIProps {
  type: "interview" | "roadmap";
}

export function GeneratingUI({ type }: GeneratingUIProps) {
  const { generationStartTimeInterview, generationStartTimeRoadmap } = useAnalysisProgressStore();
  const startTime = type === "interview" ? generationStartTimeInterview : generationStartTimeRoadmap;

  const [now, setNow] = useState(Date.now());

  const messages =
    type === "interview"
      ? [
          "Analyzing role requirements...",
          "Formulating role-specific questions...",
          "Preparing suggested answers...",
          "Finalizing interview prep...",
        ]
      : [
          "Analyzing skill gaps...",
          "Finding recommended resources...",
          "Building milestones...",
          "Finalizing learning roadmap...",
        ];

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const elapsed = startTime ? now - startTime : 0;
  
  // Progress increments by 1 every 200ms up to 95%
  const dummyProgress = Math.min(95, Math.floor(elapsed / 200));
  
  // Messages cycle every 3000ms
  const messageIndex = Math.floor(elapsed / 3000) % messages.length;

  return (
    <Card className="max-w-2xl mx-auto space-y-8 p-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {type === "interview"
            ? "Generating Interview Questions..."
            : "Generating Learning Roadmap..."}
        </h2>
        <p className="text-sm text-zinc-400 animate-pulse">
          {messages[messageIndex]}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-500 font-medium">
          <span>Overall Progress</span>
          <span>{dummyProgress}%</span>
        </div>
        <ProgressBar
          value={dummyProgress}
          color="violet"
          size="md"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    </Card>
  );
}
