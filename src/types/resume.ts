// ─── Resume ──────────────────────────────────────────────────────────────────

export interface ResumeProject {
  title?: string;
  description?: string;
}

export interface ResumeExperience {
  company?: string;
  role?: string;
  duration?: string;
  responsibilities?: string[];
}

export interface ResumeEducation {
  institution?: string;
  degree?: string;
}

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  projects?: ResumeProject[];
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  certifications?: string[];
  achievements?: string[];
}

export interface Resume {
  _id: string;
  userId: string;
  originalName: string;
  filename: string;
  filePath: string;
  rawText?: string;
  parsedData?: ParsedResume;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
