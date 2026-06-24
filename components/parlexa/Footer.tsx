import Link from 'next/link';
import { getCategories } from '@/lib/api';
import { Category } from '@/lib/types';

export async function Footer() {
  const categories = await getCategories();
  
  return (
    <footer style={{
      background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)',
      padding: '80px 40px 40px', marginTop: '60px'
    }}>
      <div style={{
        maxWidth: '1320px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'minmax(300px, 2fr) 1fr 1fr', gap: '60px', marginBottom: '60px'
      }}>
        <div>
          <div className="nav-logo" style={{marginBottom: '20px'}}>
            <img src="/logo.png" alt="Parlexa Logo" style={{ height: '54px', objectFit: 'contain' }} />
          </div>
          <p style={{color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '24px', maxWidth: '380px'}}>
            The global premier marketplace for AI agents and tools. Discover, compare, and integrate powerful AI solutions built to scale enterprises worldwide.
          </p>
          <div style={{display: 'flex', gap: '12px'}}>
            <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-white)', cursor: 'pointer'}}>𝕏</div>
            <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-white)', cursor: 'pointer'}}>in</div>
            <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-white)', cursor: 'pointer'}}>✉</div>
          </div>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <h4 style={{fontSize: '16px', fontWeight: 600, color: 'var(--text-white)', marginBottom: '4px'}}>Categories</h4>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {categories.slice(0, 6).map((c: Category) => (
              <li key={c.name}><Link href={`/products?category=${encodeURIComponent(c.name)}`} style={{color: 'var(--text-muted)', fontSize: '14px', transition: 'color 0.2s', cursor: 'pointer'}}>{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <h4 style={{fontSize: '16px', fontWeight: 600, color: 'var(--text-white)', marginBottom: '4px'}}>Resources</h4>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <li><Link href="/products" style={{color: 'var(--text-muted)', fontSize: '14px', transition: 'color 0.2s', cursor: 'pointer'}}>All AI Agents</Link></li>
            <li><Link href="/vendor/listings/new" style={{color: 'var(--text-muted)', fontSize: '14px', transition: 'color 0.2s', cursor: 'pointer'}}>List your tool</Link></li>
            <li><Link href="/compare" style={{color: 'var(--text-muted)', fontSize: '14px', transition: 'color 0.2s', cursor: 'pointer'}}>Compare Agents</Link></li>
            <li><Link href="/products" style={{color: 'var(--text-muted)', fontSize: '14px', transition: 'color 0.2s', cursor: 'pointer'}}>Search Marketplace</Link></li>
            <li><Link href="/about" style={{color: 'var(--text-muted)', fontSize: '14px', transition: 'color 0.2s', cursor: 'pointer'}}>About Us</Link></li>
            <li><Link href="/contact" style={{color: 'var(--text-muted)', fontSize: '14px', transition: 'color 0.2s', cursor: 'pointer'}}>Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      <div style={{
        maxWidth: '1320px', margin: '0 auto', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-dim)', fontSize: '14px', flexWrap: 'wrap', gap: '16px'
      }}>
        <p>A Global Ecosystem for AI</p>
        <p>© 2026 Parlexa. All rights reserved.</p>
        <div style={{display: 'flex', gap: '24px'}}>
          <span style={{cursor: 'pointer', transition: 'color 0.2s'}}>Privacy Policy</span>
          <span style={{cursor: 'pointer', transition: 'color 0.2s'}}>Terms</span>
        </div>
      </div>
    </footer>
  );
}
