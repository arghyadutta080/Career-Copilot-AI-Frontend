"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Map, Clock, ExternalLink, CheckCircle2 } from "lucide-react";
import { useAnalysisRoadmap, useGenerateRoadmap } from "@/hooks/useAnalysis";
import { GeneratingUI } from "@/components/ui/GeneratingUI";
import { TabContentSkeleton } from "@/components/ui/Skeleton";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import type { LearningRoadmap, RoadmapMilestone, RoadmapStep, LearningResource } from "@/types";
import { memo, useCallback, useEffect, useState } from "react";

// ─── localStorage key helpers ─────────────────────────────────────────────────
const roadmapGeneratingKey = (analysisId: string) => `roadmap-generating-${analysisId}`;
const roadmapStartKey = (analysisId: string) => `roadmap-start-${analysisId}`;

type RoadmapGeneratingState = "idle" | "generating" | "enriching";

const readRoadmapGenerating = (analysisId: string): RoadmapGeneratingState => {
  try {
    const val = localStorage.getItem(roadmapGeneratingKey(analysisId));
    if (val === "true") return "generating";
    if (val === "enriching") return "enriching";
    return "idle";
  } catch {
    return "idle";
  }
};

const readRoadmapStartTime = (analysisId: string): number | null => {
  try {
    const val = localStorage.getItem(roadmapStartKey(analysisId));
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
};

/** Notify AnalysisTabs (and any other listeners) that the generating state changed */
const dispatchGeneratingChanged = (analysisId: string) =>
  window.dispatchEvent(new CustomEvent("analysis-generating-changed", { detail: { analysisId } }));

const writeRoadmapGenerating = (analysisId: string, state: RoadmapGeneratingState) => {
  try {
    if (state === "idle") {
      localStorage.removeItem(roadmapGeneratingKey(analysisId));
      localStorage.removeItem(roadmapStartKey(analysisId));
    } else {
      localStorage.setItem(roadmapGeneratingKey(analysisId), state === "generating" ? "true" : "enriching");
      // Only write a fresh start-time when first starting (not when transitioning to enriching)
      if (state === "generating" && !localStorage.getItem(roadmapStartKey(analysisId))) {
        localStorage.setItem(roadmapStartKey(analysisId), Date.now().toString());
      }
    }
  } catch {
    // ignore
  }
  dispatchGeneratingChanged(analysisId);
};

// ─── Inline YouTube icon ───────────────────────────────────────────────────────
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="1em"
    height="1em"
    className={props.className}
    {...props}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.048 0 12 0 12s0 3.952.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.952 24 12 24 12s0-3.952-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// ─── ResourceUrls ──────────────────────────────────────────────────────────────
// Isolated, memoized component that subscribes to only its own resource's entry
// in the global urlMap. When enrichment completes, ONLY these tiny leaf nodes
// re-render — the milestone cards, step cards, and resource titles stay frozen.
const ResourceUrls = memo(function ResourceUrls({ resourceId }: { resourceId?: string }) {
  const urls = useAnalysisProgressStore(
    // Zustand compares the return value with ===; an array ref only changes when
    // setResourceUrlMap is called, so this selector is stable between renders.
    useCallback(
      (state) => (resourceId ? state.resourceUrlMap[resourceId] : undefined),
      [resourceId],
    ),
  );

  if (urls && urls.length > 0) {
    return (
      <div className="pl-6 flex flex-wrap gap-2">
        {urls.map((url, idx) => (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors"
          >
            <YoutubeIcon className="h-3.5 w-3.5 shrink-0" />
            Watch Video {urls.length > 1 ? idx + 1 : ""}
          </a>
        ))}
      </div>
    );
  }

  // Skeleton buttons — same height/width as Watch Video pills to prevent layout shift.
  return (
    <div className="pl-6 flex flex-wrap gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[26px] w-[88px] rounded-lg bg-zinc-800/70 animate-pulse" />
      ))}
    </div>
  );
});

