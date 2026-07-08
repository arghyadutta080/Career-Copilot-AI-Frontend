import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Resume } from "@/types";

export function useResumes() {
  return useQuery<Resume[]>({
    queryKey: ["resumes"],
    queryFn: () => apiFetch<Resume[]>("/api/resumes"),
    staleTime: 60 * 1000,
  });
}

export function useResume(resumeId: string | undefined) {
  return useQuery<Resume>({
    queryKey: ["resume", resumeId],
    queryFn: () => apiFetch<Resume>(`/api/resumes/${resumeId}`),
    enabled: !!resumeId,
    staleTime: 5 * 60 * 1000,
  });
}
