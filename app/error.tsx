'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('GLOBAL ERROR BOUNDARY:', error);
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">âš ï¸</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-white)' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6, maxWidth: '400px' }}>
          We encountered an unexpected error. This has been logged and we&apos;re looking into it. 
          Please try refreshing the page or head back home.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            className="btn-get-started"
            style={{ padding: '12px 24px' }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{ 
              padding: '12px 24px', borderRadius: '12px', background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-subtle)', color: 'var(--text-white)', 
              textDecoration: 'none', fontWeight: 600, fontSize: '14px' 
            }}
          >
            Go back home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '40px', textAlign: 'left', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>Developer Debug Info</div>
            <code style={{ fontSize: '13px', color: '#ffb3b3', wordBreak: 'break-all' }}>{error.message}</code>
          </div>
        )}
      </div>

      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: radial-gradient(circle at top right, rgba(6, 182, 212, 0.05), transparent),
                      radial-gradient(circle at bottom left, rgba(251, 146, 60, 0.05), transparent);
        }
        .error-card {
          padding: 60px 40px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 32px;
          text-align: center;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(20px);
        }
        .error-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
}
