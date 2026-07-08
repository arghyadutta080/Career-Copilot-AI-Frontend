"use client";

import { cn } from "@/lib/cn";
import { memo, useState, useCallback, type ReactNode } from "react";

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pills";
}

export const Tabs = memo(function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = "default",
}: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto scrollbar-hide",
        variant === "default" && "border-b border-zinc-800",
        variant === "pills" && "bg-zinc-900/60 rounded-xl p-1",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
            variant === "default" && [
              "border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-violet-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200",
            ],
            variant === "pills" && [
              "rounded-lg",
              activeTab === tab.id
                ? "bg-violet-600/20 text-violet-300"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60",
            ]
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-md",
                activeTab === tab.id
                  ? "bg-violet-500/20 text-violet-300"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
});

/** Hook for managing tab state */
export function useTabs(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const onTabChange = useCallback((tabId: string) => setActiveTab(tabId), []);
  return { activeTab, onTabChange } as const;
}
