import { getCategories, getFeaturedAgents } from "@/lib/api";
import { getTrendingAgents, getNewArrivals, refreshTrendingScores } from "@/lib/analytics";
import { Agent, Category } from "@/lib/types";
import { Metadata } from "next";
import Link from 'next/link';
import { Flame, Sparkles, ArrowRight } from 'lucide-react';
import { AgentCard } from "@/components/parlexa/AgentCard";
import { AIFinderCTA } from "@/components/parlexa/AIFinderCTA";
import { RealStories } from "@/components/parlexa/RealStories";
import { AINewsTicker } from "@/components/parlexa/AINewsTicker";
import { BlogSection } from "@/components/parlexa/BlogSection";
import { UniversalAISearch } from "@/components/parlexa/UniversalAISearch";
import { FAQSection } from "@/components/parlexa/FAQSection";
import { DynamicBackground } from "@/components/parlexa/DynamicBackground";
import { ScrollReveal } from "@/components/parlexa/ScrollReveal";
import HowItWorks from "@/components/parlexa/HowItWorks";
import { TrendingSection } from "@/components/parlexa/TrendingSection";
export const metadata: Metadata = {
  title: "The Global AI Agent Marketplace | Discover Enterprise AI Tools Worldwide | Parlexa",
  description: "The global premier marketplace for AI agents and tools. Discover, compare, and integrate powerful AI solutions built to scale enterprises worldwide.",
  alternates: {
    canonical: '/',
  },
};

