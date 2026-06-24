import { getAgentsByIds } from '@/lib/api';
import { ComparePageClient } from '@/components/parlexa/compare/ComparePageClient';

export const dynamic = 'force-dynamic';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const ids = searchParams.ids?.split(',').map(Number).filter(id => !isNaN(id)) || [];
  
  // Fetch initial agents
  const initialAgents = ids.length > 0 ? await getAgentsByIds(ids.slice(0, 3)) : [];

  return (
    <div className="compare-page" style={{ 
      maxWidth: '1320px', margin: '0 auto', padding: '120px 40px 80px',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Compare AI Agents
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Analyze tools side by side to find the perfect fit for your localized business needs.
        </p>
      </header>

      <ComparePageClient 
        initialAgents={initialAgents} 
      />
    </div>
  );
}
