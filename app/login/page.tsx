import Link from 'next/link';
import { login, signup, signInWithGoogle } from './actions';

export default function LoginPage({ searchParams }: { searchParams: { message?: string, mode?: string } }) {
  try {
    const isRegister = searchParams?.mode === 'register';
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        background: 'radial-gradient(ellipse at top, #111827, var(--bg-main) 70%)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" style={{ height: '72px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} alt="Parlexa Logo" />
            <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>Welcome to Parlexa</h1>
          </Link>
          <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Log in or create an account to access your dashboard</p>
        </div>

        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glow effect */}
          <div style={{ position: 'absolute', top: '-50px', left: '50px', width: '100px', height: '100px', background: 'var(--cyan)', filter: 'blur(80px)', opacity: 0.1, zIndex: 0 }} />

          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px' }}>
              <Link href="/login" style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', background: !isRegister ? 'var(--cyan)' : 'transparent', color: !isRegister ? '#000' : 'white', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
              <Link href="/login?mode=register" style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', background: isRegister ? 'var(--cyan)' : 'transparent', color: isRegister ? '#000' : 'white', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
            </div>

            {searchParams?.message && (
              <div style={{ background: '#1c1917', color: '#f87171', border: '1px solid #451a03', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', textAlign: 'center' }}>
                {searchParams.message}
              </div>
            )}

            {/* Google SSO */}
            <button 
              formAction={signInWithGoogle}
              className="auth-google-btn" 
              type="submit"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'white',
                fontSize: '15px',
                fontWeight: 600,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>or</div>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {isRegister && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>I want to...</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <input type="radio" name="role" value="user" defaultChecked />
                      <span style={{ fontSize: '14px', color: 'white' }}>Find AI Tools</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <input type="radio" name="role" value="vendor" />
                      <span style={{ fontSize: '14px', color: 'white' }}>Sell AI Tools</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="first_name" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>First Name</label>
                    <input type="text" name="first_name" id="first_name" required placeholder="John" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label htmlFor="last_name" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Last Name</label>
                    <input type="text" name="last_name" id="last_name" required placeholder="Doe" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Phone Number</label>
                  <input type="tel" name="phone" id="phone" required placeholder="+91 98765 43210" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Email</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
                {!isRegister && (
                  <Link href="/forgot-password" style={{ fontSize: '13px', color: 'var(--cyan)', textDecoration: 'none', opacity: 0.8 }}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                name="password"
                id="password"
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {isRegister && (
              <div>
                <label htmlFor="passwordConfirm" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Confirm Password</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  id="passwordConfirm"
                  required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '14px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ marginTop: '12px' }}>
              {isRegister ? (
                <button formAction={signup} style={{ width: '100%', background: 'var(--cyan)', color: '#000', fontWeight: 600, padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Create Account</button>
              ) : (
                <button formAction={login} style={{ width: '100%', background: 'var(--cyan)', color: '#000', fontWeight: 600, padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Sign In</button>
              )}
            </div>
          </form>
        </div>
        
        <div style={{ marginTop: '32px', color: 'var(--text-dim)', fontSize: '13px' }}>
           Parlexa Marketplace © 2026
        </div>
      </div>
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : '';
    
    return (
      <div style={{ padding: '40px', color: 'red', background: '#000', minHeight: '100vh' }}>
        <h1>DEBUG: Login Page Exception</h1>
        <pre>{errorStack || errorMessage || JSON.stringify(err)}</pre>
      </div>
    );
  }
}