export default async function PublicHomePage() {
  // Refresh scores on homepage load (on-demand revalidation)
  try {
     await refreshTrendingScores();
  } catch (e) {
     console.error('Failed to refresh trending scores:', e);
  }

  // Fetch dynamic data
  let featuredAgents: Agent[] = [];
  let categories: Category[] = [];
  let trendingAgents: Agent[] = [];
  let newArrivals: Agent[] = [];
  
  try {
    const [f, c, t, n] = await Promise.all([
      getFeaturedAgents(), 
      getCategories(),
      getTrendingAgents(8),
      getNewArrivals(8)
    ]);
    featuredAgents = f;
    categories = c;
    trendingAgents = t as unknown as Agent[];
    newArrivals = n as unknown as Agent[];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
      throw err;
    }
    console.error('Homepage: DB fetch failed:', err);
  }

  // Filter New Arrivals to be unique from Trending
  const trendingIds = new Set((trendingAgents || []).map(a => a.id));
  const uniqueNewArrivals = (newArrivals || []).filter(a => !trendingIds.has(a.id));

  return (
    <div className="home-container bg-[#0A0A0A] min-h-screen">
      {/* Hero Section Container */}
      <div className="w-full pb-32 bg-gradient-to-b from-[#09090B] to-[#12121a]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' }}>
        <section className="relative overflow-hidden w-full min-h-[90vh] pt-[120px] pb-20 flex flex-col items-center text-center">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-blue/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
            <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] bg-brand-fuchsia/15 rounded-full blur-[150px] mix-blend-screen"></div>
          </div>
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center text-[11.5vw] md:text-[12.5vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/[0.08] to-white/[0.01] select-none pointer-events-none z-0">MARKETPLACE</div>
          <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards mt-6">
            
            <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 mt-8 mb-6 rounded-full border border-white/[0.12] bg-white/[0.02] backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-violet opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-violet"></span>
              </span>
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.2em] select-none">Global AI Ecosystem</span>
            </div>
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl leading-[1.05] font-medium tracking-tight mt-6 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              Enterprise AI Agents. <br className="hidden sm:block" /> 
              <span className="bg-gradient-to-r from-white to-gray-500 text-transparent bg-clip-text">Built for scale.</span>
            </h1>
          <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-[670px] mt-5 md:mt-6 px-2">Discover and deploy AI agents ready for your workforce. The only marketplace you can trust.</p>
          

          <div className="w-full relative z-30 hover:scale-[1.02] transition-transform duration-500">
            <UniversalAISearch />
          </div>
          
          {/* The "Trusted By" Section */}
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mt-16 mb-6">Integrating with the world's best models</p>
          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 md:gap-10 lg:gap-16 grayscale select-none text-gray-500">
            <span className="text-base sm:text-lg md:text-2xl font-bold tracking-tighter hover:text-white transition-colors duration-300 cursor-default">OpenAI</span>
            <span className="text-base sm:text-lg md:text-2xl font-serif italic tracking-tight hover:text-white transition-colors duration-300 cursor-default">Anthropic</span>
            <span className="text-base sm:text-lg md:text-2xl font-black tracking-widest hover:text-white transition-colors duration-300 cursor-default">META</span>
            <span className="text-base sm:text-lg md:text-2xl font-semibold tracking-tight hover:text-white transition-colors duration-300 cursor-default">Google</span>
          </div>
        </div>
        </section>
      </div>

      {/* How It Works */}
      <HowItWorks />

      {/* Featured Tools */}
      {featuredAgents.length > 0 && (
        <section className="bg-[#0A0A0A] py-24">
          <ScrollReveal>
            <div className="max-w-7xl mx-auto px-5 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 md:mb-12 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#EDEDED] mb-3 md:mb-4 tracking-tight flex items-center gap-3">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-500 shrink-0" />
                    <span>Featured on Parlexa</span>
                  </h2>
                  <p className="text-sm md:text-lg text-[#A1A1AA] leading-relaxed max-w-2xl">
                    Premium AI solutions and enterprise-ready agents selected for world-class performance.
                  </p>
                </div>
                <Link href="/directory" className="inline-flex items-center gap-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white font-medium rounded-lg px-4 py-2 transition-all self-start sm:self-auto shrink-0 text-sm">
                  <span>View All Featured</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredAgents.slice(0, 12).map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Category Ticker */}
      <section className="bg-[#111111] border-y border-white/[0.08] py-5 overflow-hidden">
        <div className="category-ticker-container">
          <div className="category-ticker-track">
            {categories.concat(categories).concat(categories).map((cat, i) => (
              <Link key={i} href={`/directory?category=${encodeURIComponent(cat.name)}`} className="text-[#A1A1AA] hover:text-[#EDEDED] text-sm font-medium transition-colors mx-6">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Tools */}
      {trendingAgents.length > 0 && (
        <TrendingSection trendingAgents={trendingAgents} />
      )}

      {/* Real Stories Use Cases */}
      <section className="bg-[#111111]">
        <ScrollReveal>
          <RealStories />
        </ScrollReveal>
      </section>

      {/* Finder CTA */}
      <section className="bg-[#0A0A0A]">
        <ScrollReveal>
          <AIFinderCTA />
        </ScrollReveal>
      </section>

      {/* New Arrivals */}
      {uniqueNewArrivals.length > 0 && (
        <section className="bg-[#111111] py-24">
          <ScrollReveal>
            <div className="max-w-7xl mx-auto px-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 md:mb-12 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-[#EDEDED] mb-3 tracking-tight flex items-center gap-3">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-500 shrink-0" />
                    <span>Just Added</span>
                  </h2>
                  <p className="text-[#A1A1AA] leading-relaxed text-sm md:text-lg">Fresh AI tools added to the marketplace in the last 48 hours</p>
                </div>
                <Link href="/directory" className="inline-flex items-center gap-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white font-medium rounded-lg px-4 py-2 transition-all self-start sm:self-auto shrink-0 text-sm">
                  <span>View All New</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {uniqueNewArrivals.slice(0, 12).map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Live AI News Ticker */}
      <AINewsTicker />
      
      {/* FAQ Section */}
      <section className="bg-[#0A0A0A]">
        <ScrollReveal>
          <FAQSection />
        </ScrollReveal>
      </section>

      {/* Editorial Blogs */}
      <section className="bg-[#111111]">
        <ScrollReveal>
          <BlogSection />
        </ScrollReveal>
      </section>
    </div>
  );
}
