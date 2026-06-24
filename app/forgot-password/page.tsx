import Link from 'next/link';
import { forgotPassword } from '../login/actions';

export default function ForgotPasswordPage({ searchParams }: { searchParams: { message?: string } }) {
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
          <img src="/icon.png" alt="Parlexa Icon" style={{ width: '60px', height: 'auto', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Reset Your Password</h2>
        </Link>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Enter your email to receive a password reset link</p>
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
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          {searchParams?.message && (
            <div style={{ background: 'rgba(28, 25, 23, 0.5)', color: searchParams.message.includes('Check') ? 'var(--cyan)' : '#f87171', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', textAlign: 'center' }}>
              {searchParams.message}
            </div>
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

          <div style={{ marginTop: '12px' }}>
            <button formAction={forgotPassword} style={{ width: '100%', background: 'var(--cyan)', color: '#000', fontWeight: 600, padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Send Reset Link</button>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: '14px', color: 'var(--text-dim)', textDecoration: 'none' }}>
              Back to <span style={{ color: 'white' }}>Sign In</span>
            </Link>
          </div>
        </form>
      </div>
      
      <div style={{ marginTop: '32px', color: 'var(--text-dim)', fontSize: '13px' }}>
         Parlexa Marketplace Â© 2026
      </div>
    </div>
  );
}
