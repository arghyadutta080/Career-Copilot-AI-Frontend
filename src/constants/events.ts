export const EVENT_TYPES = {
  PROGRESS: "progress",
  COMPLETE: "complete",
  SUCCESS: "success",
  ANSWER_STARTED: "answer_started",
  ANSWER_DELTA: "answer_delta",
  ANSWER_COMPLETED: "answer_completed",
  ANSWER_ERROR: "answer_error",
  ERROR: "error",
  ROADMAP_RESOURCES_UPDATED: "roadmap_resources_updated",
} as const;

export const EVENT_STEPS = {
  INTERVIEW_QUESTIONS: "Interview Questions",
  LEARNING_ROADMAP: "Learning Roadmap",
  SKILL_GAP: "Skill Gap",
  RESUME_OPTIMIZER: "Resume Optimizer",
  COVER_LETTER: "Cover Letter",
  ATS: "ATS",
} as const;

export const EVENT_MESSAGES = {
  YOUTUBE_RESOURCES_LOADED: "YouTube resources loaded.",
  GENERATING_COVER_LETTER: "Generating cover letter...",
  COVER_LETTER_GENERATED: "Cover letter generated.",
  ANALYZING_MISSING_SKILLS: "Analyzing missing skills...",
  SKILL_GAP_ANALYSIS_COMPLETED: "Skill Gap analysis completed",
  GENERATING_PERSONALIZED_ROADMAP: "Generating personalized roadmap...",
  ROADMAP_GENERATION_COMPLETED: "Roadmap Generation Completed",
  OPTIMIZING_RESUME: "Optimizing resume...",
  RESUME_OPTIMIZATION_COMPLETED: "Resume optimization completed.",
  GENERATING_ANSWER: "Generating answer...",
  ANSWER_GENERATION_COMPLETED: "Answer generation completed.",
  ANSWER_GENERATION_FAILED: "Answer generation failed.",
  GENERATING_INTERVIEW_QUESTIONS: "Generating interview questions...",
  INTERVIEW_QUESTIONS_GENERATED: "Interview questions generated.",
  CALCULATING_ATS_SCORE: "Calculating ATS score...",
  ATS_SCORE_CALCULATION_COMPLETED: "ATS Score Calculation completed",
} as const;
