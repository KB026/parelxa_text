import { getCategories, getFeaturedAgents } from "@/lib/api";
import { getTrendingAgents, getNewArrivals, refreshTrendingScores } from "@/lib/analytics";
import { Agent, Category } from "@/lib/types";
import { Metadata } from "next";
import Link from 'next/link';
import { AgentCard } from "@/components/parlexa/AgentCard";
import { AIFinderCTA } from "@/components/parlexa/AIFinderCTA";
import { RealStories } from "@/components/parlexa/RealStories";
import { AINewsTicker } from "@/components/parlexa/AINewsTicker";
import { BlogSection } from "@/components/parlexa/BlogSection";
import { UniversalAISearch } from "@/components/parlexa/UniversalAISearch";

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
  } catch (err) {
    console.error('Homepage: DB fetch failed:', err);
  }

  // Filter New Arrivals to be unique from Trending
  const trendingIds = new Set((trendingAgents || []).map(a => a.id));
  const uniqueNewArrivals = (newArrivals || []).filter(a => !trendingIds.has(a.id));

  return (
    <div className="home-container" style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="hero" style={{ 
        padding: '160px 20px 140px', 
        textAlign: 'center', 
        background: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.1), transparent 70%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '6px 16px', 
            background: 'rgba(14, 165, 233, 0.1)', 
            border: '1px solid rgba(14, 165, 233, 0.2)', 
            borderRadius: '20px', 
            color: 'var(--cyan)', 
            fontSize: '13px', 
            fontWeight: 600, 
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Global AI Ecosystem
          </div>
          <h1 style={{ 
            fontSize: 'clamp(40px, 8vw, 72px)', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            marginBottom: '24px',
            background: 'linear-gradient(to bottom right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Discover AI Agents & Tools <br /> for Enterprises Worldwide
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto 60px', lineHeight: 1.6 }}>
            The ultimate marketplace of AI agents built to scale businesses globally.
          </p>
          
          <UniversalAISearch />
          
          <div style={{ maxWidth: '600px', margin: '40px auto 0', display: 'flex', gap: '24px', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
             <span>🔥 <strong>Trending:</strong> <Link href="/products?cats=AI+%26+LLMs" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>AI Agents</Link>, <Link href="/products?cats=Marketing+%26+Sales" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Marketing Bots</Link></span>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      {featuredAgents.length > 0 && (
        <section style={{ 
          position: 'relative', overflow: 'hidden', padding: '100px 0'
        }}>
          {/* Subtle Glow Background */}
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(251, 146, 60, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0
          }} />
          
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.03em' }}>
                  ✨ <span style={{ background: 'linear-gradient(135deg, #fff 0%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Featured on Parlexa</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px' }}>
                  Premium AI solutions and enterprise-ready agents selected for world-class performance.
                </p>
              </div>
              <Link href="/products" style={{ 
                color: '#fb923c', fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                padding: '10px 20px', background: 'rgba(251, 146, 60, 0.1)', borderRadius: '12px', border: '1px solid rgba(251, 146, 60, 0.2)'
              }}>
                View Marketplace →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {featuredAgents.slice(0, 3).map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Ticker */}
      <section style={{ 
        borderTop: '1px solid var(--border-subtle)', 
        borderBottom: '1px solid var(--border-subtle)', 
        background: 'rgba(255,255,255,0.02)', 
        overflow: 'hidden',
        padding: '20px 0'
      }}>
        <div className="category-ticker-container">
          <div className="category-ticker-track">
            {categories.concat(categories).concat(categories).map((cat, i) => (
              <Link key={i} href={`/products?cats=${cat.name}`} style={{ color: 'var(--text-dim)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Tools */}
      {trendingAgents.length > 0 && (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 20px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: '#fb923c' }}>🔥 Trending Now</h2>
            <p style={{ color: 'var(--text-dim)' }}>Most visited and popular AI solutions this week</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {trendingAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {/* Real Stories Use Cases */}
      <RealStories />

      {/* Finder CTA */}
      <section className="home-cta-section" style={{ maxWidth: '1280px', margin: '40px auto' }}>
        <div className="home-cta-box" style={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))', 
          backdropFilter: 'blur(20px)',
          textAlign: 'center', 
          border: '1px solid rgba(56, 189, 248, 0.2)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(56, 189, 248, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Background Glow */}
          <div style={{
            position: 'absolute', top: '-10%', left: '-10%',
            width: '120%', height: '120%',
            background: 'radial-gradient(circle at 70% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none', zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ 
              width: '120px', height: '120px', margin: '0 auto 32px',
              borderRadius: '30px', background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.2)',
              animation: 'float 6s ease-in-out infinite'
            }}>
              <img 
                src="/images/ai_matches.png" 
                alt="AI Magic" 
                style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))' }}
              />
            </div>
            
            <h2 className="home-cta-title" style={{ 
              fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #fff 0%, var(--cyan) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Can&apos;t find the right tool?
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.6 }}>
              Our AI discovery assistant analyzes your requirements to surface the optimal software stack for your business.
            </p>
            
            <AIFinderCTA />
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes float {
              0% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-15px) rotate(3deg); }
              100% { transform: translateY(0px) rotate(0deg); }
            }
          `}} />
        </div>
      </section>

      {/* New Arrivals */}
      {uniqueNewArrivals.length > 0 && (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 20px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--cyan)' }}>✨ Just Added</h2>
            <p style={{ color: 'var(--text-dim)' }}>Fresh AI tools added to the marketplace in the last 48 hours</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {uniqueNewArrivals.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {/* Live AI News Ticker */}
      <AINewsTicker />
      
      {/* Editorial Blogs */}
      <BlogSection />
    </div>
  );
}
