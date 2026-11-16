"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ArrowRight, X, ExternalLink, Sparkles } from 'lucide-react';

// Predefined jagged clipping paths to give a hand-torn look
const clipPaths = [
  "polygon(1% 2%, 5% 0%, 9% 1%, 13% 0%, 18% 2%, 22% 0%, 25% 1%, 29% 0%, 34% 1%, 38% 0%, 42% 2%, 47% 0%, 51% 1%, 55% 0%, 58% 2%, 62% 0%, 67% 1%, 71% 0%, 75% 2%, 80% 0%, 84% 1%, 88% 0%, 92% 2%, 96% 0%, 99% 1%, 100% 5%, 98% 9%, 99% 14%, 98% 18%, 100% 23%, 98% 28%, 99% 33%, 98% 38%, 100% 43%, 98% 47%, 99% 52%, 98% 57%, 100% 61%, 98% 66%, 99% 71%, 98% 75%, 100% 80%, 98% 85%, 99% 90%, 98% 95%, 99% 99%, 95% 100%, 91% 98%, 86% 100%, 82% 99%, 78% 100%, 74% 98%, 69% 99%, 65% 100%, 61% 98%, 56% 100%, 52% 99%, 48% 100%, 43% 98%, 39% 99%, 34% 100%, 30% 98%, 26% 99%, 21% 100%, 17% 98%, 13% 99%, 9% 100%, 4% 98%, 1% 99%, 0% 95%, 2% 91%, 0% 86%, 1% 82%, 0% 77%, 2% 73%, 0% 68%, 1% 64%, 0% 59%, 2% 55%, 0% 50%, 1% 45%, 0% 41%, 2% 36%, 0% 32%, 1% 27%, 0% 23%, 2% 18%, 0% 14%, 1% 9%, 0% 5%)",
  "polygon(0% 1%, 4% 2%, 8% 0%, 12% 1%, 17% 0%, 21% 2%, 26% 1%, 31% 0%, 35% 2%, 40% 0%, 44% 1%, 49% 0%, 53% 2%, 58% 1%, 63% 0%, 67% 2%, 72% 0%, 76% 1%, 81% 0%, 85% 2%, 89% 0%, 94% 1%, 98% 0%, 100% 4%, 99% 8%, 100% 13%, 98% 17%, 99% 22%, 100% 27%, 98% 31%, 99% 36%, 100% 40%, 98% 45%, 99% 50%, 100% 54%, 98% 59%, 99% 63%, 100% 68%, 98% 73%, 99% 77%, 100% 82%, 98% 86%, 99% 91%, 100% 96%, 97% 100%, 93% 99%, 88% 100%, 84% 98%, 80% 100%, 75% 99%, 71% 100%, 66% 98%, 62% 99%, 57% 100%, 53% 98%, 48% 100%, 44% 99%, 39% 100%, 35% 98%, 30% 99%, 25% 100%, 21% 98%, 16% 100%, 12% 99%, 7% 100%, 3% 98%, 0% 100%, 1% 95%, 0% 91%, 2% 86%, 1% 82%, 0% 77%, 1% 72%, 0% 68%, 2% 63%, 1% 59%, 0% 54%, 1% 49%, 0% 45%, 2% 40%, 1% 36%, 0% 31%, 1% 26%, 0% 22%, 2% 17%, 1% 13%, 0% 8%)",
  "polygon(2% 0%, 6% 1%, 10% 0%, 15% 2%, 19% 0%, 24% 1%, 28% 0%, 33% 2%, 37% 0%, 42% 1%, 46% 0%, 51% 2%, 55% 1%, 60% 0%, 64% 2%, 69% 0%, 73% 1%, 78% 0%, 82% 2%, 87% 1%, 91% 0%, 96% 2%, 100% 0%, 99% 5%, 100% 9%, 98% 14%, 99% 19%, 100% 23%, 98% 28%, 99% 32%, 100% 37%, 98% 42%, 99% 46%, 100% 51%, 98% 56%, 99% 60%, 100% 65%, 98% 70%, 99% 74%, 100% 79%, 98% 84%, 99% 88%, 100% 93%, 98% 97%, 100% 100%, 95% 99%, 91% 100%, 86% 98%, 82% 99%, 77% 100%, 73% 98%, 68% 100%, 64% 99%, 59% 100%, 54% 98%, 50% 99%, 45% 100%, 41% 98%, 36% 100%, 32% 99%, 27% 100%, 23% 98%, 18% 99%, 14% 100%, 9% 98%, 5% 99%, 1% 100%, 0% 96%, 1% 91%, 0% 86%, 2% 82%, 0% 77%, 1% 72%, 0% 68%, 2% 63%, 0% 58%, 1% 54%, 0% 49%, 2% 44%, 0% 40%, 1% 35%, 0% 30%, 2% 26%, 0% 21%, 1% 16%, 0% 12%, 2% 7%)"
];

