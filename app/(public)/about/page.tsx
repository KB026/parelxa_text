import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Parlexa AI Ecosystem',
  description: 'Learn about Parlexa, the premier marketplace for discovering, comparing, and integrating advanced AI agents and enterprise solutions globally.',
  keywords: 'about Parlexa, AI directory, AI agents, AI solutions, enterprise AI, marketplace',
};

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', background: 'var(--bg-primary)' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', color: 'var(--text-white)' }}>
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(40px, 6vw, 56px)', 
            fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #fff 0%, var(--cyan) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            About Parlexa
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Empowering the next generation of enterprises through autonomous AI integration.
          </p>
        </header>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px', color: 'var(--cyan)' }}>
            Our Mission
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-white)', marginBottom: '16px' }}>
            At Parlexa, we believe that the barrier to entry for robust, enterprise-grade AI should be eliminated. 
            Our mission is to construct the ultimate directory of AI agents—ranging from customer support LLMs to 
            complex vertical data analysis models—and connect builders globally with the businesses that need them.
          </p>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-white)' }}>
            Whether you&apos;re a small startup trying to scale your operations autonomously or a Fortune 500 company 
            transitioning into the generative era, Parlexa provides a vetted, intuitive marketplace to discover 
            exactly what you need.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px', color: 'var(--cyan)' }}>
            Why We Built This
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-white)', marginBottom: '16px' }}>
            The AI landscape is fragmented. Finding reliable, secure, and production-ready AI agents is a daunting 
            task hidden behind endless vendor documentation and generic software lists.
          </p>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-white)' }}>
            We engineered Parlexa&apos;s proprietary AI matching engine to strip away the noise. By structuring 
            capabilities, pricing, and integrations transparently, we streamline the procurement process, helping 
            you architect the perfect software stack in seconds.
          </p>
        </section>

        <section style={{ 
          background: 'var(--bg-elevated)', borderRadius: '24px', padding: '40px', 
          textAlign: 'center', border: '1px solid var(--border-subtle)', marginTop: '80px' 
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Join the Ecosystem
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Ready to explore the marketplace or list your own proprietary agent?
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-primary" style={{ padding: '12px 32px', fontSize: '16px', textDecoration: 'none' }}>
              Explore AI Agents
            </Link>
            <Link href="/vendor/listings/new" style={{ 
              padding: '12px 32px', fontSize: '16px', textDecoration: 'none', 
              background: 'transparent', border: '1px solid var(--border)', 
              color: 'var(--text-white)', borderRadius: '8px', fontWeight: 600 
            }}>
              List Your Tool
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