// ─── RoadmapDisplay ────────────────────────────────────────────────────────────
// Memoized purely on the `roadmap` prop. The prop is set once from the Phase 1
// SSE event and never mutated again, so this entire sub-tree never re-renders
// after that — URL updates flow through ResourceUrls ↔ Zustand only.
const RoadmapDisplay = memo(function RoadmapDisplay({ roadmap }: { roadmap: LearningRoadmap }) {
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
                          <ul className="space-y-3">
                            {step.resources.map((res: LearningResource, k: number) => (
                              <li key={k} className="flex flex-col gap-1.5 text-sm text-zinc-300">
                                <div className="flex items-start gap-2">
                                  <ExternalLink className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-zinc-200">{res.title}</span>
                                    <p className="text-xs text-zinc-400 mt-0.5">{res.reason}</p>
                                  </div>
                                </div>
                                {/* ResourceUrls subscribes to Zustand independently — zero cascade */}
                                <ResourceUrls resourceId={res.id} />
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
});

// ─── RoadmapTab ────────────────────────────────────────────────────────────────
interface RoadmapTabProps {
  analysisId: string;
  status?: string;
  interviewStatus?: string;
}

export function RoadmapTab({ analysisId, status, interviewStatus }: RoadmapTabProps) {
  const { data: analysis, isLoading } = useAnalysisRoadmap(analysisId);
  const { mutate: generateRoadmap, isPending } = useGenerateRoadmap();
  const queryClient = useQueryClient();
  const { events, setResourceUrlMap } = useAnalysisProgressStore();

  const [localRoadmap, setLocalRoadmap] = useState<LearningRoadmap | null>(null);

  // Per-analysis generation state & start time — sourced from localStorage, not global store
  const [roadmapGeneratingState, setRoadmapGeneratingState] = useState<RoadmapGeneratingState>(() =>
    readRoadmapGenerating(analysisId)
  );
  const [startTime, setStartTime] = useState<number | null>(() =>
    readRoadmapStartTime(analysisId)
  );

  const isGeneratingRoadmap = roadmapGeneratingState === "generating";
  const isEnrichingRoadmap = roadmapGeneratingState === "enriching";

  // ── Query → local sync ───────────────────────────────────────────────────────
  // Only runs when we have no SSE-managed state in flight. On a page revisit
  // (data already enriched in the DB), also populates resourceUrlMap from the
  // stored urls so ResourceUrls can render the real links immediately.
  useEffect(() => {
    if (isEnrichingRoadmap || isGeneratingRoadmap) return;
    if (!analysis?.results?.roadmap) return;
    // If we already have a localRoadmap set from the SSE event, do not overwrite —
    // the query refetch after enrichment would otherwise cause RoadmapDisplay to
    // receive a new prop reference and re-render the entire structure.
    if (localRoadmap) return;

    const roadmapData = analysis.results.roadmap as LearningRoadmap;
    setLocalRoadmap(roadmapData);

    // Hydrate resourceUrlMap from DB data (page revisit / refresh case).
    const existingUrlMap: Record<string, string[]> = {};
    for (const milestone of roadmapData.milestones ?? []) {
      for (const step of milestone.steps ?? []) {
        for (const resource of step.resources ?? []) {
          if (resource.id && resource.urls && resource.urls.length > 0) {
            existingUrlMap[resource.id] = resource.urls;
          }
        }
      }
    }
    if (Object.keys(existingUrlMap).length > 0) {
      setResourceUrlMap(existingUrlMap);
    }
  // localRoadmap intentionally omitted — we only want this to run when the query
  // data or generation flags change, not when localRoadmap itself changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, isEnrichingRoadmap, isGeneratingRoadmap]);

  const roadmap = localRoadmap ?? (analysis?.results?.roadmap as LearningRoadmap | undefined);
  const isInterviewNotCompleted = interviewStatus !== "completed";

  // ── SSE event handler ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGeneratingRoadmap && !isEnrichingRoadmap) return;

    // Phase 1: LLM roadmap ready — show structure with skeleton url buttons.
    if (isGeneratingRoadmap) {
      const initialEvent = events.find(
        (e) => e.step === "Learning Roadmap" && e.progress === 100,
      );
      if (initialEvent?.data) {
        setLocalRoadmap(initialEvent.data as LearningRoadmap);
        // Transition to enriching phase
        setRoadmapGeneratingState("enriching");
        writeRoadmapGenerating(analysisId, "enriching");
      }
      return;
    }

    // Phase 2: YouTube enrichment done — push id→urls into the Zustand store.
    if (isEnrichingRoadmap) {
      const enrichedEvent = events.find(
        (e) =>
          e.step === "Learning Roadmap" &&
          (e.message === "YouTube resources loaded." || e.type === "roadmap_resources_updated"),
      );
      if (enrichedEvent?.data) {
        setResourceUrlMap(enrichedEvent.data as Record<string, string[]>);
        setRoadmapGeneratingState("idle");
        setStartTime(null);
        writeRoadmapGenerating(analysisId, "idle");
        queryClient.invalidateQueries({ queryKey: ["analysis", analysisId, "roadmap"] });
        queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, isGeneratingRoadmap, isEnrichingRoadmap]);

  const handleGenerate = () => {
    setLocalRoadmap(null);
    setRoadmapGeneratingState("generating");
    writeRoadmapGenerating(analysisId, "generating");
    setStartTime(readRoadmapStartTime(analysisId));
    generateRoadmap(analysisId);
  };

  // 1. Initially loading data from server
  if (isLoading && !roadmap?.overview) {
    return <TabContentSkeleton />;
  }

  // 2. Generating or waiting for mutation
  if (isGeneratingRoadmap || isPending) {
    return <GeneratingUI type="roadmap" startTime={startTime ?? undefined} />;
  }

  // 3. No data yet — show generation CTA
  if (!roadmap?.overview) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-2 border border-blue-500/20">
          <Map className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold text-white">Learning Roadmap</h3>
        <p className="text-zinc-400 max-w-md pb-4">
          Generate a personalized learning path to bridge your skill gaps for this specific role.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isInterviewNotCompleted}
          className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 ${
            isInterviewNotCompleted
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          Generate Roadmap
        </button>
        {isInterviewNotCompleted && (
          <p className="text-sm text-amber-500/90 mt-4 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
            ⚠️ You must generate Interview Questions before you can generate a Learning Roadmap.
          </p>
        )}
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <p>No Learning Roadmap generated.</p>
      </div>
    );
  }

  // RoadmapDisplay is memoized — once roadmap is set it never re-renders.
  // URL transitions are fully contained inside ResourceUrls ↔ Zustand.
  return <RoadmapDisplay roadmap={roadmap} />;
}
