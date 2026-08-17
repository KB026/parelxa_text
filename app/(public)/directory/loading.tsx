import React from 'react';

export default function DirectoryLoading() {
  return (
    <div className="agents-page animate-pulse" style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 40px 80px' }}>
      {/* Header Skeleton */}
      <header className="mb-8">
        <div className="h-10 md:h-12 w-80 max-w-full bg-white/10 rounded-xl mb-4" />
        <div className="h-5 w-full max-w-xl bg-white/5 rounded-lg" />
      </header>

      {/* Search Bar Skeleton */}
      <div className="w-full h-14 bg-[#141418] border border-white/10 rounded-2xl mb-8" />

      {/* Filter Categories Pill Row Skeleton */}
      <div className="flex gap-2.5 mb-8 overflow-hidden">
        {[80, 110, 95, 130, 90, 120, 100].map((width, idx) => (
          <div
            key={idx}
            className="h-9 bg-white/5 border border-white/5 rounded-xl shrink-0"
            style={{ width: `${width}px` }}
          />
        ))}
      </div>

      {/* Agent Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-5 md:p-6 rounded-2xl border border-white/[0.08] bg-[#1C1C21] min-h-[220px]"
          >
            <div>
              {/* Card Title Skeleton */}
              <div className="flex items-center justify-between mb-3 mt-1">
                <div className="h-6 w-3/5 bg-white/10 rounded-md" />
                <div className="h-5 w-5 bg-white/5 rounded-md" />
              </div>

              {/* Card Summary Lines Skeleton */}
              <div className="space-y-2 mb-6">
                <div className="h-3.5 w-full bg-white/5 rounded" />
                <div className="h-3.5 w-4/5 bg-white/5 rounded" />
                <div className="h-3.5 w-2/3 bg-white/5 rounded" />
              </div>
            </div>

            {/* Card Footer Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
              <div className="h-5 w-14 bg-white/10 rounded-md" />
              <div className="h-8 w-24 bg-white/10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
