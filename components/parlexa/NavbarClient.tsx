'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AuthModal } from './AuthModal';
import { UniversalSearch } from './UniversalSearch';
import { UserProfile, AuthEvent } from '@/lib/types';

interface NavbarClientProps {
  user: UserProfile | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [initialView, setInitialView] = useState<'signin' | 'register'>('signin');
  const [initialRole, setInitialRole] = useState<'user' | 'vendor'>('user');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Bridge Listener
  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const authEvent = e as AuthEvent;
      if (authEvent.detail?.view) setInitialView(authEvent.detail.view);
      if (authEvent.detail?.role) setInitialRole(authEvent.detail.role);
      setAuthOpen(true);
    };
    window.addEventListener('open-auth', handleOpenAuth);
    return () => window.removeEventListener('open-auth', handleOpenAuth);
  }, []);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <UniversalSearch />
        
        {user ? (
        <div className="nav-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user.role === 'admin' && (
            <Link href="/admin" className="nav-badge" style={{ background: 'var(--gold)', color: '#000', textDecoration: 'none' }}>Admin</Link>
          )}
          <div className="user-profile-trigger" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' }}>
            <div className="user-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--blue-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
              {user.initial}
            </div>
            <Link href="/dashboard" className="nav-link" style={{ fontSize: '13px' }}>Dashboard</Link>
            <form action="/api/auth/signout" method="POST" style={{ margin: 0 }}>
              <button type="submit" className="nav-link" style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '13px' }}>Sign Out</button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAuthOpen(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <span>Sign In</span>
          <span style={{ fontSize: '16px' }}>â†’</span>
        </button>
      )}
      </div>

      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>â˜°</button>

      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', zIndex: 3000, padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setMobileMenuOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#fff', fontSize: '32px', cursor: 'pointer', marginBottom: '40px' }}>âœ•</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '24px' }}>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)}>All Agents</Link>
            <Link href="/ai-finder" onClick={() => setMobileMenuOpen(false)}>AI Finder</Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          </div>
        </div>,
        document.body
      )}

      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)}
        initialView={initialView}
        initialRole={initialRole}
      />
    </>
  );
}
