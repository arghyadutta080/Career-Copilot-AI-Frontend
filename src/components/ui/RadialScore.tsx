"use client";

import { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/cn";

interface RadialScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: { outer: 48, inner: 38, text: "text-lg", labelText: "text-[9px]" },
  md: { outer: 72, inner: 58, text: "text-2xl", labelText: "text-[10px]" },
  lg: { outer: 100, inner: 82, text: "text-3xl", labelText: "text-xs" },
};

function getScoreColor(score: number) {
  if (score >= 80) return "#22c55e"; // emerald
  if (score >= 60) return "#eab308"; // yellow
  if (score >= 40) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export const RadialScore = memo(function RadialScore({
  score,
  size = "md",
  label,
  className,
}: RadialScoreProps) {
  const config = sizeConfig[size];
  const color = getScoreColor(score);

  const data = useMemo(
    () => [
      { value: score },
      { value: 100 - score },
    ],
    [score]
  );

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <ResponsiveContainer width={config.outer * 2} height={config.outer * 2}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={config.outer}
            innerRadius={config.inner}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#27272a" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold text-white", config.text)}>
          {score}%
        </span>
        <span className={cn("text-zinc-400", config.labelText)}>
          {label || getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
});
