import React from 'react';

export default function BlogIndexLoading() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] py-20 px-4 sm:px-6 md:px-12 animate-pulse">
      <div className="max-w-5xl mx-auto">
        {/* Header Skeleton */}
        <header className="mb-14 border-b border-white/[0.08] pb-10">
          <div className="h-6 w-52 bg-[#8B5CF6]/20 rounded mb-4" />
          <div className="h-10 md:h-12 w-64 bg-white/10 rounded-xl mb-4" />
          <div className="h-5 w-full max-w-xl bg-white/5 rounded-lg" />
        </header>

        {/* Featured Article Skeleton (Hero Slot) */}
        <div className="mb-14 border border-white/10 bg-[#141414] rounded-2xl p-8 md:p-12 min-h-[340px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-28 bg-[#8B5CF6]/20 rounded" />
              <div className="h-4 w-16 bg-white/5 rounded" />
            </div>
            <div className="h-8 md:h-10 w-4/5 bg-white/10 rounded-lg mb-4" />
            <div className="space-y-2 max-w-2xl">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/30" />
              <div>
                <div className="h-3.5 w-24 bg-white/10 rounded mb-1" />
                <div className="h-3 w-16 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-4 w-36 bg-[#8B5CF6]/20 rounded" />
          </div>
        </div>

        {/* Secondary Article Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-[#141414] border border-white/10 rounded-xl p-6 min-h-[260px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 w-20 bg-[#8B5CF6]/20 rounded" />
                  <div className="h-3.5 w-12 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-full bg-white/10 rounded-md mb-2" />
                <div className="h-6 w-3/4 bg-white/10 rounded-md mb-4" />
                <div className="space-y-1.5 mb-4">
                  <div className="h-3.5 w-full bg-white/5 rounded" />
                  <div className="h-3.5 w-4/5 bg-white/5 rounded" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="h-3.5 w-20 bg-white/5 rounded" />
                <div className="h-3.5 w-16 bg-[#8B5CF6]/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
