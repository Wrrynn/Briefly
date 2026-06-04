"use client";

import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse w-full">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="h-3 w-3 bg-white/5 rounded" />
        <div className="h-5 w-20 bg-white/10 rounded-lg" />
      </div>

      {/* Category + badges */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-24 bg-white/10 rounded-lg" />
        <div className="h-3 w-3 bg-white/5 rounded-full" />
        <div className="h-3 w-20 bg-white/8 rounded" />
      </div>

      {/* Title */}
      <div className="space-y-3 mb-6">
        <div className="h-9 w-full bg-white/10 rounded-lg" />
        <div className="h-9 w-4/5 bg-white/10 rounded-lg" />
        <div className="h-9 w-2/3 bg-white/8 rounded-lg" />
      </div>

      {/* Description */}
      <div className="space-y-2 mb-8 max-w-[620px]">
        <div className="h-4 w-full bg-white/8 rounded" />
        <div className="h-4 w-5/6 bg-white/6 rounded" />
      </div>

      {/* Meta row */}
      <div className="flex gap-6 py-5 border-t border-b border-white/[0.07] mb-8">
        <div className="h-7 w-28 bg-white/8 rounded-full" />
        <div className="h-7 w-20 bg-white/6 rounded" />
        <div className="h-7 w-24 bg-white/6 rounded" />
      </div>

      {/* Image */}
      <div className="w-full aspect-[16/9] bg-white/8 rounded-2xl mb-10" />

      {/* Content paragraphs */}
      <div className="space-y-4 max-w-[700px]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-white/8 rounded" />
            <div className="h-4 w-full bg-white/6 rounded" />
            <div className="h-4 w-4/5 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* AI Insight Panel skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-4 w-4 bg-blue-500/30 rounded" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>

        {/* Sentiment */}
        <div className="mb-5">
          <div className="h-3 w-20 bg-white/8 rounded mb-3" />
          <div className="h-10 w-full bg-white/8 rounded-xl" />
        </div>

        {/* Confidence */}
        <div className="mb-5">
          <div className="h-3 w-28 bg-white/8 rounded mb-3" />
          <div className="h-2 w-full bg-white/8 rounded-full" />
        </div>

        {/* Summary */}
        <div className="space-y-2 mb-5">
          <div className="h-3 w-16 bg-white/8 rounded mb-3" />
          <div className="h-3 w-full bg-white/6 rounded" />
          <div className="h-3 w-5/6 bg-white/6 rounded" />
          <div className="h-3 w-4/5 bg-white/5 rounded" />
        </div>

        {/* Impact tags */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-20 bg-white/8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
