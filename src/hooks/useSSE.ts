"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSSE } from "@/lib/sse";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import type { SSEProgressEvent } from "@/types";

interface SSEConnection {
  disconnectSSE: () => void;
  listeners: Set<(event: SSEProgressEvent) => void>;
}

// Global active connections map to maintain EventSource connections across hook unmounts
const activeConnections = new Map<string, SSEConnection>();

/**
 * Hook to manage SSE connection for a running analysis.
 * multiplexes connection in background and writes all events to localStorage.
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
            event.type === "answer_started" ||
            event.type === "answer_delta" ||
            event.type === "answer_completed" ||
            event.type === "answer_error";

          const isMainPipelineEvent =
            !isAnswerEvent &&
            event.step !== "Interview Questions" &&
            event.step !== "Learning Roadmap";

          // 1. Keep saving every new event data to localStorage ONLY for main pipeline progress events
          if (isMainPipelineEvent) {
            try {
              const key = `analysis-progress-events-${analysisId}`;
              const currentStored = localStorage.getItem(key);
              const eventsList = currentStored ? JSON.parse(currentStored) : [];
              eventsList.push(event);
              localStorage.setItem(key, JSON.stringify(eventsList));
            } catch (err) {
              console.warn("[useSSE] Failed to save event to localStorage:", err);
            }
          }

          // 2. Dispatch event to all active hook listeners
          const activeConn = activeConnections.get(analysisId);
          activeConn?.listeners.forEach((listener) => listener(event));

          // 3. Process complete/error triggers

          if (!isAnswerEvent) {
          // Only pipeline events (progress/complete/error) can change toolStatus —
          // no need to refetch GetAnalysisStatus on every answer token.
            queryClient.invalidateQueries({ queryKey: ["analysis-status", analysisId] });
          }

        // Auto-disconnect and fetch full data when pipeline is complete
          const isRoadmapEvent = event.step === "Learning Roadmap";
          const isYouTubeLoaded = event.message === "YouTube resources loaded." || event.type === "roadmap_resources_updated";
          const isPipelineComplete = !isAnswerEvent && event.progress !== undefined && event.progress >= 100 && !isRoadmapEvent;

          if ((isRoadmapEvent && isYouTubeLoaded) || isPipelineComplete) {
            // Disconnect cleanly only when YouTube enrichment finishes (for roadmap)
            // or when other general pipelines reach progress >= 100
            queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
            
            // Close connection cleanly
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
