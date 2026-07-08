import type { SSEProgressEvent } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Connects to the SSE stream for a running analysis.
 * Returns a cleanup function to close the connection.
 *
 * Events are parsed from JSON `data:` lines and forwarded
 * to the provided callback.
 */
export function connectSSE(
  analysisId: string,
  onEvent: (event: SSEProgressEvent) => void,
  onError?: (error: Event) => void
): () => void {
  const url = `${BASE_URL}/api/stream/${analysisId}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (e) => {
    try {
      const parsed: SSEProgressEvent = JSON.parse(e.data);
      onEvent(parsed);
    } catch {
      console.warn("[SSE] Failed to parse event:", e.data);
    }
  };

  eventSource.onerror = (e) => {
    onError?.(e);
    // EventSource will auto-reconnect; we don't close here
    // unless the caller invokes the cleanup function.
  };

  return () => {
    eventSource.close();
  };
}
