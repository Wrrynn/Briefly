"use client";

import React from "react";

interface TagBadgeProps {
  text: string;
  variant?: "keyword" | "impact";
}

export default function TagBadge({ text, variant = "keyword" }: TagBadgeProps) {
  if (variant === "impact") {
    const isUp = text.includes("↑");
    const isDown = text.includes("↓");
    const isNeutral = text.includes("↔");

    const colorClass = isUp
      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
      : isDown
      ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
      : isNeutral
      ? "bg-blue-500/10 border-blue-500/25 text-blue-400"
      : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400";

    return (
      <span
        className={`inline-flex items-center text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 hover:scale-105 cursor-default ${colorClass}`}
      >
        {text}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-[11px] font-medium px-3 py-1.5 rounded-lg border bg-white/[0.04] border-white/10 text-white/50 transition-all duration-200 hover:bg-white/[0.08] hover:text-white/70 hover:border-white/20 cursor-default">
      #{text}
    </span>
  );
}
