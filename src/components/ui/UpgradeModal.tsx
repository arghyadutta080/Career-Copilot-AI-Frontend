"use client";

import { useEffect } from "react";
import { X, Zap, Mail, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUsage } from "@/hooks/useAnalysis";

interface UpgradeModalProps {
  onClose: () => void;
}

const MAILTO_LINK =
  `mailto:${process.env.NEXT_PUBLIC_DEVELOPER_EMAIL_ID}` +
  "?subject=Career%20Copilot%20AI%20Upgrade%20Request" +
  "&body=Hello%2C%0A%0AI%27d%20like%20to%20upgrade%20my%20Career%20Copilot%20AI%20account.%0A%0AMy%20registered%20email%20is%3A%0A%0AThank%20you.";

// Per-plan copy — title, body, and upgrade feature list bullets.
const PLAN_CONTENT = {
  FREE: {
    title: "You've reached your free analysis limit.",
    body: (limit: number) => (
      <>
        The free plan includes{" "}
        <span className="text-white font-medium">{limit} lifetime analyses</span>.
        Upgrade your account to continue creating new analyses and unlock
        unlimited access.
      </>
    ),
    features: [
      "Unlimited lifetime analyses",
      "Priority AI processing",
      "Full access to all tools",
    ],
  },
  PRO: {
    title: "You've reached your Pro plan analysis limit.",
    body: (limit: number) => (
      <>
        The Pro plan includes{" "}
        <span className="text-white font-medium">{limit} lifetime analyses</span>.
        Upgrade to Enterprise for a higher quota and dedicated support.
      </>
    ),
    features: [
      "Massively higher analysis quota",
      "Dedicated developer support",
      "Early access to new features",
    ],
  },
  ENTERPRISE: {
    title: "You've reached your Enterprise plan limit.",
    body: (limit: number) => (
      <>
        You&apos;ve used all{" "}
        <span className="text-white font-medium">{limit} analyses</span> in your
        Enterprise plan. Contact the developer to extend your quota.
      </>
    ),
    features: [
      "Custom quota extension",
      "Priority support",
      "Tailored plan options",
    ],
  },
} as const;

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  // Plan comes from the global store (set by dashboard/page.tsx when usage loads).
  const plan = useAuthStore((s) => s.plan) ?? "FREE";

  // useUsage() reads from React Query cache — no new network request if
  // the dashboard already fetched it.
  const { data: usage } = useUsage();
  const limit = usage?.analysisLimit ?? 0;

  const content = PLAN_CONTENT[plan as keyof typeof PLAN_CONTENT] ?? PLAN_CONTENT.FREE;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Gradient accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600" />

        <div className="p-6">
          {/* Close button */}
          <button
            id="upgrade-modal-close"
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 mb-5">
            <Zap className="h-7 w-7 text-violet-400" />
          </div>

          {/* Content — driven by current plan */}
          <h2
            id="upgrade-modal-title"
            className="text-xl font-bold text-white leading-snug"
          >
            {content.title}
          </h2>

          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {content.body(limit)}
          </p>

          {/* Feature list */}
          <ul className="mt-5 space-y-2">
            {content.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <a
              id="upgrade-modal-contact-btn"
              href={MAILTO_LINK}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:opacity-90 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              Contact Developer
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </a>
            <button
              id="upgrade-modal-later-btn"
              onClick={onClose}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
