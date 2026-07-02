import { ComparePageClient } from '@/components/parlexa/compare/ComparePageClient';

export default function ComparePage() {
  return (
    <div className="compare-page" style={{ 
      maxWidth: '1320px', margin: '0 auto', padding: '120px 40px 80px',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em', color: 'var(--text-white)' }}>
          Compare AI Agents
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto' }}>
          Analyze tools side by side to find the perfect fit for your localized business needs.
        </p>
      </header>

      <ComparePageClient initialAgents={[]} />
    </div>
  );
}
