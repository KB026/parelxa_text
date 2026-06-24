'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';


type AuthView = 'signin' | 'register' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  initialRole?: 'user' | 'vendor';
}

export function AuthModal({ isOpen, onClose, initialView = 'signin', initialRole = 'user' }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'user' | 'vendor'>('user');
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setFirstName('');
    setLastName('');
    setError('');
    setSuccess('');
    setLoading(false);
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset form when switching views
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [view]);

  // Set initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialView) setView(initialView);
      if (initialRole) setRole(initialRole);
    }
  }, [isOpen, initialView, initialRole]);

  if (!mounted || !isOpen) return null;

  // ── Sign In ──
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in. Check your inbox.');
        } else if (authError.message.includes('Invalid login')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      resetForm();
      onClose();
      
      const userRole = data.user?.user_metadata?.role;
      if (userRole === 'vendor') {
        window.location.assign('/vendor/listings');
      } else if (userRole === 'admin') {
        window.location.assign('/admin');
      } else {
        window.location.assign('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  // ── Sign Up ──
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      setSuccess('Verification email sent! Check your inbox to complete registration.');
      setLoading(false);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  // ── Forgot Password ──
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess('Password reset link sent! Check your email inbox.');
      setLoading(false);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  // ── Google SSO ──
  async function handleGoogleSignIn() {
    try {
      const supabase = createClient();
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oAuthError) {
        setError('Google sign-in failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    }
  }

  return createPortal(
    <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-modal">
        <div className="auth-glow" />
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">×</button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/icon.png" alt="Parlexa Icon" style={{ width: '60px', height: 'auto', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
            {view === 'forgot' ? 'Reset Password' : 'Welcome to Parlexa'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px' }}>
            {view === 'signin' && "Sign in to access your dashboard"}
            {view === 'register' && "Create your account to get started"}
            {view === 'forgot' && "Enter your email to receive a reset link"}
          </p>
        </div>

        {/* Error / Success */}
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === 'forgot' && !success && (
          <form onSubmit={handleForgotPassword}>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button type="button" className="auth-footer-link" onClick={() => { setView('signin'); resetForm(); }}>
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
        {view === 'forgot' && success && (
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button type="button" className="auth-footer-link" onClick={() => { setView('signin'); resetForm(); }}>
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* ── SIGN IN / REGISTER VIEWS ── */}
        {view !== 'forgot' && (
          <>
            {/* Tab Switcher */}
            <div className="auth-tabs">
              <button className={`auth-tab ${view === 'signin' ? 'active' : ''}`} onClick={() => setView('signin')} type="button">Sign In</button>
              <button className={`auth-tab ${view === 'register' ? 'active' : ''}`} onClick={() => setView('register')} type="button">Create Account</button>
            </div>

            {/* Google SSO */}
            <button className="auth-google-btn" onClick={handleGoogleSignIn} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="auth-divider">or</div>

            {/* ── SIGN IN FORM ── */}
            {view === 'signin' && (
              <form onSubmit={handleSignIn}>
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="auth-remember-row">
                  <label>
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    Remember me
                  </label>
                  <button type="button" className="auth-footer-link" onClick={() => setView('forgot')}>
                    Forgot password?
                  </button>
                </div>
                <button className="auth-submit-btn" type="submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Sign In'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
                    Don&apos;t have an account?{' '}
                    <button type="button" className="auth-footer-link" style={{ fontWeight: 600, color: 'var(--cyan)' }} onClick={() => setView('register')}>
                      Create one for free
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {view === 'register' && !success && (
              <form onSubmit={handleSignUp}>
                {/* User Type Selector */}
                <div className="auth-type-selector">
                  <div className={`auth-type-card ${role === 'user' ? 'selected' : ''}`} onClick={() => setRole('user')}>
                    <span className="auth-type-icon">🔍</span>
                    <span className="auth-type-label">Find AI Tools</span>
                    <span className="auth-type-desc">I&apos;m looking for AI solutions</span>
                  </div>
                  <div className={`auth-type-card ${role === 'vendor' ? 'selected' : ''}`} onClick={() => setRole('vendor')}>
                    <span className="auth-type-icon">🚀</span>
                    <span className="auth-type-label">List My Tool</span>
                    <span className="auth-type-desc">I want to sell on Parlexa</span>
                  </div>
                </div>

                <div className="auth-name-grid">
                  <div className="auth-field">
                    <label className="auth-label">First Name</label>
                    <input className="auth-input" type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Last Name</label>
                    <input className="auth-input" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input className="auth-input" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <input className="auth-input" type="password" placeholder="••••••••" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
                </div>
                <button className="auth-submit-btn" type="submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Create Account'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
                    Already have an account?{' '}
                    <button type="button" className="auth-footer-link" style={{ fontWeight: 600, color: 'var(--cyan)' }} onClick={() => setView('signin')}>
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
