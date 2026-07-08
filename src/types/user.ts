// ─── User ───────────────────────────────────────────────────────────────────

export interface UserPreferences {
  targetRole?: string;
  location?: string;
  remote?: boolean;
  expectedSalary?: number;
}

export interface User {
  _id: string;
  googleId?: string;
  name: string;
  email: string;
  avatar?: string;
  currentRole?: string;
  experience?: number;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: User;
}
