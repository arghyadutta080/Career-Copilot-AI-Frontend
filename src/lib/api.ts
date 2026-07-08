import { useAuthStore } from "@/stores/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Authenticated fetch wrapper.
 * Injects Authorization header from Zustand auth store automatically.
 * Handles 401 responses by clearing auth state.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for JSON — skip for FormData (multipart)
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed: ${response.status}`);
  }

  return response.json();
}
