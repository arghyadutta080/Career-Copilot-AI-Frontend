import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getGraphQLClient } from "@/lib/graphql";
import {
  GET_ANALYSIS_OVERVIEW,
  GET_ANALYSIS_ATS,
  GET_ANALYSIS_SKILL_GAP,
  GET_ANALYSIS_RESUME_OPTIMIZER,
  GET_ANALYSIS_COVER_LETTER,
  GET_ANALYSIS_INTERVIEW_PREP,
  GET_ANALYSIS_LEARNING_ROADMAP,
  GET_ANALYSIS_STATUS,
  CREATE_ANALYSIS,
  START_ANALYSIS,
  GENERATE_INTERVIEW_QUESTIONS,
  GENERATE_LEARNING_ROADMAP,
  GENERATE_INTERVIEW_ANSWER,
} from "@/lib/queries/analysis";
import type { Analysis, JobDescription, DashboardOverviewItem } from "@/types";

// ─── REST-based hooks (list views — lightweight) ────────────────────────────

export function useJobDescriptions() {
  return useQuery<JobDescription[]>({
    queryKey: ["job-descriptions"],
    queryFn: () => apiFetch<JobDescription[]>("/api/job-descriptions"),
    staleTime: 60 * 1000,
  });
}

export function useDashboardOverview() {
  return useQuery<DashboardOverviewItem[]>({
    queryKey: ["dashboard-overview"],
    queryFn: () => apiFetch<DashboardOverviewItem[]>("/api/analyses/dashboard"),
    staleTime: 30 * 1000,
  });
}

// ─── GraphQL-based hooks (detail views — full data) ─────────────────────────

/** Base analysis fetch for detail page overview */
export function useAnalysis(analysisId: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", analysisId],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS_OVERVIEW,
        { id: analysisId }
      );
      return data.getAnalysis;
    },
    enabled: !!analysisId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalysisATS(analysisId: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", analysisId, "ats"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS_ATS,
        { id: analysisId }
      );
      return data.getAnalysis;
    },
    enabled: !!analysisId,
    staleTime: Infinity,
  });
}

export function useAnalysisSkillGap(analysisId: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", analysisId, "skillgap"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS_SKILL_GAP,
        { id: analysisId }
      );
      return data.getAnalysis;
    },
    enabled: !!analysisId,
    staleTime: Infinity,
  });
}

export function useAnalysisOptimizer(analysisId: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", analysisId, "optimizer"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS_RESUME_OPTIMIZER,
        { id: analysisId }
      );
      return data.getAnalysis;
    },
    enabled: !!analysisId,
    staleTime: Infinity,
  });
}

export function useAnalysisCoverLetter(analysisId: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", analysisId, "cover-letter"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS_COVER_LETTER,
        { id: analysisId }
      );
      return data.getAnalysis;
    },
    enabled: !!analysisId,
    staleTime: Infinity,
  });
}

export function useAnalysisInterview(analysisId: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", analysisId, "interview"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS_INTERVIEW_PREP,
        { id: analysisId }
      );
      return data.getAnalysis;
    },
    enabled: !!analysisId,
    staleTime: Infinity,
  });
}

export function useAnalysisRoadmap(analysisId: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", analysisId, "roadmap"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const data = await client.request<{ getAnalysis: Analysis }>(
        GET_ANALYSIS_LEARNING_ROADMAP,
        { id: analysisId }
      );
      return data.getAnalysis;
    },
    enabled: !!analysisId,
    staleTime: Infinity,
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
    refetchInterval: false, // Disabled polling; relying entirely on SSE invalidation
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
      queryClient.invalidateQueries({ queryKey: ["analysis", analysisId, "interview"] });
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
      queryClient.invalidateQueries({ queryKey: ["analysis", analysisId, "roadmap"] });
    },
  });
}

export function useGenerateInterviewAnswer() {
  return useMutation({
    mutationFn: async ({ analysisId, questionId }: { analysisId: string; questionId: string }) => {
      const client = getGraphQLClient();
      await client.request(GENERATE_INTERVIEW_ANSWER, { analysisId, questionId });
    },
  });
}
