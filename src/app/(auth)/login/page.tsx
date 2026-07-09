"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  FileText,
  GraduationCap,
  Users,
  ChevronRight,
  Lock,
  ArrowRight,
  CheckCircle2,
  X,
  Plus
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import type { AuthResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const features = [
  {
    id: "ats",
    title: "ATS Compatibility Scan",
    description: "Scan your resume against target job postings. Instantly view match scores and missing keywords.",
    icon: ShieldCheck,
    badge: "Instant Analysis"
  },
  {
    id: "optimizer",
    title: "Resume Optimizer",
    description: "Get precise, line-by-line rewrite suggestions for bullet points and targeted keyword additions.",
    icon: FileText,
    badge: "ATS Impact"
  },
  {
    id: "roadmaps",
    title: "Skill Gap & Learning Roadmaps",
    description: "Map out missing skills and view an AI-generated learning roadmap with high-quality study resources.",
    icon: GraduationCap,
    badge: "Skill Evolution"
  },
  {
    id: "cover-letter",
    title: "Tailored Cover Letter Writer",
    description: "Draft professional, job-specific cover letters that highlight your experience relative to the role.",
    icon: Sparkles,
    badge: "Custom Content"
  },
  {
    id: "questions",
    title: "Interview Questions",
    description: "Get role-specific technical and behavioral interview questions tailored to your profile and the target job.",
    icon: Users,
    badge: "Prep Questions"
  }
];

const stats = [
  { value: "15,000+", label: "Resumes Evaluated" },
  { value: "85%", label: "ATS Score Increase" },
  { value: "3x", label: "More Interview Calls" },
  { value: "100%", label: "Free Beta Access" }
];

const steps = [
  {
    step: "01",
    title: "Secure Google Sign-In",
    description: "Log in with a single click. We securely manage your profile and data with zero friction."
  },
  {
    step: "02",
    title: "Target Your Ideal Job",
    description: "Upload your current resume and paste the job description you're aiming for."
  },
  {
    step: "03",
    title: "Deploy Your Copilot",
    description: "Receive instant scoring, custom learning roadmaps, keyword tweaks, and job-specific interview questions."
  }
];

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Interactive modal state
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);

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
    setSelectedFeature(null); // Close modal if open

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderGoogleLogin = () => {
    if (loading) {
      return (
        <div className="flex h-11 items-center justify-center bg-zinc-950 border border-zinc-800 rounded-full w-[250px]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
        </div>
      );
    }

    return (
      <div className="w-full flex justify-center scale-100 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
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
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans relative overflow-x-hidden selection:bg-violet-600/30 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sticky Header Nav */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Career Copilot AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("free-beta")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Free Access
            </button>
          </nav>

          <div>
            <button
              onClick={() => scrollToSection("hero-signin")}
              className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-4 py-1.5 text-xs font-semibold text-zinc-300 transition-colors shadow-sm cursor-pointer"
            >
              <Lock className="h-3 w-3" />
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Hero Content */}
          <div className="md:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Free Public Beta Live
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your AI-Powered <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Career Strategist
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
              Optimize your resume, check ATS compatibility, identify skill gaps against target jobs, build custom roadmaps, and practice mock interviews—all in one free tool.
            </p>

            {/* In-Hero Login Card */}
            <div id="hero-signin" className="max-w-md p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Get Started Instantly</h3>
                <p className="text-xs text-zinc-500 mt-1">Sign in with your Google account. No credit card required.</p>
              </div>

              {authError && (
                <div className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-xl">
                  {authError}
                </div>
              )}

              <div className="pt-2 flex justify-start">
                {renderGoogleLogin()}
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-md md:max-w-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 shadow-2xl backdrop-blur-xl hover:border-zinc-700/80 transition-colors duration-500">
                <img
                  src="/dashboard-mockup.png"
                  alt="Career Copilot AI Dashboard Mockup"
                  className="rounded-xl w-full h-auto shadow-lg object-cover hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-zinc-900 bg-zinc-950/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center space-y-16">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Advanced Tools to Elevate Your Search
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Interactive, intelligence-driven modules constructed to identify your competitive gaps and build clear strategies. Click any card to explore.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => setSelectedFeature(feat)}
                className="group p-6 rounded-2xl border border-zinc-900 bg-zinc-900/25 hover:border-violet-500/30 hover:bg-zinc-900/40 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(139,92,246,0.05)] relative overflow-hidden"
              >
                {/* Glow hint */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/5 rounded-full blur-xl group-hover:bg-violet-600/10 transition-colors pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-violet-400 group-hover:text-white group-hover:bg-violet-600 transition-colors duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-violet-400 transition-colors bg-zinc-900/50 px-2 py-1 rounded-md border border-zinc-800/60">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
                  Try it out
                  <ChevronRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-zinc-900 bg-zinc-900/10 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Simplified Optimization Flow
            </h2>
            <p className="text-sm text-zinc-400">
              Three simple steps to benchmark your profile, build roadmap checkpoints, and prepare to excel.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {steps.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-zinc-900/60 bg-zinc-950 space-y-4 relative">
                <span className="absolute top-4 right-6 text-3xl font-extrabold text-zinc-800">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-white pt-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Beta Access Banner */}
      <section id="free-beta" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center space-y-8 overflow-hidden shadow-2xl">
          {/* Subtle gradient highlights */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase">
              100% Free Beta
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Start Copiloting Your Career Today
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              No credit card paywalls, no trial expirations. Sign in with your Google account to optimize your resumes, analyze gaps, and practice job prep instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-2">
            {renderGoogleLogin()}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <span className="font-bold text-white tracking-tight">Career Copilot AI</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-zinc-400 transition-colors">Terms of Service</span>
            <span className="hover:text-zinc-400 transition-colors">Support</span>
          </div>

          <div>
            © {new Date().getFullYear()} Career Copilot AI. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Feature Access Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-zinc-800/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                {(() => {
                  const Icon = selectedFeature.icon;
                  return <Icon className="h-5.5 w-5.5" />;
                })()}
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">{selectedFeature.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  {selectedFeature.badge}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-400 leading-relaxed">
                {selectedFeature.description}
              </div>

              <div className="space-y-4 pt-2">
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold text-white">Authentication Required</p>
                  <p className="text-[11px] text-zinc-500">Sign in securely with Google to access this free module.</p>
                </div>
                
                <div className="flex justify-center">
                  {renderGoogleLogin()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
