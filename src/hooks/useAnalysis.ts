import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getGraphQLClient } from "@/lib/graphql";
import {
  GET_ANALYSIS,
  GET_ANALYSIS_STATUS,
  CREATE_ANALYSIS,
  START_ANALYSIS,
  GENERATE_INTERVIEW_QUESTIONS,
  GENERATE_LEARNING_ROADMAP,
} from "@/lib/queries/analysis";
import type { Analysis, JobDescription, AnalysisListMeta } from "@/types";

// ─── REST-based hooks (list views — lightweight) ────────────────────────────

export function useJobDescriptions() {
  return useQuery<JobDescription[]>({
    queryKey: ["job-descriptions"],
    queryFn: () => apiFetch<JobDescription[]>("/api/job-descriptions"),
    staleTime: 60 * 1000,
  });
}

export function useJobAnalyses(jobId: string | undefined) {
  return useQuery<AnalysisListMeta[]>({
    queryKey: ["job-analyses", jobId],
    queryFn: () =>
      apiFetch<AnalysisListMeta[]>(`/api/job-descriptions/${jobId}/analyses`),
    enabled: !!jobId,
  });
}

// ─── GraphQL-based hooks (detail views — full data) ─────────────────────────

/** Full analysis fetch for detail page — all fields loaded on demand */
export function useAnalysis(analysisId: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", analysisId],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS,
        { id: analysisId }
      );
      return data.getAnalysis;
    },
    enabled: !!analysisId,
    staleTime: 30 * 1000,
  });
}

/** Lightweight status-only fetch for polling during pipeline execution */
export function useAnalysisStatus(analysisId: string | undefined, enabled = true) {
  return useQuery<Pick<Analysis, "id" | "status" | "toolStatus">>({
    queryKey: ["analysis-status", analysisId],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{
        getAnalysis: Pick<Analysis, "id" | "status" | "toolStatus">;
      }>(GET_ANALYSIS_STATUS, { id: analysisId });
      return data.getAnalysis;
    },
    enabled: !!analysisId && enabled,
    refetchInterval: enabled ? 3000 : false, // Poll every 3s when active
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resumeId,
      jobDescriptionId,
    }: {
      resumeId: string;
      jobDescriptionId: string;
    }) => {
      const client = getGraphQLClient();
      const data = await client.request<{
        createAnalysis: { id: string; status: string };
      }>(CREATE_ANALYSIS, { resumeId, jobDescriptionId });
      return data.createAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-analyses"] });
    },
  });
}

export function useStartAnalysis() {
  return useMutation({
    mutationFn: async (analysisId: string) => {
      const client = getGraphQLClient();
      await client.request(START_ANALYSIS, { analysisId });
    },
  });
}

export function useGenerateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analysisId: string) => {
      const client = getGraphQLClient();
      await client.request(GENERATE_INTERVIEW_QUESTIONS, { analysisId });
    },
    onSuccess: (_data, analysisId) => {
      queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
    },
  });
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analysisId: string) => {
      const client = getGraphQLClient();
      await client.request(GENERATE_LEARNING_ROADMAP, { analysisId });
    },
    onSuccess: (_data, analysisId) => {
      queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
    },
  });
}
