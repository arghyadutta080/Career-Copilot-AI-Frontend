import { create } from "zustand";
import type { SSEProgressEvent } from "@/types";

interface AnalysisProgressState {
  /** All received SSE events for the active analysis */
  events: SSEProgressEvent[];

  /** Currently executing step label */
  currentStep: string;

  /** Overall progress percentage (0–100) */
  progress: number;

  /** Whether the pipeline has finished */
  isComplete: boolean;

  /** Whether an error occurred */
  hasError: boolean;

  /** Append a new SSE event */
  addEvent: (event: SSEProgressEvent) => void;

  /** Reset for a new analysis run */
  reset: () => void;

  /** Whether an on-demand answer is currently being streamed */
  isGeneratingAnswer: boolean;
  setIsGeneratingAnswer: (value: boolean) => void;

  /**
   * Flat map of resource id → YouTube URLs populated after enrichment.
   * Stored separately from the roadmap so ResourceUrls components can
   * subscribe to only their own slice without re-rendering the whole tree.
   */
  resourceUrlMap: Record<string, string[]>;
  setResourceUrlMap: (map: Record<string, string[]>) => void;
}

export const useAnalysisProgressStore = create<AnalysisProgressState>(
  (set) => ({
    events: [],
    currentStep: "",
    progress: 0,
    isComplete: false,
    hasError: false,

    addEvent: (event) =>
      set((state) => {
        if (
          event.type === "answer_started" ||
          event.type === "answer_delta" ||
          event.type === "answer_completed" ||
          event.type === "answer_error"
        ) {
          const isDone = event.type === "answer_completed" || event.type === "answer_error";
          return {
            events: [...state.events, event],
            hasError: event.type === "answer_error",
            ...(isDone ? { isGeneratingAnswer: false } : {}),
          };
        }

        const isRoadmapResourcesLoaded =
          event.message === "YouTube resources loaded." || event.type === "roadmap_resources_updated";

        return {
          events: [...state.events, event],
          currentStep: event.step || "",
          progress: event.progress ?? 0,
          isComplete: (event.progress !== undefined && event.progress >= 100) || isRoadmapResourcesLoaded,
          hasError: event.type === "error",
        };
      }),

    reset: () =>
      set({
        events: [],
        currentStep: "",
        progress: 0,
        isComplete: false,
        hasError: false,
        isGeneratingAnswer: false,
        resourceUrlMap: {},
      }),

    isGeneratingAnswer: false,
    setIsGeneratingAnswer: (value) => set({ isGeneratingAnswer: value }),

    resourceUrlMap: {},
    setResourceUrlMap: (map) => set({ resourceUrlMap: map }),
  })
);
