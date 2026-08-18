import React from 'react';

export default function BundlesLoading() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 animate-pulse">
        {/* HERO SKELETON */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5">
          <div className="inline-block h-7 w-36 bg-white/10 rounded-full mx-auto" />
          <div className="h-12 sm:h-16 w-3/4 max-w-md bg-white/10 rounded-2xl mx-auto" />
          <div className="h-5 w-full max-w-lg bg-white/5 rounded-lg mx-auto" />
        </div>

        {/* BUNDLE CARDS GRID SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-6 rounded-2xl border border-white/[0.08] bg-[#141418] min-h-[300px]"
            >
              <div>
                <div className="h-6 w-1/2 bg-white/10 rounded-md mb-3" />
                <div className="h-4 w-3/4 bg-white/5 rounded mb-6" />
                <div className="space-y-2 mb-6">
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-4/5 bg-white/5 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                <div className="h-5 w-20 bg-white/10 rounded" />
                <div className="h-9 w-28 bg-white/10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
