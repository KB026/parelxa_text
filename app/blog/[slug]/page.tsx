import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // In a real app, you would fetch blog post metadata by slug from your CMS or DB.
  return {
    title: `Blog Post: ${params.slug} | Parlexa`,
    description: `Read more about ${params.slug} on Parlexa.`,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // Mock data for the basic template since this is a placeholder to avoid 404s
  const title = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 40px 80px', minHeight: '100vh' }}>
      <Link href="/" style={{ 
        marginBottom: '40px', display: 'inline-flex', alignItems: 'center', 
        gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' 
      }}>
        ← Back to Home
      </Link>
      
      <article>
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: 'var(--cyan)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Blog / News
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
              • Just now
            </span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--cyan)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              P
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Parlexa Editorial</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>AI Insights Team</div>
            </div>
          </div>
        </header>

        <div style={{ 
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
          borderRadius: '24px', padding: '40px', fontSize: '18px', lineHeight: 1.7, 
          color: 'var(--text-dim)' 
        }}>
          <p style={{ marginBottom: '24px' }}>
            Welcome to the Parlexa blog. This is a placeholder for the article <strong>{title}</strong>. 
            Currently, our editorial team is working on migrating our content management system. 
          </p>
          <p style={{ marginBottom: '24px' }}>
            As the AI landscape evolves rapidly, we are committed to bringing you the most up-to-date insights, reviews, and market analysis regarding enterprise AI tools, scaling operations, and modern workflows.
          </p>
          <p>
            Please check back soon to read the full article!
          </p>
        </div>
      </article>
    </div>
  );
}
