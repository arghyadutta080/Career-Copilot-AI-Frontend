"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSSE } from "@/lib/sse";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import type { SSEProgressEvent } from "@/types";

/**
 * Hook to manage SSE connection for a running analysis.
 * Automatically connects when analysisId is provided and disconnects on cleanup.
 */
export function useSSE(analysisId: string | undefined, enabled = true, resetOnConnect = false) {
  const queryClient = useQueryClient();
  const cleanupRef = useRef<(() => void) | null>(null);
  const { addEvent, reset } = useAnalysisProgressStore();

  const disconnect = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!analysisId || !enabled) {
      disconnect();
      return;
    }

    if (resetOnConnect) {
      reset();
    }

    const cleanup = connectSSE(
      analysisId,
      (event: SSEProgressEvent) => {
        addEvent(event);

        const isAnswerEvent =
          event.type === "answer_started" ||
          event.type === "answer_delta" ||
          event.type === "answer_completed" ||
          event.type === "answer_error";

        if (!isAnswerEvent) {
          // Only pipeline events (progress/complete/error) can change toolStatus —
          // no need to refetch GetAnalysisStatus on every answer token.
          queryClient.invalidateQueries({ queryKey: ["analysis-status", analysisId] });
        }

        // Auto-disconnect and fetch full data when pipeline is complete
        const isRoadmapEvent = event.step === "Learning Roadmap";
        const isYouTubeLoaded = event.message === "YouTube resources loaded." || event.type === "roadmap_resources_updated";

        if (isRoadmapEvent) {
          if (isYouTubeLoaded) {
            queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
            disconnect();
          }
        } else if (!isAnswerEvent && event.progress !== undefined && event.progress >= 100) {
          queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
          disconnect();
        }
      },
      (_error) => {
        console.warn("[useSSE] Connection error, will retry...");
      }
    );

    cleanupRef.current = cleanup;

    return () => {
      disconnect();
    };
  }, [analysisId, enabled, resetOnConnect, addEvent, reset, disconnect, queryClient]);

  return { disconnect };
}
