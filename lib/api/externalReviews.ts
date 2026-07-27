import { createClient } from '@/lib/supabase/server';

export interface ExternalReview {
  id: number;
  agent_id: number;
  platform: string;
  source: string;
  url: string;
  source_url: string;
  rating: number;
  reviews_count: number;
  snippet: string;
  status: 'unverified' | 'verified' | 'rejected';
  verified_by?: string | null;
  verified_at?: string | null;
  created_at?: string;
  last_fetched_at?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToExternalReview(item: any): ExternalReview {
  const platform = item.platform || item.source || 'Other';
  const url = item.url || item.source_url || '';

  return {
    id: item.id,
    agent_id: item.agent_id || 0,
    platform,
    source: platform,
    url,
    source_url: url,
    rating: Number(item.rating) || 0,
    reviews_count: Number(item.reviews_count || item.review_count) || 0,
    snippet: item.snippet || '',
    status: item.status || (item.rating ? 'verified' : 'unverified'),
    verified_by: item.verified_by || null,
    verified_at: item.verified_at || null,
    created_at: item.created_at || new Date().toISOString(),
    last_fetched_at: item.last_fetched_at || new Date().toISOString(),
  };
}

/**
 * Fetches ONLY VERIFIED external reviews for public rendering.
 */
export async function getExternalReviews(
  agentId: number,
  _agentName?: string
): Promise<ExternalReview[]> {
  const supabase = createClient();

  const { data: reviews } = await supabase
    .from('external_reviews')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'verified')
    .order('rating', { ascending: false });

  if (reviews && reviews.length > 0) {
    return reviews.map(mapToExternalReview);
  }

  // Fallback check: if status column doesn't exist yet, return rows with rating > 0
  const { data: legacyReviews } = await supabase
    .from('external_reviews')
    .select('*')
    .eq('agent_id', agentId)
    .gt('rating', 0)
    .order('rating', { ascending: false });

  if (legacyReviews && legacyReviews.length > 0) {
    return legacyReviews.map(mapToExternalReview);
  }

  return [];
}

/**
 * Fetches all external reviews (including unverified ones) for Admin Approval Queue.
 */
export async function getAllExternalReviewsForAgent(
  agentId: number
): Promise<ExternalReview[]> {
  const supabase = createClient();

  const { data: reviews } = await supabase
    .from('external_reviews')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: true });

  if (reviews && reviews.length > 0) {
    return reviews.map(mapToExternalReview);
  }

  return [];
}
