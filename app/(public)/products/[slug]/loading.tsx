import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div className="pb-28 md:pb-12 px-5 md:px-8 animate-pulse" style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '100px' }}>
      {/* Back Link Skeleton */}
      <div className="h-4 w-40 bg-white/10 rounded mb-10" />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Main Detail Content */}
        <div className="md:col-span-8 space-y-8">
          {/* Hero Header Skeleton */}
          <div className="p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-[#141418]">
            <div className="flex items-start gap-5 mb-6">
              {/* Logo Skeleton */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 shrink-0 border border-white/10" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="h-7 md:h-8 w-48 bg-white/10 rounded-lg" />
                  <div className="h-5 w-20 bg-white/5 rounded-full" />
                </div>
                <div className="h-4 w-full max-w-md bg-white/5 rounded mb-2" />
                <div className="h-4 w-3/4 bg-white/5 rounded" />
              </div>
            </div>

            {/* Badges / Rating Row */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06] flex-wrap">
              <div className="h-6 w-24 bg-white/10 rounded-md" />
              <div className="h-6 w-32 bg-white/5 rounded-md" />
              <div className="h-6 w-28 bg-white/5 rounded-md" />
            </div>
          </div>

          {/* Media / Screenshots Gallery Skeleton */}
          <div className="w-full h-64 md:h-80 rounded-2xl bg-[#141418] border border-white/[0.08] flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5" />
          </div>

          {/* About & Features Section Skeleton */}
          <div className="p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-[#141418] space-y-4">
            <div className="h-6 w-36 bg-white/10 rounded-md mb-4" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-4/5 bg-white/5 rounded" />
            <div className="h-4 w-3/5 bg-white/5 rounded" />
          </div>

          {/* Use Cases Section Skeleton */}
          <div className="p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-[#141418] space-y-4">
            <div className="h-6 w-44 bg-white/10 rounded-md mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-24 rounded-xl bg-white/5 border border-white/5" />
              <div className="h-24 rounded-xl bg-white/5 border border-white/5" />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar / Pricing Card Skeleton */}
        <div className="md:col-span-4">
          <div className="sticky top-28 p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-[#141418] space-y-6">
            <div>
              <div className="h-4 w-20 bg-white/5 rounded mb-2" />
              <div className="h-8 w-36 bg-white/10 rounded-lg" />
            </div>

            <div className="h-12 w-full bg-[#8B5CF6]/20 rounded-xl border border-[#8B5CF6]/30" />

            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/10 shrink-0" />
                  <div className="h-3.5 w-full bg-white/5 rounded" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="h-9 w-28 bg-white/5 rounded-lg" />
              <div className="h-9 w-28 bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
