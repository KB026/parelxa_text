'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AuthModal } from './AuthModal';
import { VendorUpgradeModal } from './VendorUpgradeModal';
import { Button } from '@/components/ui/button';
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

  return (
    <>
      <div className="flex items-center gap-4">
        
        {user ? (
        <div className="flex items-center gap-4">
          {user.role === 'admin' && (
            <Link href="/admin" className="text-[10px] font-semibold px-2 py-0.5 bg-amber-500 text-black rounded-full no-underline uppercase tracking-wider">Admin</Link>
          )}
          <div className="flex items-center gap-2 pointer-events-auto">
            <Link href={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/dashboard/vendor' : '/dashboard/consumer'} className="flex items-center gap-2.5 p-1 pr-4 rounded-full hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-all duration-300">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.15] text-gray-300 text-[13px] font-medium shadow-sm">{user.initial}</div>
              <span className="text-sm font-medium text-gray-300 hidden md:block">Dashboard</span>
            </Link>
            <form action="/api/auth/signout" method="POST" className="m-0">
              <button type="submit" className="text-[13px] font-medium text-gray-500 hover:text-red-400 transition-colors ml-2 px-2 hidden md:block">Sign Out</button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setAuthOpen(true)}
          className="flex items-center gap-2 whitespace-nowrap shrink-0 bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-lg px-4 py-2 font-semibold transition-all hover:-translate-y-px"
        >
          <span>Sign In</span>
          <span className="text-base">→</span>
        </Button>
      )}
      </div>

      <button className="md:hidden bg-transparent border-none text-white text-2xl cursor-pointer ml-4" onClick={() => setMobileMenuOpen(true)}>☰</button>

      {isMounted && mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div ref={menuRef} className="fixed inset-0 bg-[#080d1a] z-[3000] p-10 flex flex-col">
          <button onClick={() => setMobileMenuOpen(false)} className="self-end bg-transparent border-none text-white text-3xl cursor-pointer mb-10">✕</button>
          <div className="flex flex-col gap-6 text-2xl">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors">All Agents</Link>
            <Link href="/ai-finder" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors">AI Finder</Link>
            <Link href={user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/dashboard/vendor' : '/dashboard/consumer'} onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
            <form action="/api/auth/signout" method="POST" className="m-0 mt-4">
              <Button type="submit" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-auto p-2 text-xl font-medium justify-start">Sign Out</Button>
            </form>
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
