'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: '📊' },
    { label: 'My Listings', href: '/vendor/listings', icon: '🚀' },
    { label: 'Saved Tools', href: '/dashboard/saved', icon: '🔖' },
    { label: 'My Reviews', href: '/dashboard/reviews', icon: '⭐' },
    { label: 'Compare History', href: '/dashboard/history', icon: '⚖️' },
    { label: 'Profile Settings', href: '/dashboard/settings', icon: '👤' },
    { label: 'AI Preferences', href: '/dashboard/preferences', icon: '🧠' },
  ];

  return (
    <aside style={{ width: '260px', flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
          Consumer Dashboard
        </h2>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                color: isActive ? 'var(--text-white)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = 'var(--text-white)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          <Link 
            href="/dashboard/orders"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px',
              color: 'var(--text-dim)', fontSize: '14px', textDecoration: 'none'
            }}
          >
            <span>📦</span> My Orders
          </Link>
        </div>
      </div>
    </aside>
  );
}
