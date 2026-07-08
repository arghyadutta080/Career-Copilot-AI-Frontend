// ─── Analysis Types ──────────────────────────────────────────────────────────

export type AnalysisStatus = "pending" | "running" | "completed" | "failed";
export type ToolStatusValue = "not_started" | "running" | "completed" | "failed";

export interface ToolStatus {
  ats: ToolStatusValue;
  skillGap: ToolStatusValue;
  optimizer: ToolStatusValue;
  coverLetter: ToolStatusValue;
  interview: ToolStatusValue;
  roadmap: ToolStatusValue;
}

// ─── ATS ─────────────────────────────────────────────────────────────────────

export interface ATSResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  summary: string;
}

// ─── Skill Gap ───────────────────────────────────────────────────────────────

export interface LearningPriorityItem {
  skill: string;
  reason: string;
}

export interface SkillGapResult {
  missingSkills: string[];
  recommendedSkills: string[];
  learningPriority: LearningPriorityItem[];
  summary: string;
}

// ─── Interview ───────────────────────────────────────────────────────────────

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty?: string;
  topics?: string[];
  answer?: string;
}

export interface InterviewFollowUp {
  parentQuestion: string;
  followUps: InterviewQuestion[];
}

export interface InterviewResult {
  hr: InterviewQuestion[];
  resumeBased: InterviewQuestion[];
  experienceBased: InterviewQuestion[];
  projectBased: InterviewQuestion[];
  technical: InterviewQuestion[];
  coding: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  followUps: InterviewFollowUp[];
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export interface LearningResource {
  title: string;
  type: string;
  query: string;
  reason: string;
}

export interface RoadmapStep {
  order: number;
  title: string;
  description: string;
  priority: string;
  estimatedHours: number;
  resources: LearningResource[];
  outcomes: string[];
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  steps: RoadmapStep[];
}

export interface LearningRoadmap {
  overview: string;
  milestones: RoadmapMilestone[];
  interviewChecklist: string[];
}

// ─── Optimizer ───────────────────────────────────────────────────────────────

export interface ATSImpact {
  currentScore: number;
  expectedScore: number;
  reason: string;
}

export interface ExperienceSuggestion {
  company: string;
  role: string;
  suggestions: string[];
}

export interface ProjectSuggestion {
  project: string;
  suggestions: string[];
}

export interface SectionSuggestion {
  section: string;
  suggestion: string;
}

export interface ResumeOptimizerResult {
  overallSummary: string;
  atsImpact: ATSImpact;
  keywordSuggestions: string[];
  experienceSuggestions: ExperienceSuggestion[];
  projectSuggestions: ProjectSuggestion[];
  sectionSuggestions: SectionSuggestion[];
  optimizedContent: string;
}

// ─── Cover Letter ────────────────────────────────────────────────────────────

export interface CoverLetterResult {
  subject: string;
  content: string;
}

// ─── Combined Results ────────────────────────────────────────────────────────

export interface AnalysisResults {
  ats?: ATSResult;
  skillGap?: SkillGapResult;
  interview?: InterviewResult;
  roadmap?: LearningRoadmap;
  optimizer?: ResumeOptimizerResult;
  coverLetter?: CoverLetterResult;
}

// ─── Analysis Document ───────────────────────────────────────────────────────

export interface Analysis {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  status: AnalysisStatus;
  toolStatus: ToolStatus;
  results?: AnalysisResults;
  createdAt: string;
  updatedAt: string;
}

// ─── SSE Events ──────────────────────────────────────────────────────────────

export interface SSEProgressEvent {
  type: "progress" | "complete" | "error";
  step: string;
  message: string;
  progress: number;
  data?: Record<string, unknown>;
}

// ─── Analysis List Item (lightweight for list views) ─────────────────────────

export interface AnalysisListMeta {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
