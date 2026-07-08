"use client";

import { useEffect, useRef, useCallback } from "react";
import { connectSSE } from "@/lib/sse";
import { useAnalysisProgressStore } from "@/stores/analysisStore";
import type { SSEProgressEvent } from "@/types";

/**
 * Hook to manage SSE connection for a running analysis.
 * Automatically connects when analysisId is provided and disconnects on cleanup.
 */
export function useSSE(analysisId: string | undefined, enabled = true) {
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

    reset();

    const cleanup = connectSSE(
      analysisId,
      (event: SSEProgressEvent) => {
        addEvent(event);

        // Auto-disconnect when pipeline is complete
        if (event.progress >= 100) {
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
  }, [analysisId, enabled, addEvent, reset, disconnect]);

  return { disconnect };
}
