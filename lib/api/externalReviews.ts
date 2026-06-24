import { createClient } from '@/lib/supabase/server';
import { searchReviews } from '@/lib/serper';

export interface ExternalReview {
  id: number;
  agent_id: number;
  source: string;
  rating: number;
  reviews_count: number;
  snippet: string;
  source_url: string;
  last_fetched_at: string;
}

export async function getExternalReviews(agentId: number, agentName: string): Promise<ExternalReview[]> {
  const supabase = createClient();

  // 1. Check cache
  const { data: cached } = await supabase
    .from('external_reviews')
    .select('*')
    .eq('agent_id', agentId)
    .order('last_fetched_at', { ascending: false });

  const now = new Date();
  const cacheLimit = 24 * 60 * 60 * 1000; // 24 hours

  if (cached && cached.length > 0) {
    const lastFetch = new Date(cached[0].last_fetched_at);
    if (now.getTime() - lastFetch.getTime() < cacheLimit) {
      return cached;
    }
  }

  // 2. Fetch fresh data if needed
  const freshResults = await searchReviews(agentName);
  
  if (freshResults.length > 0) {
    // Clear old cache for this agent
    await supabase.from('external_reviews').delete().eq('agent_id', agentId);
    
    // Insert new results
    const toInsert = freshResults.map(r => ({
      agent_id: agentId,
      source: r.source,
      rating: r.rating,
      reviews_count: r.ratingCount,
      snippet: r.snippet,
      source_url: r.link,
      last_fetched_at: now.toISOString()
    }));

    const { data: inserted } = await supabase
      .from('external_reviews')
      .insert(toInsert)
      .select();
    
    return inserted || [];
  }

  return cached || [];
}
