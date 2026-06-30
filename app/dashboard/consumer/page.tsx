'use client';
import { Bookmark, Star, ArrowRightLeft, User } from 'lucide-react';
import Link from 'next/link';

export default function ConsumerDashboard() {
  const quickLinks = [
    { label: 'Saved Shortlist', desc: 'Manage your bookmarked AI agents and custom folders', href: '/dashboard/consumer/saved-tools', icon: <Bookmark size={24} className="text-sky-400" /> },
    { label: 'My Reviews', desc: 'Read and manage reviews you have left for AI tools', href: '/dashboard/consumer/reviews', icon: <Star size={24} className="text-amber-400" /> },
    { label: 'Compare History', desc: 'Review your past side-by-side tool comparisons', href: '/dashboard/consumer/history', icon: <ArrowRightLeft size={24} className="text-emerald-400" /> },
    { label: 'Profile Settings', desc: 'Update your account preferences and credentials', href: '/dashboard/consumer/settings', icon: <User size={24} className="text-purple-400" /> },
  ];

  return (
    <section>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(6,182,212,0.08) 100%)',
        border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px', marginBottom: '48px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Welcome to your Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
            Quickly access your shortlist, manage reviews, and configure your AI finder preferences.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {quickLinks.map((item) => (
          <Link href={item.href} key={item.href} style={{ textDecoration: 'none' }}>
            <div 
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '20px', 
                padding: '32px',
                height: '100%',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: 'var(--text-white)' }}>
                  {item.label}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
