"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo } from "react";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/authStore";
import { apiFetch } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";
import { PLAN_LABELS } from "@/lib/quotaPlan";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyses", label: "Analyses", icon: BarChart3 },
  { href: "/resumes", label: "Resume Library", icon: FileText },
  { href: "/job-descriptions", label: "Job Descriptions", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, plan } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("API logout error:", err);
    }
    logout();
    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-zinc-800/60">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="border-t border-zinc-800/60 p-4">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover border border-zinc-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {user.name}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {plan ? PLAN_LABELS[plan] ?? plan : "Free Plan"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-zinc-800/60"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
});
