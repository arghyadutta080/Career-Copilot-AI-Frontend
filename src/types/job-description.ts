// ─── Job Description ─────────────────────────────────────────────────────────

export interface JobDescription {
  _id: string;
  userId: string;
  title: string;
  company: string;
  description: string;
  extractedSkills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobDescriptionInput {
  title: string;
  company: string;
  description: string;
  extractedSkills?: string[];
}
