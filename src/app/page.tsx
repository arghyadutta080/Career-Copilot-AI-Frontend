"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function LoginPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      console.error(err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    setLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Authentication failed");
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-blue-500" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/80">
          <div className="flex flex-col items-center text-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-20 w-20 rounded-full border-2 border-blue-500/30 object-cover shadow-lg mb-4"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 shadow-lg text-2xl font-bold mb-4">
                {user.name.charAt(0)}
              </div>
            )}

            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Hello, {user.name}!
            </h2>
            <p className="mt-1 text-sm text-zinc-400">{user.email}</p>

            <div className="mt-6 w-full p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 text-left">
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>Account Status</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Provider</span>
                <span>Google OAuth</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-8 w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 border border-zinc-850 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 bg-zinc-900 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/80">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20 mb-4">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Welcome to Career Copilot
          </h2>
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
          <div className="w-full max-w-[280px] flex justify-center scale-105 hover:scale-[1.07] transition-all duration-200">
            <GoogleLogin
              theme="filled_black"
              shape="pill"
              size="large"
              width="250"
              onSuccess={handleGoogleSuccess}
              onError={() => setAuthError("Google Sign-In failed. Please try again.")}
            />
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
