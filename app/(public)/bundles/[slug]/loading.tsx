import React from 'react';

export default function BundleDetailLoading() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 animate-pulse space-y-12">
        {/* Back Link Skeleton */}
        <div className="h-4 w-32 bg-white/10 rounded" />

        {/* Hero Section Skeleton */}
        <div className="space-y-4 max-w-3xl">
          <div className="h-8 w-40 bg-white/10 rounded-full" />
          <div className="h-12 w-3/4 bg-white/10 rounded-2xl" />
          <div className="h-5 w-full bg-white/5 rounded-lg" />
          <div className="h-5 w-2/3 bg-white/5 rounded-lg" />
        </div>

        {/* Tool Cards Flow Skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-white/[0.08] bg-[#141418] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="h-5 w-32 bg-white/10 rounded" />
                <div className="h-6 w-48 bg-white/10 rounded-md" />
                <div className="h-4 w-3/4 bg-white/5 rounded" />
              </div>
              <div className="h-10 w-32 bg-white/10 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
