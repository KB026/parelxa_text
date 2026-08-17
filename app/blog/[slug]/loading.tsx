import React from 'react';

export default function BlogPostLoading() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] pb-24 overflow-x-hidden animate-pulse">
      {/* Top Navigation Skeleton */}
      <div className="border-b border-white/[0.08] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="h-4 w-36 bg-white/10 rounded" />
          <div className="h-6 w-28 bg-[#8B5CF6]/20 rounded-full" />
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 pt-10 md:pt-14">
        {/* Header & Title Skeleton */}
        <header className="mb-10 pb-8 border-b border-white/10">
          <div className="h-10 sm:h-12 w-full bg-white/10 rounded-xl mb-3" />
          <div className="h-10 sm:h-12 w-4/5 bg-white/10 rounded-xl mb-6" />

          {/* Subtitle Skeleton */}
          <div className="h-5 w-3/4 bg-white/5 rounded mb-8 border-l-2 border-[#8B5CF6] pl-4" />

          {/* Byline / Trust Signal Box Skeleton */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-white/10 rounded" />
                <div className="h-3 w-36 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-4 w-20 bg-white/5 rounded" />
          </div>
        </header>

        {/* Article Body Skeleton */}
        <div className="space-y-6">
          {/* Paragraph 1 */}
          <div className="space-y-2.5">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-11/12 bg-white/5 rounded" />
            <div className="h-4 w-4/5 bg-white/5 rounded" />
          </div>

          {/* Section Heading 1 */}
          <div className="pt-6">
            <div className="h-7 w-64 bg-white/10 rounded-lg mb-4" />
          </div>

          {/* Paragraph 2 */}
          <div className="space-y-2.5">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-white/5 rounded" />
          </div>

          {/* Callout / Quote Box Skeleton */}
          <div className="my-6 p-5 rounded-xl border border-white/10 bg-[#141414] space-y-2">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-2/3 bg-white/5 rounded" />
          </div>

          {/* Section Heading 2 */}
          <div className="pt-6">
            <div className="h-7 w-56 bg-white/10 rounded-lg mb-4" />
          </div>

          {/* Paragraph 3 */}
          <div className="space-y-2.5">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-3/4 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
