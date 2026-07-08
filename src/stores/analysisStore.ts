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
}

export const useAnalysisProgressStore = create<AnalysisProgressState>(
  (set) => ({
    events: [],
    currentStep: "",
    progress: 0,
    isComplete: false,
    hasError: false,

    addEvent: (event) =>
      set((state) => ({
        events: [...state.events, event],
        currentStep: event.step,
        progress: event.progress,
        isComplete: event.progress >= 100,
        hasError: event.type === "error",
      })),

    reset: () =>
      set({
        events: [],
        currentStep: "",
        progress: 0,
        isComplete: false,
        hasError: false,
      }),
  })
);
