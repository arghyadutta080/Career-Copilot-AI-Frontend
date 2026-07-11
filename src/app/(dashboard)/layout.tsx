"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { apiFetch } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Logo } from "@/components/ui/Logo";
import { Menu } from "lucide-react";
import type { User } from "@/types";

/**
 * Protected dashboard layout.
 * Validates the JWT token on mount and redirects to /login if invalid.
 * Renders the sidebar + main content area with mobile responsiveness.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token, setAuth, setUser, logout, hydrate } =
    useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row">
      {/* Mobile Sticky Header Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo size="sm" />
        <div className="w-9 h-9" /> {/* Visual spacer */}
      </header>

      {/* Sidebar navigation drawer */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen lg:ml-64 w-full flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}
