import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  /** Set user + token after successful login */
  setAuth: (user: User, token: string) => void;

  /** Update user object (e.g. after profile edit) */
  setUser: (user: User) => void;

  /** Clear auth state and remove persisted token */
  logout: () => void;

  /** Hydrate token from localStorage on app load */
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    set({ user, token, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
