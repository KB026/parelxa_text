"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';

export function BlogSection() {
  const blogs = [
    {
      id: 1,
      title: "The Rise of AI Agents in Enterprise Ecosystems (2026)",
      excerpt: "Ask most working professionals what they believe the most transformative software addition to their tech stack will be, and they will say: \"Autonomous Agents.\"",
      content: "Ask most working professionals what they believe the most transformative software addition to their tech stack will be, and they will say: \"Autonomous Agents.\" But misunderstanding how these agents deploy will severely handicap modern enterprise scalability. \n\nWe are shifting from generative AI that simply writes emails or drafts code, to Agentic AI that can take actions. Future ecosystems will consist of interconnected agents handling distinct vertical pipelines—from supply chain procurement to customer success routing.",
      date: "20 APRIL 2026"
    },
    {
      id: 2,
      title: "Navigating the Parlexa Marketplace: A Complete Vendor Guide",
      excerpt: "Listing your product effectively has always been described as a friction point. Today, when businesses have more tools than ever, positioning your AI solution correctly is paramount.",
      content: "Listing your product effectively has always been described as a friction point. Today, when businesses have more tools than ever, positioning your AI solution correctly is paramount. Follow our step-by-step metadata and SEO guide. \n\nParlexa acts as the central hub. By establishing strong categories, utilizing rich descriptions, and allowing our AI-matching engine to map your tool to enterprise needs, vendors can experience a 300% increase in qualified leads.",
      date: "12 APRIL 2026"
    },
    {
      id: 3,
      title: "Why Vertical AI Solutions Outperform General Models",
      excerpt: "A custom LLM stack is one of the most important infrastructural shifts your company will ever make. Yet most enterprises either put it off for years or assume generalist models can handle it...",
      content: "A custom LLM stack is one of the most important infrastructural shifts your company will ever make. Yet most enterprises either put it off for years or assume generalist models can handle robust, industry-specific taxonomy workloads effortlessly. \n\nGeneralists like standard GPT-4 are excellent communicators but often hallucinate complex niche logic (e.g. medical compliance, legal discovery). Vertical AI, trained exactly on proprietary datasets, guarantees safety, deterministic logic, and enterprise compliance.",
      date: "28 MARCH 2026"
    }
  ];

  const [selectedBlog, setSelectedBlog] = useState<{title: string, content: string, date: string} | null>(null);

  return (
    <section className="section" id="blog" style={{ padding: '80px 20px', maxWidth: '1320px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '48px' }}>
        <span style={{ 
          color: 'var(--gold)', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', 
          textTransform: 'uppercase', marginBottom: '16px', display: 'block' 
        }}>
          Blogs
        </span>
        <h2 style={{ 
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(32px, 5vw, 42px)', 
          fontWeight: 700, color: 'var(--text-white)' 
        }}>
          Latest News From Us
        </h2>
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '24px', marginBottom: '48px', textAlign: 'left' 
      }}>
        {blogs.map((blog) => (
          <article key={blog.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '16px', display: 'flex', flexDirection: 'column', 
            transition: 'transform 0.2s, borderColor 0.2s, boxShadow 0.2s', cursor: 'pointer',
            padding: '0'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 158, 11, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ padding: '32px 32px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ 
                fontSize: '20px', fontWeight: 700, color: 'var(--text-white)', 
                marginBottom: '16px', lineHeight: '1.4' 
              }}>
                {blog.title}
              </h3>
              <p style={{ 
                color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', 
                marginBottom: '24px', flex: 1
              }}>
                {blog.excerpt}
              </p>
              <button 
                onClick={() => setSelectedBlog(blog)}
                style={{ 
                  color: 'var(--cyan)', fontSize: '14px', fontWeight: 700, background: 'transparent',
                  border: 'none', padding: 0, textAlign: 'left',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' 
              }}>
                Read More <span>→</span>
              </button>
            </div>
            
            <div style={{ 
              borderTop: '1px solid var(--border-subtle)', padding: '16px 32px', 
              color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' 
            }}>
              {blog.date}
            </div>
          </article>
        ))}
      </div>

      <button style={{
        background: 'var(--bg-elevated)', color: 'var(--text-white)', padding: '14px 40px',
        border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
        letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
      >
        View All Posts
      </button>

      {/* Blog Enlarge Modal */}
      {selectedBlog && typeof document !== 'undefined' && createPortal(
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedBlog(null)}
        >
          <div 
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '24px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '40px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedBlog(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-white)', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>Ã—</button>
            
            <span style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>
              Parlexa Editorials
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-white)', marginBottom: '12px', lineHeight: '1.3' }}>{selectedBlog.title}</h2>
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border-subtle)' }}>
              {selectedBlog.date}
            </div>
            
            <div style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {selectedBlog.content}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
