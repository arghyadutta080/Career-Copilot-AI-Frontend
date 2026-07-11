"use client";

import { memo } from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Logo = memo(function Logo({ className, iconOnly = false, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: { icon: "h-6 w-6", text: "text-sm", sub: "text-[7px]", gap: "gap-2" },
    md: { icon: "h-9 w-9", text: "text-base", sub: "text-[8px]", gap: "gap-2.5" },
    lg: { icon: "h-11 w-11", text: "text-xl", sub: "text-[9px]", gap: "gap-3" },
    xl: { icon: "h-14 w-14", text: "text-2xl", sub: "text-[10px]", gap: "gap-3.5" },
  };

  const currentSize = sizeClasses[size];

  const logoImg = (
    <img
      src="/career-copilot-logo.png"
      alt="Career Copilot Logo"
      className={`${currentSize.icon} object-contain`}
    />
  );

  if (iconOnly) {
    return <div className={className}>{logoImg}</div>;
  }

  return (
    <div className={`flex items-center ${currentSize.gap} ${className || ""}`}>
      {logoImg}
      <div className="flex flex-col select-none">
        <div className="flex items-center gap-1 leading-none">
          <span className={`font-black text-white tracking-tight ${currentSize.text}`}>
            Career
          </span>
          <span className={`font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent tracking-tight ${currentSize.text}`}>
            Copilot
          </span>
          <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-600 to-violet-600 text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-wider ml-1">
            AI
          </span>
        </div>
        <span className={`font-semibold text-zinc-500 tracking-[0.16em] uppercase mt-0.5 ${currentSize.sub}`}>
          YOUR AI CAREER COMPANION
        </span>
      </div>
    </div>
  );
});
