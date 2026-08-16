import { create } from "zustand";
import { EVENT_TYPES, EVENT_MESSAGES } from "@/constants/events";
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
          event.type === EVENT_TYPES.ANSWER_STARTED ||
          event.type === EVENT_TYPES.ANSWER_DELTA ||
          event.type === EVENT_TYPES.ANSWER_COMPLETED ||
          event.type === EVENT_TYPES.ANSWER_ERROR
        ) {
          const isDone = event.type === EVENT_TYPES.ANSWER_COMPLETED || event.type === EVENT_TYPES.ANSWER_ERROR;
          return {
            events: [...state.events, event],
            hasError: event.type === EVENT_TYPES.ANSWER_ERROR,
            ...(isDone ? { isGeneratingAnswer: false } : {}),
          };
        }

        const isRoadmapResourcesLoaded =
          event.message === EVENT_MESSAGES.YOUTUBE_RESOURCES_LOADED || event.type === EVENT_TYPES.ROADMAP_RESOURCES_UPDATED;

        return {
          events: [...state.events, event],
          currentStep: event.step || "",
          progress: event.progress ?? 0,
          isComplete: (event.progress !== undefined && event.progress >= 100) || isRoadmapResourcesLoaded,
          hasError: event.type === EVENT_TYPES.ERROR,
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
