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

  /** Track manual generation for individual tabs */
  isGeneratingInterview: boolean;
  setIsGeneratingInterview: (isGenerating: boolean) => void;
  generationStartTimeInterview: number | null;
  
  isGeneratingRoadmap: boolean;
  setIsGeneratingRoadmap: (isGenerating: boolean) => void;
  generationStartTimeRoadmap: number | null;

  isEnrichingRoadmap: boolean;
  setIsEnrichingRoadmap: (isEnriching: boolean) => void;

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

        const newState: Partial<AnalysisProgressState> = {
          events: [...state.events, event],
          currentStep: event.step || "",
          progress: event.progress ?? 0,
          isComplete: (event.progress !== undefined && event.progress >= 100) || isRoadmapResourcesLoaded,
          hasError: event.type === "error",
        };

        if (event.type === "error") {
          newState.isGeneratingInterview = false;
          newState.isGeneratingRoadmap = false;
          newState.isEnrichingRoadmap = false;
        }

        return newState;
      }),

    reset: () =>
      set({
        events: [],
        currentStep: "",
        progress: 0,
        isComplete: false,
        hasError: false,
        isEnrichingRoadmap: false,
        isGeneratingAnswer: false,
        resourceUrlMap: {},
      }),

    isGeneratingInterview: false,
    generationStartTimeInterview: null,
    setIsGeneratingInterview: (isGenerating) => 
      set({ 
        isGeneratingInterview: isGenerating,
        generationStartTimeInterview: isGenerating ? Date.now() : null
      }),

    isGeneratingRoadmap: false,
    generationStartTimeRoadmap: null,
    setIsGeneratingRoadmap: (isGenerating) => 
      set({ 
        isGeneratingRoadmap: isGenerating,
        generationStartTimeRoadmap: isGenerating ? Date.now() : null
      }),

    isEnrichingRoadmap: false,
    setIsEnrichingRoadmap: (isEnriching) =>
      set({ isEnrichingRoadmap: isEnriching }),

    isGeneratingAnswer: false,
    setIsGeneratingAnswer: (value) => set({ isGeneratingAnswer: value }),

    resourceUrlMap: {},
    setResourceUrlMap: (map) => set({ resourceUrlMap: map }),
  })
);
