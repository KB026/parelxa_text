'use server';

import { createClient } from './supabase/server';
import { headers } from 'next/headers';

export async function trackInteraction(agentId: number, type: 'view' | 'click' | 'cta_click', userId?: string, searchKeyword?: string) {
  // ✅ FIXED: Changed from 'cta_click' to 'click' to match queries in lib/api.ts
  // Now support both 'click' and 'cta_click' for backward compatibility, but standardize on 'click'
  // Normalize 'cta_click' to 'click' for consistency
  const normalizedType = type === 'cta_click' ? 'click' : type;
  try {
    const supabase = createClient();
    const headersList = headers();
    
    // Attempt to extract traffic source
    const referer = headersList.get('referer') || '';
    const isPlatform = referer.includes(process.env.NEXT_PUBLIC_APP_URL || 'localhost') || referer.includes('parlexa.com');
    const trafficSource = isPlatform ? 'Platform Browse' : 'Direct Referral';

    // Attempt to extract location
    const visitorLocation = headersList.get('x-vercel-ip-country') || 
                            headersList.get('x-nf-client-connection-ip') || 
                            'Global / Unknown';

    await supabase
      .from('agent_interactions')
      .insert({
        agent_id: agentId,
        action_type: normalizedType,
        user_id: userId,
        traffic_source: trafficSource,
        visitor_location: visitorLocation,
        search_keyword: searchKeyword || null,
      });
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
      throw err;
    }
    console.error(`Error tracking ${normalizedType}:`, err);
  }
}

export async function refreshTrendingScores() {
  try {
    const supabase = createClient();
    await supabase.rpc('calculate_weekly_trending_scores');
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
      throw err;
    }
    console.error('Error refreshing trending scores:', err);
  }
}

export async function getTrendingAgents(limit: number = 8) {
  const supabase = createClient();
  
  // Sort by pinned tools first, then by trending score (Best Selling)
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('approval_status', 'approved')
    .order('is_pinned_trending', { ascending: false })
    .order('trending_score', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('Error fetching trending agents:', error);
    return [];
  }

  return data;
}

export async function getNewArrivals(limit: number = 8) {
  const supabase = createClient();
  
  // Calculate timestamp for 48 hours ago
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('approval_status', 'approved')
    .gte('created_at', fortyEightHoursAgo) // ONLY tools from last 48 hours
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }

  return data;
}
