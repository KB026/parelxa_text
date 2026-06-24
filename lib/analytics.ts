'use server';

import { createClient } from './supabase/server';

export async function trackInteraction(agentId: number, type: 'view' | 'click' | 'cta_click', userId?: string) {
  // ✅ FIXED: Changed from 'cta_click' to 'click' to match queries in lib/api.ts
  // Now support both 'click' and 'cta_click' for backward compatibility, but standardize on 'click'
  // Normalize 'cta_click' to 'click' for consistency
  const normalizedType = type === 'cta_click' ? 'click' : type;
  try {
    const supabase = createClient();
    await supabase
      .from('agent_interactions')
      .insert({
        agent_id: agentId,
        action_type: normalizedType,
        user_id: userId
      });
  } catch (err) {
    console.error(`Error tracking ${normalizedType}:`, err);
  }
}

export async function refreshTrendingScores() {
  try {
    const supabase = createClient();
    await supabase.rpc('calculate_weekly_trending_scores');
  } catch (err) {
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
