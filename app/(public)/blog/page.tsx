import React from 'react';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog';
import { Metadata } from 'next';
import { Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'The Parlexa Blog | Enterprise AI Insights & Agent Architecture',
  description: 'Deep dives, analysis, and architectural guides on enterprise AI agents, voice intelligence, sovereign LLMs, and digital workforce scale.',
  alternates: {
    canonical: 'https://parlexa.in/blog',
  },
};

export default function BlogIndex() {
  const featuredPost = BLOG_POSTS.find(post => post.featured) || BLOG_POSTS[0];
  const secondaryPosts = BLOG_POSTS.filter(post => post.slug !== featuredPost.slug);

  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-[#8B5CF6]/30 selection:text-white py-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header --- */}
        <header className="mb-14 border-b border-white/[0.08] pb-10">
          <div className="inline-block border border-[#8B5CF6]/80 px-2.5 py-1 mb-4 font-mono text-xs uppercase tracking-[0.2em] font-bold text-[#A78BFA] bg-[#8B5CF6]/10 rounded">
            PARLEXA INSIGHTS & EDITORIAL
          </div>
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-serif" style={{ fontFamily: '"Playfair Display", "PT Serif", Georgia, serif' }}>
            The Parlexa Blog
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed max-w-2xl">
            In-depth guides, enterprise architectural patterns, and benchmarks on autonomous AI agents, multi-tenant directory systems, and sovereign intelligent tools.
          </p>
        </header>

        {/* --- Featured Article (Hero Slot) --- */}
        {featuredPost && (
          <div className="mb-14 group">
            <Link 
              href={`/blog/${featuredPost.slug}`} 
              className="block border border-white/10 bg-[#141414] hover:bg-[#18181B] hover:border-[#8B5CF6]/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl"
            >
              <div className="p-8 md:p-12 flex flex-col justify-between min-h-[340px] relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#A78BFA] text-xs font-bold uppercase tracking-widest font-mono bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 px-2.5 py-0.5 rounded">
                      Featured Guide
                    </span>
                    <span className="text-[#71717A] text-xs font-mono">
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 
                    className="text-[#EDEDED] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight group-hover:text-[#A78BFA] transition-colors max-w-3xl mb-4 font-serif"
                    style={{ fontFamily: '"Playfair Display", "PT Serif", Georgia, serif' }}
                  >
                    {featuredPost.title}
                  </h2>

                  <p className="text-[#A1A1AA] leading-relaxed max-w-2xl text-base md:text-lg mb-6">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold">
                      {featuredPost.author.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[#EDEDED] text-xs font-semibold block">{featuredPost.author.name}</span>
                      <span className="text-[#71717A] text-[11px] font-mono">{featuredPost.publishedAt}</span>
                    </div>
                  </div>

                  <span className="text-[#A78BFA] text-sm font-semibold group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
                    Read Complete Guide <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* --- Secondary Article Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secondaryPosts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`} 
              className="group bg-[#141414] border border-white/10 rounded-xl p-6 hover:bg-[#18181B] hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[260px]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#8B5CF6] text-xs uppercase tracking-widest font-mono font-semibold">
                    {post.category}
                  </span>
                  <span className="text-[#71717A] text-xs font-mono">
                    {post.readTime}
                  </span>
                </div>

                <h3 
                  className="text-[#EDEDED] text-lg font-bold tracking-tight mb-3 group-hover:text-[#A78BFA] transition-colors font-serif leading-snug"
                  style={{ fontFamily: '"Playfair Display", "PT Serif", Georgia, serif' }}
                >
                  {post.title}
                </h3>

                <p className="text-[#A1A1AA] text-xs md:text-sm leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[#71717A] text-xs font-mono">{post.publishedAt}</span>
                <span className="text-[#EDEDED] text-xs font-semibold group-hover:text-[#A78BFA] inline-flex items-center gap-1">
                  Read post →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* --- Directory Banner --- */}
        <div className="mt-16 bg-gradient-to-r from-[#141414] via-[#1A1A1E] to-[#141414] border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2 font-serif">Explore the Parlexa AI Directory</h3>
          <p className="text-sm text-[#A1A1AA] mb-6 max-w-lg mx-auto">
            Discover 100+ verified enterprise AI agents, voice intelligence platforms, and domain-adapted LLMs.
          </p>
          <Link
            href="/directory"
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            View Directory
          </Link>
        </div>

      </div>
    </main>
  );
}