// Rotations corresponding to index
const rotations = ["md:-rotate-[1deg]", "md:rotate-[0.5deg]", "md:-rotate-[0.5deg]"];

export interface BlogItem {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
}

const DEFAULT_FALLBACK_BLOGS: BlogItem[] = [
  {
    id: 1,
    slug: "rise-of-ai-agents-2026",
    title: "The Rise of AI Agents in Enterprise Ecosystems (2026)",
    excerpt: "Ask most working professionals what they believe the most transformative software addition to their tech stack will be, and they will say: \"Autonomous Agents.\"",
    content: "Ask most working professionals what they believe the most transformative software addition to their tech stack will be, and they will say: \"Autonomous Agents.\" But misunderstanding how these agents deploy will severely handicap modern enterprise scalability. \n\nWe are shifting from generative AI that simply writes emails or drafts code, to Agentic AI that can take actions. Future ecosystems will consist of interconnected agents handling distinct vertical pipelines—from supply chain procurement to customer success routing.\n\nThis transformation is already happening across the industry. Standard models lack the compliance and specific taxonomy required for enterprise-grade solutions. With vertical alignment, companies bypass generic hurdles and immediately leverage determinism.",
    date: "20 APRIL 2026"
  },
  {
    id: 2,
    slug: "parlexa-marketplace-vendor-guide",
    title: "Navigating the Parlexa Marketplace: A Complete Vendor Guide",
    excerpt: "Listing your product effectively has always been described as a friction point. Today, when businesses have more tools than ever, positioning your AI solution correctly is paramount.",
    content: "Listing your product effectively has always been described as a friction point. Today, when businesses have more tools than ever, positioning your AI solution correctly is paramount. Follow our step-by-step metadata and SEO guide. \n\nParlexa acts as the central hub. By establishing strong categories, utilizing rich descriptions, and allowing our AI-matching engine to map your tool to enterprise needs, vendors can experience a 300% increase in qualified leads.",
    date: "12 APRIL 2026"
  },
  {
    id: 3,
    slug: "vertical-ai-vs-general-models",
    title: "Why Vertical AI Solutions Outperform General Models",
    excerpt: "A custom LLM stack is one of the most important infrastructural shifts your company will ever make. Yet most enterprises either put it off for years or assume generalist models can handle it...",
    content: "A custom LLM stack is one of the most important infrastructural shifts your company will ever make. Yet most enterprises either put it off for years or assume generalist models can handle robust, industry-specific taxonomy workloads effortlessly. \n\nGeneralists like standard GPT-4 are excellent communicators but often hallucinate complex niche logic (e.g. medical compliance, legal discovery). Vertical AI, trained exactly on proprietary datasets, guarantees safety, deterministic logic, and enterprise compliance.",
    date: "28 MARCH 2026"
  }
];

