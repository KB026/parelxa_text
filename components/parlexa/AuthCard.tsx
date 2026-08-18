'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Briefcase, Eye, EyeOff } from 'lucide-react';
import { registerUserAjax } from '@/app/login/actions';

type AuthView = 'signin' | 'register' | 'forgot';

interface AuthCardProps {
  initialView?: AuthView;
  initialRole?: 'user' | 'vendor';
  initialMessage?: string;
  onSuccess?: () => void;
}

export function AuthCard({
  initialView = 'signin',
  initialRole = 'user',
  initialMessage = '',
  onSuccess,
}: AuthCardProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialMessage);
  const [success, setSuccess] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [howDidYouHear, setHowDidYouHear] = useState('');
  const [howDidYouHearCustom, setHowDidYouHearCustom] = useState('');
  const [role, setRole] = useState<'user' | 'vendor'>(initialRole);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setHowDidYouHear('');
    setHowDidYouHearCustom('');
    setError('');
    setSuccess('');
    setLoading(false);
  }, []);

  // Reset notifications on view change
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [view]);

  // Sync initial view/role if props change
  useEffect(() => {
    if (initialView) setView(initialView);
    if (initialRole) setRole(initialRole);
    if (initialMessage) setError(initialMessage);
  }, [initialView, initialRole, initialMessage]);

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
      if (onSuccess) onSuccess();

      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const nextUrl = params?.get('next');
      if (nextUrl && nextUrl.startsWith('/')) {
        window.location.assign(nextUrl);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      const userRole = profileData?.role;

      if (userRole === 'admin') {
        window.location.href = '/admin';
      } else if (userRole === 'vendor') {
        window.location.assign('/dashboard/vendor/listings');
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

    const finalSource = howDidYouHear === 'Other' && howDidYouHearCustom
      ? `Other: ${howDidYouHearCustom.trim()}`
      : howDidYouHear;

    setLoading(true);

    try {
      const res = await registerUserAjax({
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName,
        phone,
        how_did_you_hear: finalSource,
      });

      if (res?.error) {
        if (res.error.includes('already registered')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else {
          setError(res.error);
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
    setError('');
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005');
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const nextParam = params?.get('next');
      const nextQuery = nextParam ? `&next=${encodeURIComponent(nextParam)}` : '';

      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?role=${role}${nextQuery}`,
        },
      });

      if (oAuthError) {
        console.error('Google OAuth Error:', oAuthError);
        setError(`Google sign-in failed: ${oAuthError.message}`);
      }
    } catch (err) {
      console.error('Unexpected Google SSO error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`An unexpected error occurred: ${errMsg}`);
    }
  }

  return (
    <div className="bg-[#0d1524] border border-white/10 rounded-2xl p-8 max-w-[480px] w-full shadow-[0_16px_48px_rgba(0,0,0,0.5)] relative">
      {/* Logo Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block no-underline">
          <Image src="/icon.png" alt="Parlexa Icon" width={60} height={60} className="w-[60px] h-auto object-contain mx-auto mb-4 block hover:scale-105 transition-transform" />
        </Link>
        <h2 className="text-2xl font-bold m-0 text-slate-100">
          {view === 'forgot' ? 'Reset Password' : 'Welcome to Parlexa'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {view === 'signin' && "Sign in to access your dashboard"}
          {view === 'register' && "Create your account to get started"}
          {view === 'forgot' && "Enter your email to receive a reset link"}
        </p>
      </div>

      {/* Alerts */}
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-5 text-center">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm mb-5 text-center">{success}</div>}

      {/* ── FORGOT PASSWORD VIEW ── */}
      {view === 'forgot' && !success && (
        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-300">Email Address</label>
            <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 text-sm font-semibold mt-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
          </Button>
          <div className="text-center mt-4">
            <button type="button" className="bg-transparent border-none text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => { setView('signin'); resetForm(); }}>
              ← Back to Sign In
            </button>
          </div>
        </form>
      )}
      {view === 'forgot' && success && (
        <div className="text-center mt-2">
          <button type="button" className="bg-transparent border-none text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => { setView('signin'); resetForm(); }}>
            ← Back to Sign In
          </button>
        </div>
      )}

      {/* ── SIGN IN / REGISTER VIEWS ── */}
      {view !== 'forgot' && (
        <>
          {/* Tab Switcher */}
          <div className="flex bg-[#111c2e] p-1 rounded-xl mb-6">
            <button
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all border-none cursor-pointer ${view === 'signin' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-white'}`}
              onClick={() => setView('signin')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all border-none cursor-pointer ${view === 'register' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-white'}`}
              onClick={() => setView('register')}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* Google SSO */}
          <Button variant="outline" className="w-full h-11 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-2 mb-5" onClick={handleGoogleSignIn} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>

          <div className="flex items-center text-slate-500 text-xs font-semibold uppercase tracking-wider mb-5 before:content-[''] before:flex-1 before:h-px before:bg-white/10 before:mr-3 after:content-[''] after:flex-1 after:h-px after:bg-white/10 after:ml-3">or</div>

          {/* ── SIGN IN FORM ── */}
          {view === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-slate-300">Email</label>
                <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input className="w-full bg-[#111c2e] border border-white/10 rounded-lg p-3 pr-10 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  Remember me
                </label>
                <button type="button" className="bg-transparent border-none text-sky-400 text-sm font-medium cursor-pointer hover:text-sky-300 transition-colors" onClick={() => setView('forgot')}>
                  Forgot password?
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 text-sm font-semibold mt-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
              </Button>
              <div className="text-center mt-5 pt-4 border-t border-white/5">
                <p className="text-sm text-slate-500 m-0">
                  Don&apos;t have an account?{' '}
                  <button type="button" className="bg-transparent border-none font-semibold text-sky-400 cursor-pointer hover:text-sky-300 transition-colors" onClick={() => setView('register')}>
                    Create one for free
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {view === 'register' && !success && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              {/* User Type Selector */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className={`p-3 rounded-xl border cursor-pointer transition-all ${role === 'user' ? 'border-sky-400 bg-sky-400/10' : 'border-white/10 bg-[#111c2e] hover:border-white/20 hover:bg-white/5'} flex flex-col items-start gap-1`} onClick={() => setRole('user')}>
                  <span className="mb-1 text-slate-300"><Search size={24} /></span>
                  <span className="text-sm font-semibold text-slate-200">Find AI Tools</span>
                  <span className="text-[11px] text-slate-500">I&apos;m looking for AI solutions</span>
                </div>
                <div className={`p-3 rounded-xl border cursor-pointer transition-all ${role === 'vendor' ? 'border-sky-400 bg-sky-400/10' : 'border-white/10 bg-[#111c2e] hover:border-white/20 hover:bg-white/5'} flex flex-col items-start gap-1`} onClick={() => setRole('vendor')}>
                  <span className="mb-1 text-slate-300"><Briefcase size={24} /></span>
                  <span className="text-sm font-semibold text-slate-200">List My Tool</span>
                  <span className="text-[11px] text-slate-500">I want to sell on Parlexa</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-slate-300">First Name</label>
                  <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-slate-300">Last Name</label>
                  <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-slate-300">Email</label>
                <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-slate-300">Phone Number (Optional)</label>
                <input className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-slate-300">How did you hear about Parlexa?</label>
                <select className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" value={howDidYouHear} onChange={e => setHowDidYouHear(e.target.value)}>
                  <option value="">Select an option...</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Social Media (LinkedIn, X/Twitter, Instagram, YouTube)">Social Media (LinkedIn, X / Twitter, Instagram, YouTube)</option>
                  <option value="Friend / Founder Referral">Friend / Founder Referral</option>
                  <option value="Blog / Article / Press">Blog / Article / Press</option>
                  <option value="Product Hunt">Product Hunt</option>
                  <option value="Other">Other</option>
                </select>
                {howDidYouHear === 'Other' && (
                  <input
                    className="bg-[#111c2e] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 mt-1"
                    type="text"
                    placeholder="Please specify (e.g. Podcast, Newsletter)..."
                    value={howDidYouHearCustom}
                    onChange={e => setHowDidYouHearCustom(e.target.value)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input className="w-full bg-[#111c2e] border border-white/10 rounded-lg p-3 pr-10 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-slate-300">Confirm Password</label>
                <div className="relative">
                  <input className="w-full bg-[#111c2e] border border-white/10 rounded-lg p-3 pr-10 text-sm text-white focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" type={showPasswordConfirm ? 'text' : 'password'} placeholder="Must match password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required minLength={6} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                    {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 text-sm font-semibold mt-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
              </Button>
              <div className="text-center mt-5 pt-4 border-t border-white/5">
                <p className="text-sm text-slate-500 m-0">
                  Already have an account?{' '}
                  <button type="button" className="bg-transparent border-none font-semibold text-sky-400 cursor-pointer hover:text-sky-300 transition-colors" onClick={() => setView('signin')}>
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
