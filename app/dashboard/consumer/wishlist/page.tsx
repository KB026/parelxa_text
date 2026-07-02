import { getAgents } from '@/lib/api';
import { AgentCard } from '@/components/parlexa/AgentCard';

export const dynamic = 'force-dynamic';

export default async function CustomerWishlist() {
  const agents = await getAgents();
  const wishlistAgents = [agents[1], agents[5], agents[10], agents[15]].filter(Boolean);

  return (
    <section>
      <h1 className="page-title" style={{ marginBottom: '8px' }}>Wishlist</h1>
      <p className="page-subtitle" style={{ marginBottom: '32px' }}>Your saved AI agents for future integration.</p>

      {wishlistAgents.length > 0 ? (
        <div className="agents-grid">
          {wishlistAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>No agents found. Start adding some from the catalog!</p>
      )}
    </section>
  );
}
