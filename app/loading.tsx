'use client';

export default function Loading() {
  return (
    <div className="loading-overlay">
      <div className="loader-orbit">
        <div className="orbit-core" />
        <div className="orbit-ring" />
        <div className="orbit-satellite" />
      </div>
      <div className="loading-text">Synchronizing Intelligence...</div>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 120px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          pointer-events: none;
          z-index: 9999;
          padding: 24px;
        }
        .loader-orbit {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .orbit-core {
          width: 12px;
          height: 12px;
          background: var(--cyan);
          border-radius: 50%;
          box-shadow: 0 0 20px var(--cyan);
        }
        .orbit-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(6, 182, 212, 0.1);
          border-radius: 50%;
        }
        .orbit-satellite {
          position: absolute;
          top: 0;
          left: 50%;
          width: 6px;
          height: 6px;
          margin-left: -3px;
          background: #fff;
          border-radius: 50%;
          transform-origin: 3px 50px;
          animation: rotate 2s linear infinite;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .loading-text {
          font-family: var(--font-outfit), sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--text-dim);
          text-transform: uppercase;
          animation: pulse 2s infinite alternate;
        }
        @keyframes pulse {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
