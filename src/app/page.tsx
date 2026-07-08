"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

/**
 * Root page — redirects to /dashboard if authenticated, /login otherwise.
 */
export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      // Wait for hydration before redirecting to login
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
    </div>
  );
}
