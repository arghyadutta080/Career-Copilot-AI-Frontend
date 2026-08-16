"use client";

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSSE } from "@/lib/sse";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import { EVENT_TYPES, EVENT_STEPS, EVENT_MESSAGES } from "@/constants/events";
import type { SSEProgressEvent } from "@/types";

interface SSEConnection {
  disconnectSSE: () => void;
  listeners: Set<(event: SSEProgressEvent) => void>;
}

// Global active connections map to maintain EventSource connections across hook unmounts
const activeConnections = new Map<string, SSEConnection>();

/**
 * Hook to manage SSE connection for a running analysis.
 * Multiplexes connection in background and writes all events to localStorage.
 *
 * Per-analysis generation state is persisted in localStorage:
 *   - `analysis-progress-events-${analysisId}` — main pipeline step events
 *   - `interview-generating-${analysisId}`     — "true" while interview SSE runs
 *   - `roadmap-generating-${analysisId}`       — "true" | "enriching" while roadmap SSE runs
 *
 * These keys are cleared here when the relevant completion event arrives.
 */
export function useSSE(analysisId: string | undefined, enabled = true, resetOnConnect = false) {
  const queryClient = useQueryClient();
  const { addEvent, reset } = useAnalysisProgressStore();

  useEffect(() => {
    if (!analysisId || !enabled) {
      return;
    }

    if (resetOnConnect) {
      reset();
    }

    let conn = activeConnections.get(analysisId);

    if (!conn) {
      const disconnectSSE = connectSSE(
        analysisId,
        (event: SSEProgressEvent) => {
          const isAnswerEvent =
            event.type === EVENT_TYPES.ANSWER_STARTED ||
            event.type === EVENT_TYPES.ANSWER_DELTA ||
            event.type === EVENT_TYPES.ANSWER_COMPLETED ||
            event.type === EVENT_TYPES.ANSWER_ERROR;

          const isMainPipelineEvent =
            !isAnswerEvent &&
            event.step !== EVENT_STEPS.INTERVIEW_QUESTIONS &&
            event.step !== EVENT_STEPS.LEARNING_ROADMAP;

          // 1. Persist main pipeline progress events to localStorage for AnalysisProgress resilience
          if (isMainPipelineEvent) {
            try {
              const key = `analysis-progress-events-${analysisId}`;
              const currentStored = localStorage.getItem(key);
              const eventsList = currentStored ? JSON.parse(currentStored) : [];
              eventsList.push(event);
              localStorage.setItem(key, JSON.stringify(eventsList));
            } catch (err) {
              console.warn("[useSSE] Failed to save pipeline event to localStorage:", err);
            }
          }

          // 2. Clear per-analysis interview/roadmap generation keys on completion
          if (!isAnswerEvent) {
            const isInterviewComplete =
              event.step === EVENT_STEPS.INTERVIEW_QUESTIONS && event.progress === 100;

            const isRoadmapYouTubeDone =
              event.step === EVENT_STEPS.LEARNING_ROADMAP &&
              (event.message === EVENT_MESSAGES.YOUTUBE_RESOURCES_LOADED || event.type === EVENT_TYPES.ROADMAP_RESOURCES_UPDATED);

            const isRoadmapPhase1Done =
              event.step === EVENT_STEPS.LEARNING_ROADMAP && event.progress === 100;

            if (isInterviewComplete) {
              try {
                localStorage.removeItem(`interview-generating-${analysisId}`);
                localStorage.removeItem(`interview-start-${analysisId}`);
                window.dispatchEvent(new CustomEvent("analysis-generating-changed", { detail: { analysisId } }));
              } catch (err) {
                console.warn("[useSSE] Failed to clear interview-generating key:", err);
              }
            }

            if (isRoadmapPhase1Done && !isRoadmapYouTubeDone) {
              // Transition roadmap key from "true" → "enriching"
              try {
                localStorage.setItem(`roadmap-generating-${analysisId}`, "enriching");
                window.dispatchEvent(new CustomEvent("analysis-generating-changed", { detail: { analysisId } }));
              } catch (err) {
                console.warn("[useSSE] Failed to update roadmap-generating key:", err);
              }
            }

            if (isRoadmapYouTubeDone) {
              try {
                localStorage.removeItem(`roadmap-generating-${analysisId}`);
                localStorage.removeItem(`roadmap-start-${analysisId}`);
                window.dispatchEvent(new CustomEvent("analysis-generating-changed", { detail: { analysisId } }));
              } catch (err) {
                console.warn("[useSSE] Failed to clear roadmap-generating key:", err);
              }
            }
          }

          // 3. Dispatch event to all active hook listeners
          const activeConn = activeConnections.get(analysisId);
          activeConn?.listeners.forEach((listener) => listener(event));

          // 4. Invalidate query cache for status updates (skip noisy answer delta events)
          if (!isAnswerEvent) {
            queryClient.invalidateQueries({ queryKey: ["analysis-status", analysisId] });
          }

          // 5. Auto-disconnect and refetch full data when pipeline is complete
          const isRoadmapEvent = event.step === EVENT_STEPS.LEARNING_ROADMAP;
          const isYouTubeLoaded =
            event.message === EVENT_MESSAGES.YOUTUBE_RESOURCES_LOADED || event.type === EVENT_TYPES.ROADMAP_RESOURCES_UPDATED;
          const isPipelineComplete =
            !isAnswerEvent && event.progress !== undefined && event.progress >= 100 && !isRoadmapEvent;

          if ((isRoadmapEvent && isYouTubeLoaded) || isPipelineComplete) {
            queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });

            const activeConn = activeConnections.get(analysisId);
            if (activeConn) {
              activeConn.disconnectSSE();
              activeConnections.delete(analysisId);
            }
          }
        },
        (_error) => {
          console.warn("[useSSE] Connection error, will retry...");
        }
      );

      conn = {
        disconnectSSE,
        listeners: new Set(),
      };
      activeConnections.set(analysisId, conn);
    }

    // Define listener function for this hook instance
    const onEvent = (event: SSEProgressEvent) => {
      addEvent(event);
    };

    conn.listeners.add(onEvent);

    return () => {
      // Unregister listener when hook unmounts, but keep background EventSource connection alive
      const activeConn = activeConnections.get(analysisId);
      if (activeConn) {
        activeConn.listeners.delete(onEvent);
      }
    };
  }, [analysisId, enabled, resetOnConnect, addEvent, reset, queryClient]);

  // Expose a disconnect function to forcefully close connection if needed
  const forceDisconnect = useCallback(() => {
    if (analysisId) {
      const activeConn = activeConnections.get(analysisId);
      if (activeConn) {
        activeConn.disconnectSSE();
        activeConnections.delete(analysisId);
      }
    }
  }, [analysisId]);

  return { disconnect: forceDisconnect };
}
