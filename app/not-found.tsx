'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="status-code">404</div>
        <div className="ai-icon">🛸</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-white)' }}>
          Lost in the latent space?
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px', lineHeight: 1.6 }}>
          The tool or page you are looking for has been moved or doesn&apos;t exist. 
          Even the smartest AI can&apos;t find this one.
        </p>

        <Link href="/" className="btn-get-started" style={{ padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }}>
          Back to Marketplace
        </Link>

        <div className="stars-decoration">
          <div className="star" style={{ top: '10%', left: '20%' }}></div>
          <div className="star" style={{ top: '30%', left: '80%' }}></div>
          <div className="star" style={{ top: '70%', left: '15%' }}></div>
          <div className="star" style={{ top: '85%', left: '75%' }}></div>
        </div>
      </div>

      <style jsx>{`
        .not-found-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          overflow: hidden;
          position: relative;
        }
        .not-found-content {
          text-align: center;
          z-index: 10;
          padding: 40px;
          max-width: 500px;
        }
        .status-code {
          font-size: 160px;
          font-weight: 900;
          background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          pointer-events: none;
        }
        .ai-icon {
          font-size: 80px;
          margin-bottom: 24px;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #fff;
          border-radius: 50%;
          opacity: 0.5;
          animation: twinkle 2s infinite alternate;
        }
        @keyframes twinkle {
          from { opacity: 0.2; transform: scale(1); }
          to { opacity: 0.8; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
