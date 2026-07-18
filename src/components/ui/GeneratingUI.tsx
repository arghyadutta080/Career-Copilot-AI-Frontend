"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";

interface GeneratingUIProps {
  type: "interview" | "roadmap";
  /** Unix ms timestamp when generation was first started. Persisted in localStorage so
   * the progress bar continues smoothly across tab switches instead of resetting. */
  startTime?: number;
}

export function GeneratingUI({ type, startTime }: GeneratingUIProps) {
  // If a persisted startTime is provided use it; otherwise start the clock from now.
  const baseTimeRef = useRef(startTime ?? Date.now());
  const [elapsed, setElapsed] = useState(() => Date.now() - baseTimeRef.current);

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
    // Keep baseTimeRef in sync if startTime prop changes after mount (e.g. after initial render)
    if (startTime !== undefined) {
      baseTimeRef.current = startTime;
    }
    const interval = setInterval(() => {
      setElapsed(Date.now() - baseTimeRef.current);
    }, 200);
    return () => clearInterval(interval);
  }, [startTime]);

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
