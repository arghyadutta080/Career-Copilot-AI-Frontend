"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import type { AuthResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;

    setLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Authentication failed");
      }

      const data: AuthResponse = await response.json();
      setAuth(data.user, data.token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred during authentication.";
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/80">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Welcome to Career Copilot
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to access your AI-powered career assistant
          </p>
        </div>

        {authError && (
          <div className="mb-4 text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
            {authError}
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-4">
          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
          ) : (
            <div className="w-full max-w-[280px] flex justify-center scale-105 hover:scale-[1.07] transition-all duration-200">
              <GoogleLogin
                theme="filled_black"
                shape="pill"
                size="large"
                width="250"
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setAuthError("Google Sign-In failed. Please try again.")
                }
              />
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
