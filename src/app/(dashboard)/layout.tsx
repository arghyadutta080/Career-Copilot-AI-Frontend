"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { apiFetch } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import type { User } from "@/types";

/**
 * Protected dashboard layout.
 * Validates the JWT token on mount and redirects to /login if invalid.
 * Renders the sidebar + main content area.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token, setAuth, setUser, logout, hydrate } =
    useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const validateAuth = async () => {
      const currentToken = useAuthStore.getState().token;

      if (!currentToken) {
        router.replace("/login");
        return;
      }

      try {
        const user = await apiFetch<User>("/api/auth/me");
        setUser(user);
      } catch {
        logout();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    // Small delay to let hydrate() set the token first
    const timer = setTimeout(validateAuth, 50);
    return () => clearTimeout(timer);
  }, [router, setUser, logout, hydrate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