export function BlogSection({ initialBlogs }: { initialBlogs?: any[] }) {
  const [blogs, setBlogs] = useState<BlogItem[]>(() => {
    if (Array.isArray(initialBlogs) && initialBlogs.length > 0) {
      return initialBlogs.slice(0, 3).map((b, idx) => ({
        id: b.id || b.slug || idx + 1,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt || '',
        content: b.content || b.body || b.excerpt || '',
        date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : (b.date || 'LATEST')
      }));
    }
    return DEFAULT_FALLBACK_BLOGS;
  });

  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  // If initialBlogs wasn't provided at server render, dynamically fetch latest published posts on client
  useEffect(() => {
    if (!initialBlogs || initialBlogs.length === 0) {
      fetch('/api/admin/blog-review/list')
        .catch(() => null);
    }
  }, [initialBlogs]);

  // Helper to split content into paragraphs for the enlarged modal
  const renderArticleBody = (content: string, excerpt: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const firstParagraph = paragraphs[0] || excerpt;
    const rest = paragraphs.slice(1);
    
    return (
      <>
        <p className="mb-6 text-justify">
          <span className="float-left text-6xl md:text-7xl font-bold leading-[0.8] pr-3 pt-2 font-serif text-black">
            {firstParagraph.charAt(0)}
          </span>
          {firstParagraph.substring(1)}
        </p>
        
        {/* Pull quote inserted automatically */}
        {rest.length > 0 && excerpt && (
          <div className="my-8 border-t-[3px] border-b-[3px] border-black py-5 font-serif italic text-xl md:text-2xl font-semibold leading-snug text-black text-center break-inside-avoid">
            "{excerpt}"
          </div>
        )}
        
        {rest.map((p, i) => (
          <p key={i} className="mb-6 text-justify">
            {p.replace(/^#+\s+/g, '')}
          </p>
        ))}
      </>
    );
  };

  return (
    <section id="blog" className="max-w-7xl mx-auto py-24 px-5 text-center">
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 border border-brand-violet/40 bg-brand-violet/10 px-3 py-1 rounded-full mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-violet animate-pulse"></span>
          <span className="text-brand-violet text-[10px] md:text-xs font-semibold tracking-widest uppercase">
            PARLEXA INSIGHTS &amp; EDITORIAL
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-[#EDEDED] tracking-tight">
          Latest News From Us
        </h2>
        <p className="text-sm md:text-base text-[#94A3B8] max-w-xl mx-auto mt-3">
          Real-time enterprise architectural patterns, benchmarks, and honest developer critiques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 text-left">
        {blogs.map((blog, idx) => (
          <div key={blog.id} className="relative group perspective-[1000px] h-full">
            <article 
              className={`relative flex flex-col h-full bg-[#E4E0D4] overflow-hidden hover:-translate-y-2 transition-all duration-300 cursor-pointer shadow-[0_15px_40px_rgba(0,0,0,0.6)] group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.8)] ${rotations[idx % 3]}`}
              style={{ clipPath: clipPaths[idx % 3] }}
              onClick={() => setSelectedBlog(blog)}
            >
              {/* Paper grain noise texture */}
              <div 
                className="absolute inset-0 opacity-[0.06] mix-blend-multiply pointer-events-none z-0" 
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
              ></div>

              {/* Ghost newsprint text fragments bleeding in from edges */}
              <div 
                className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" 
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='20' font-family='serif' font-size='10' font-weight='bold' fill='black'%3ELOREM IPSUM DOLOR SIT AMET%3C/text%3E%3Ctext x='15' y='50' font-family='serif' font-size='12' fill='black'%3ECONSECUTUR ADIPISCING%3C/text%3E%3Ctext x='5' y='100' font-family='serif' font-size='8' fill='black'%3EPRINTED IN THE TIMES%3C/text%3E%3Ctext x='40' y='150' font-family='serif' font-size='14' fill='black'%3ENEWS & EVENTS%3C/text%3E%3Ctext x='20' y='200' font-family='serif' font-size='10' fill='black'%3EDAILY PUBLICATION%3C/text%3E%3Ctext x='10' y='250' font-family='serif' font-size='12' fill='black'%3EWEATHER AND STOCKS%3C/text%3E%3C/svg%3E")`,
                  backgroundSize: '150px 150px',
                  maskImage: 'radial-gradient(ellipse at center, transparent 30%, black 100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 30%, black 100%)'
                }}
              ></div>

              {/* Faint fold line (crease) */}
              <div className="absolute top-0 bottom-0 left-1/3 w-[2px] bg-gradient-to-r from-transparent via-black/[0.03] to-transparent pointer-events-none z-0"></div>
              
              {/* Subtle inner lightening for text legibility */}
              <div className="absolute inset-4 bg-white/20 blur-xl pointer-events-none z-0 rounded-full"></div>

              <div className="p-8 pb-4 flex-1 flex flex-col relative z-10">
                <h3 
                  className="text-xl md:text-2xl font-bold text-[#1A1A1A] mt-2 leading-[1.1] group-hover:text-brand-violet-dark transition-colors line-clamp-3"
                  style={{ fontFamily: '"Playfair Display", "PT Serif", "Libre Caslon Text", serif' }}
                >
                  {blog.title}
                </h3>
                <p 
                  className="text-[#333333] leading-relaxed line-clamp-3 mt-4 flex-1 text-sm md:text-base font-medium"
                  style={{ fontFamily: '"PT Serif", "Georgia", serif' }}
                >
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between mt-6">
                  <button 
                    className="text-brand-violet font-serif font-bold text-sm bg-transparent border-none p-0 text-left cursor-pointer inline-flex items-center gap-2 underline decoration-brand-violet/30 underline-offset-4 hover:decoration-brand-violet/70 transition-all"
                  >
                    Read Clipping <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  {blog.slug && (
                    <Link
                      href={`/blog/${blog.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-[#64748B] hover:text-brand-violet flex items-center gap-1 font-mono transition-colors"
                      title="Open full article page"
                    >
                      <span>Full Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="relative z-10 mx-8 mt-2 mb-6">
                <div className="border-t border-black/20 pt-3 text-black/60 text-[10px] font-bold uppercase tracking-[0.2em] font-serif">
                  {blog.date}
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 bg-brand-violet hover:bg-brand-violet-dark text-white font-medium rounded-xl px-7 py-3 transition-all shadow-lg hover:shadow-brand-violet/20"
        >
          <span>View All 2026 Blog Posts</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Newspaper Clipping Modal */}
      {selectedBlog && typeof document !== 'undefined' && createPortal(
        (
          <div 
            className="fixed inset-0 z-[9999] flex justify-center p-4 md:p-12 overflow-y-auto"
            onClick={() => setSelectedBlog(null)}
          >
            {/* Dark background backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
            
            {/* Clipping Container */}
            <div 
              className="relative w-full max-w-4xl my-auto animate-in fade-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Paper Element */}
              <article 
                className="relative bg-[#F4F1EA] text-[#1a1a1a] w-full shadow-[0_30px_60px_rgba(0,0,0,0.7)] rotate-[-0.5deg] mx-auto overflow-hidden"
              >
                {/* Torn Top Edge */}
                <div className="absolute top-0 left-0 w-full h-4 -mt-[1px] text-[#F4F1EA] z-20">
                  <svg preserveAspectRatio="none" viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor"><polygon points="0,100 0,0 2,15 4,0 6,10 8,0 10,20 12,0 14,10 16,0 18,15 20,0 22,10 24,0 26,20 28,0 30,10 32,0 34,15 36,0 38,10 40,0 42,20 44,0 46,10 48,0 50,15 52,0 54,10 56,0 58,20 60,0 62,10 64,0 66,15 68,0 70,10 72,0 74,20 76,0 78,10 80,0 82,15 84,0 86,10 88,0 90,20 92,0 94,10 96,0 98,15 100,0 100,100" /></svg>
                </div>
                
                {/* Paper Textures */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-multiply z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.15)] z-10"></div>
                {/* Horizontal print lines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #000 27px, #000 28px)', backgroundSize: '100% 28px' }}></div>

                <div className="p-8 md:p-14 relative z-20">
                  <button 
                    onClick={() => setSelectedBlog(null)} 
                    className="absolute top-6 right-6 text-black/40 hover:text-black/80 transition-colors cursor-pointer p-2"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <header className="mb-8">
                    <div className="inline-block border border-brand-violet/80 px-2 py-0.5 mb-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-brand-violet">
                      TECHNOLOGY &middot; MARKETPLACE
                    </div>
                    
                    <h1 
                      className="font-serif text-3xl md:text-5xl font-extrabold text-black leading-[1.08] tracking-tight mb-6" 
                      style={{ fontFamily: '"Playfair Display", "PT Serif", "Libre Caslon Text", serif' }}
                    >
                      {selectedBlog.title}
                    </h1>

                    <div className="border-t-[1.5px] border-b-[1.5px] border-black/80 py-2 flex items-center justify-between text-xs md:text-sm font-bold uppercase tracking-widest text-black/90">
                      <span>By Parlexa Editorial</span>
                      <span>{selectedBlog.date}</span>
                    </div>
                  </header>

                  <div 
                    className="font-serif text-base md:text-lg leading-[28px] text-black/90 columns-1 md:columns-2 gap-10" 
                    style={{ fontFamily: '"PT Serif", "Source Serif 4", "Georgia", serif' }}
                  >
                    {renderArticleBody(selectedBlog.content, selectedBlog.excerpt)}
                  </div>
                  
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-black/30 pt-6 gap-4">
                    <span className="font-serif italic text-sm text-black/60">
                      Published on Parlexa Research &amp; Editorial
                    </span>
                    {selectedBlog.slug && (
                      <Link 
                        href={`/blog/${selectedBlog.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-[#F4F1EA] hover:bg-black/80 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all"
                      >
                        <span>Read Full Guide on Parlexa Blog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Torn Bottom Edge */}
                <div className="absolute bottom-0 left-0 w-full h-4 -mb-[1px] text-[#F4F1EA] rotate-180 z-20">
                  <svg preserveAspectRatio="none" viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor"><polygon points="0,100 0,0 2,15 4,0 6,10 8,0 10,20 12,0 14,10 16,0 18,15 20,0 22,10 24,0 26,20 28,0 30,10 32,0 34,15 36,0 38,10 40,0 42,20 44,0 46,10 48,0 50,15 52,0 54,10 56,0 58,20 60,0 62,10 64,0 66,15 68,0 70,10 72,0 74,20 76,0 78,10 80,0 82,15 84,0 86,10 88,0 90,20 92,0 94,10 96,0 98,15 100,0 100,100" /></svg>
                </div>
              </article>
            </div>
          </div>
        ),
        document.body
      )}
    </section>
  );
}
