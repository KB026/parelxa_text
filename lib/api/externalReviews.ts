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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToExternalReview(item: any): ExternalReview {
  return {
    id: item.id,
    agent_id: item.agent_id || 0,
    source: item.source || '',
    rating: Number(item.rating) || 0,
    reviews_count: Number(item.reviews_count) || 0,
    snippet: item.snippet || '',
    source_url: item.source_url || '',
    last_fetched_at: item.last_fetched_at || new Date().toISOString()
  };
}

export async function getExternalReviews(agentId: number, agentName: string): Promise<ExternalReview[]> {
  const supabase = createClient();

  const { data: reviews } = await supabase
    .from('external_reviews')
    .select('*')
    .eq('agent_id', agentId)
    .order('rating', { ascending: false });

  if (reviews && reviews.length > 0) {
    return reviews.map(mapToExternalReview);
  }

  return [];
}


