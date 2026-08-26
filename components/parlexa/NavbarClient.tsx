'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AuthModal } from './AuthModal';
import { VendorUpgradeModal } from './VendorUpgradeModal';
import { UserProfile, AuthEvent } from '@/lib/types';

interface NavbarClientProps {
  user: UserProfile | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [initialView, setInitialView] = useState<'signin' | 'register'>('signin');
  const [initialRole, setInitialRole] = useState<'user' | 'vendor'>('user');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for auth trigger in URL (e.g. ?auth=login or ?auth=register)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get('auth');
      if (authParam === 'login' || authParam === 'signin' || authParam === 'true') {
        setInitialView('signin');
        setAuthOpen(true);
      } else if (authParam === 'register' || authParam === 'signup') {
        setInitialView('register');
        setAuthOpen(true);
      }
    }
  }, []);

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

  // Focus trap and scroll lock for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const modal = menuRef.current;
      
      if (modal) {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableContent = modal.querySelectorAll(focusableElements);
        if (focusableContent.length > 0) {
          const firstFocusableElement = focusableContent[0] as HTMLElement;
          const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;
          
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              setMobileMenuOpen(false);
              return;
            }
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
              if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
              }
            }
          };
          
          document.addEventListener('keydown', handleKeyDown);
          firstFocusableElement.focus();
          
          return () => {
            document.removeEventListener('keydown', handleKeyDown);
          };
        }
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const dashboardHref = user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/dashboard/vendor' : '/dashboard/consumer';

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-3">
        {user ? (
          <div className="flex items-center gap-1.5 sm:gap-3">
            {user.role === 'admin' && (
              <Link href="/admin" className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/90 text-black rounded-full no-underline uppercase tracking-wider hover:bg-amber-400 transition-colors">
                Admin
              </Link>
            )}
            <Link
              href={dashboardHref}
              className="flex items-center gap-1.5 sm:gap-2 px-1 sm:px-1.5 pr-2 sm:pr-3 py-0.5 rounded-full border border-white/[0.06] hover:border-brand-violet/30 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 group"
            >
              <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-brand-violet/30 to-brand-fuchsia/20 border border-brand-violet/30 text-white text-[11px] sm:text-[12px] font-semibold shadow-sm group-hover:from-brand-violet/50 group-hover:to-brand-fuchsia/30 transition-all duration-300">
                {user.initial}
              </div>
              <span className="text-[13px] font-medium text-gray-400 group-hover:text-white transition-colors hidden md:block">
                Dashboard
              </span>
            </Link>
            <form action="/api/auth/signout" method="POST" className="m-0">
              <button
                type="submit"
                className="text-[12px] font-medium text-gray-600 hover:text-red-400 transition-colors hidden md:block"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="flex items-center gap-1 sm:gap-2 whitespace-nowrap shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-brand-violet/40 hover:border-brand-violet/60"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #6D28D9 100%)',
            }}
          >
            Sign In
            <span className="text-xs opacity-70">→</span>
          </button>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-[4px] items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-transparent border border-white/[0.08] rounded-lg cursor-pointer ml-1.5 sm:ml-3 hover:bg-white/[0.04] transition-colors shrink-0"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <span className="block w-3.5 sm:w-4 h-[1.5px] bg-gray-400 rounded-full transition-all" />
        <span className="block w-2.5 sm:w-3 h-[1.5px] bg-gray-400 rounded-full transition-all" />
        <span className="block w-3.5 sm:w-4 h-[1.5px] bg-gray-400 rounded-full transition-all" />
      </button>

      {/* Mobile full-screen menu */}
      {isMounted && mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="fixed inset-0 z-[3000] flex flex-col"
          style={{ animation: 'mobile-menu-in 0.3s ease-out both' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#09090B]/90 backdrop-blur-2xl" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-8 pt-6">
            {/* Close button */}
            <div className="flex justify-end mb-12">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-2">
              {[
                { href: '/products', label: 'All Agents', emoji: '🤖' },
                { href: '/ai-finder', label: 'AI Finder', emoji: '✨' },
                { href: '/products', label: 'Categories', emoji: '📂' },
                { href: dashboardHref, label: 'Dashboard', emoji: '📊' },
              ].map((item, i) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-5 py-4 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-2xl transition-all duration-200 group"
                  style={{ animation: `mobile-link-in 0.4s ease-out ${0.1 + i * 0.06}s both` }}
                >
                  <span className="text-xl">{item.emoji}</span>
                  {item.label}
                  <svg className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] my-6 mx-5" />

            {/* Bottom actions */}
            <div className="mt-auto flex flex-col gap-3 px-2" style={{ animation: 'mobile-link-in 0.4s ease-out 0.4s both' }}>
              {user ? (
                <form action="/api/auth/signout" method="POST" className="m-0">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-[15px] font-medium text-red-400 bg-red-500/[0.08] border border-red-500/20 hover:bg-red-500/[0.15] hover:border-red-500/30 transition-all"
                  >
                    Sign Out
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setAuthOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-[15px] font-semibold text-white border border-brand-violet/40 transition-all hover:shadow-[0_0_24px_rgba(139,92,246,0.3)]"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #6D28D9 100%)',
                  }}
                >
                  Sign In
                  <span className="opacity-70">→</span>
                </button>
              )}
            </div>
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
      <VendorUpgradeModal />
    </>
  );
}
