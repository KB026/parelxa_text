import { createClient } from './supabase/client';
import { Agent, AgentDB, Category, Review, ReviewStats, ReviewDB, SearchParams, PromotionDB } from './types';

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
  if (error || !data) {
    console.error('CRITICAL ERROR fetching categories:', error);
    return [];
  }
  return data;
}

export async function getAgents(category?: string): Promise<Agent[]> {
  const supabase = createClient();
  let query = supabase
    .from('agents')
    .select('*')
    .eq('approval_status', 'approved')
    // Filter out expired listings, but keep legacy free listings (created before May 2026)
    .or(`listing_expires_at.gt.${new Date().toISOString()},and(listing_expires_at.is.null,created_at.lt.2026-05-01T00:00:00Z)`);
  if (category && category !== 'All') query = query.eq('category', category);
  const { data, error } = await query;
  if (error || !data) {
    console.error('CRITICAL ERROR fetching agents:', error);
    return [];
  }
  
  try {
    return data.map((agent: AgentDB) => ({
      id: agent.id,
      name: agent.name || 'Unnamed Tool',
      oneLiner: agent.one_liner || '',
      logoUrl: agent.logo_url || '',
      description: agent.description || '',
      founders: agent.founders || '',
      founderLinkedin: agent.founder_linkedin || '',
      website: agent.website || '',
      city: agent.city || '',
      rawIndustry: agent.raw_industry || '',
      category: agent.category || 'AI & LLMs',
      subCategory: agent.sub_category || '',
      summary: agent.summary || '',
      useCases: agent.use_cases || '',
      features: agent.features || [],
      pricing: agent.pricing || 'Contact for pricing',
      pricingModel: agent.pricing_model || 'contact',
      priceRange: agent.price_range || '',
      freeTrial: agent.free_trial || 'No',
      globalAvailability: agent.global_availability || false,
      usdPrice: agent.usd_price || '',
      rating: Number(agent.rating) || 0,
      reviews: Number(agent.reviews) || 0,
      reviews_count: Number(agent.reviews_count) || 0,
      isVerified: agent.is_verified || false,
      demoUrl: agent.demo_url || '',
      videoUrl: agent.video_url || '',
      screenshots: agent.screenshots || [],
      tags: agent.tags || [],
      companyName: agent.company_name || '',
      teamSize: agent.team_size || '',
      companyLinkedin: agent.company_linkedin || '',
      companyBlurb: agent.company_blurb || '',
      foundedYear: Number(agent.founded_year) || 0,
      userId: agent.user_id || '',
      slug: agent.slug || '',
      isFeatured: agent.is_featured || false
    }));
  } catch (err) {
    console.error('Data mapping error in getAgents:', err);
    return [];
  }
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const supabase = createClient();
  const { data: agent, error } = await supabase.from('agents').select('*').eq('id', id).eq('approval_status', 'approved').single();
  if (error || !agent) {
    console.error('Error fetching agent details:', error);
    return null;
  }

  return {
    id: agent.id,
    name: agent.name || 'Unnamed Tool',
    oneLiner: agent.one_liner || '',
    logoUrl: agent.logo_url || '',
    description: agent.description || '',
    founders: agent.founders || '',
    founderLinkedin: agent.founder_linkedin || '',
    website: agent.website || '',
    city: agent.city || '',
    rawIndustry: agent.raw_industry || '',
    category: agent.category || 'AI & LLMs',
    subCategory: agent.sub_category || '',
    summary: agent.summary || '',
    foundedYear: Number(agent.founded_year) || 0,
    useCases: agent.use_cases || '',
    features: agent.features || [],
    pricing: agent.pricing || 'Contact for pricing',
    pricingModel: agent.pricing_model || 'contact',
    priceRange: agent.price_range || '',
    freeTrial: agent.free_trial || 'No',
    globalAvailability: agent.global_availability || false,
    usdPrice: agent.usd_price || '',
    rating: Number(agent.rating) || 0,
    reviews: Number(agent.reviews) || 0,
    reviews_count: Number(agent.reviews_count) || 0,
    isVerified: agent.is_verified || false,
    demoUrl: agent.demo_url || '',
    videoUrl: agent.video_url || '',
    screenshots: agent.screenshots || [],
    tags: agent.tags || [],
    companyName: agent.company_name || '',
    teamSize: agent.team_size || '',
    companyLinkedin: agent.company_linkedin || '',
    companyBlurb: agent.company_blurb || '',
    userId: agent.user_id || '',
    slug: agent.slug || ''
  };
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const supabase = createClient();
  
  let { data: agent, error } = await supabase.from('agents').select('*').eq('slug', slug).maybeSingle();
  
  // Fallback: If Github agent has no slug, the URL carries its numeric ID instead.
  if (!agent && /^\d+$/.test(slug)) {
    const fallbackRes = await supabase.from('agents').select('*').eq('id', Number(slug)).maybeSingle();
    agent = fallbackRes.data;
    error = fallbackRes.error;
  }

  if (error || !agent) {
    console.error('Error fetching agent by slug or ID fallback:', error);
    return null;
  }

  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name || 'Unnamed Tool',
    oneLiner: agent.one_liner || '',
    logoUrl: agent.logo_url || '',
    description: agent.description || '',
    founders: agent.founders || '',
    founderLinkedin: agent.founder_linkedin || '',
    website: agent.website || '',
    city: agent.city || '',
    rawIndustry: agent.raw_industry || '',
    category: agent.category || 'AI & LLMs',
    subCategory: agent.sub_category || '',
    summary: agent.summary || '',
    foundedYear: Number(agent.founded_year) || 0,
    useCases: agent.use_cases || '',
    features: agent.features || [],
    pricing: agent.pricing || 'Contact for pricing',
    pricingModel: agent.pricing_model || 'contact',
    priceRange: agent.price_range || '',
    freeTrial: agent.free_trial || 'No',
    globalAvailability: agent.global_availability || false,
    usdPrice: agent.usd_price || '',
    rating: Number(agent.rating) || 0,
    reviews: Number(agent.reviews) || 0,
    reviews_count: Number(agent.reviews_count) || 0,
    isVerified: agent.is_verified || false,
    demoUrl: agent.demo_url || '',
    videoUrl: agent.video_url || '',
    screenshots: agent.screenshots || [],
    tags: agent.tags || [],
    companyName: agent.company_name || '',
    teamSize: agent.team_size || '',
    companyLinkedin: agent.company_linkedin || '',
    companyBlurb: agent.company_blurb || '',
    userId: agent.user_id || ''
  };
}

export async function getSimilarAgents(category: string, currentId: number, limit: number = 4): Promise<Agent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('category', category)
    .eq('approval_status', 'approved')
    .or(`listing_expires_at.gt.${new Date().toISOString()},and(listing_expires_at.is.null,created_at.lt.2026-05-01T00:00:00Z)`)
    .neq('id', currentId)
    .limit(limit);

  if (error || !data) return [];
  
  return data.map((agent: AgentDB) => ({
    id: agent.id,
    name: agent.name,
    oneLiner: agent.one_liner,
    logoUrl: agent.logo_url,
    category: agent.category,
    subCategory: agent.sub_category || '',
    pricing: agent.pricing,
    rating: agent.rating,
    reviews_count: agent.reviews_count,
    isVerified: agent.is_verified || false,
    slug: agent.slug || ''
  } as unknown as Agent));
}

export async function getAgentsByIds(ids: number[]): Promise<Agent[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .in('id', ids);

  if (error || !data) {
    console.error('Error fetching agents by ids:', error);
    return [];
  }

  return data.map((agent: AgentDB) => ({
    id: agent.id,
    name: agent.name,
    oneLiner: agent.one_liner,
    logoUrl: agent.logo_url,
    description: agent.description,
    category: agent.category,
    subCategory: agent.sub_category || '',
    summary: agent.summary,
    useCases: agent.use_cases || '',
    features: agent.features,
    pricing: agent.pricing,
    pricingModel: agent.pricing_model,
    priceRange: agent.price_range,
    freeTrial: agent.free_trial,
    globalAvailability: agent.global_availability,
    usdPrice: agent.usd_price,
    rating: agent.rating,
    reviews: agent.reviews,
    reviews_count: agent.reviews_count,
    isVerified: agent.is_verified || false,
    demoUrl: agent.demo_url,
    videoUrl: agent.video_url,
    screenshots: agent.screenshots,
    tags: agent.tags,
    userId: agent.user_id,
    slug: agent.slug || ''
  } as Agent));
}

export async function getReviews(
  agentId: number, 
  sort: 'recent' | 'helpful' | 'high' | 'low' = 'helpful',
  page: number = 1,
  limit: number = 5
): Promise<Review[]> {
  const supabase = createClient();
  
  // Sort logic
  let orderColumn = 'created_at';
  let ascending = false;
  
  if (sort === 'high') { orderColumn = 'rating_overall'; ascending = false; }
  else if (sort === 'low') { orderColumn = 'rating_overall'; ascending = true; }
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      response:review_responses(content, created_at),
      helpful_votes:review_votes(count)
    `)
    .eq('agent_id', agentId)
    .eq('approval_status', 'approved')
    .order(orderColumn, { ascending })
    .range(from, to);

  if (error || !data) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  // To get helpful counts correctly, we might need a separate count or a better join
  // For now, let's map what we have and assume helpful_votes is handled
  return (data as unknown as ReviewDB[]).map((r: ReviewDB) => ({
    id: r.id,
    agentId: r.agent_id,
    userId: r.user_id,
    ratingOverall: Number(r.rating_overall),
    ratingEaseUse: r.rating_ease_use,
    ratingValue: r.rating_value,
    ratingSupport: r.rating_support,
    ratingRelevance: r.rating_relevance,
    content: r.content,
    recommend: r.recommend,
    useCase: r.use_case,
    helpfulVotes: r.helpful_votes?.[0]?.count || 0,
    unhelpfulVotes: 0, // Placeholder
    approvalStatus: r.approval_status,
    isReported: r.is_reported,
    createdAt: r.created_at,
    response: r.response?.[0] ? {
      content: r.response[0].content,
      createdAt: r.response[0].created_at
    } : undefined
  }));
}

export async function getReviewStats(agentId: number): Promise<ReviewStats | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('rating_overall, rating_ease_use, rating_value, rating_support, rating_relevance, recommend')
    .eq('agent_id', agentId)
    .eq('approval_status', 'approved');

  if (error || !data || data.length === 0) return null;

  const total = data.length;
  const breakdown: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumOverall = 0;
  let sumEase = 0;
  let sumValue = 0;
  let sumSupport = 0;
  let sumRelevance = 0;
  let sumRecommend = 0;

  data.forEach(r => {
    const floorRating = Math.round(Number(r.rating_overall));
    breakdown[floorRating] = (breakdown[floorRating] || 0) + 1;
    sumOverall += Number(r.rating_overall);
    sumEase += r.rating_ease_use;
    sumValue += r.rating_value;
    sumSupport += r.rating_support;
    sumRelevance += r.rating_relevance;
    if (r.recommend) sumRecommend++;
  });

  return {
    averageRating: sumOverall / total,
    totalReviews: total,
    recommendationRate: (sumRecommend / total) * 100,
    breakdown,
    dimensions: {
      easeOfUse: sumEase / total,
      valueForMoney: sumValue / total,
      supportQuality: sumSupport / total,
      globalRelevance: sumRelevance / total
    }
  };
}

export async function getUserReview(agentId: number, userId: string): Promise<Review | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('agent_id', agentId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    agentId: data.agent_id,
    userId: data.user_id,
    ratingOverall: Number(data.rating_overall),
    ratingEaseUse: data.rating_ease_use,
    ratingValue: data.rating_value,
    ratingSupport: data.rating_support,
    ratingRelevance: data.rating_relevance,
    content: data.content,
    recommend: data.recommend,
    useCase: data.use_case,
    helpfulVotes: 0,
    unhelpfulVotes: 0,
    approvalStatus: data.approval_status,
    isReported: data.is_reported,
    createdAt: data.created_at
  };
}

export async function getFeaturedAgents(category?: string, type: 'featured_category' | 'featured_home' = 'featured_home'): Promise<Agent[]> {
  const supabase = createClient();
  let query = supabase
    .from('promotions')
    .select(`
      agent_id,
      agent:agents(*)
    `)
    .eq('status', 'active')
    .eq('type', type)
    .gt('end_date', new Date().toISOString());

  if (category) query = query.eq('category', category);

  const { data, error } = await query.limit(10);
  if (error || !data) return [];

  const agents: Agent[] = (data as unknown as (PromotionDB & { agent: AgentDB })[])
    .filter(p => p.agent && p.agent.approval_status === 'approved' && p.agent.is_verified)
    .filter(p => (p.agent.rating || 0) >= 3.5 || (p.agent.reviews_count || 0) === 0)
    .map(p => {
      const agent = p.agent;
      return {
        id: agent.id,
        name: agent.name,
        oneLiner: agent.one_liner,
        logoUrl: agent.logo_url,
        category: agent.category,
        subCategory: agent.sub_category || '',
        pricing: agent.pricing,
        rating: agent.rating,
        reviews_count: agent.reviews_count,
        isVerified: agent.is_verified || false,
        isFeatured: true,
        promotionId: p.id,
        slug: agent.slug || ''
      } as Agent;
    });

  // Increment impressions
  if (agents.length > 0 && data) {
    const promotionData = data as unknown as PromotionDB[];
    try {
      await supabase.rpc('increment_impressions', { promotion_ids: promotionData.map(p => p.id) });
    } catch {
      // Fallback if RPC doesn't exist yet
      await Promise.all(promotionData.map(p => 
        supabase.from('promotions').update({ impressions: (p.impressions || 0) + 1 }).eq('id', p.id)
      )).catch(() => {});
    }
  }

  return agents;
}

export async function trackClick(promotionId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('increment_clicks', { promotion_id: promotionId });
  if (error) {
    // Fallback logic
    const { data: current } = await supabase.from('promotions').select('clicks').eq('id', promotionId).single();
    if (current) {
      await supabase.from('promotions').update({ clicks: (current.clicks || 0) + 1 }).eq('id', promotionId);
    }
  }
}

export async function searchAgents(params: SearchParams): Promise<{ agents: Agent[]; count: number }> {
  const supabase = createClient();
  
  let query = supabase
    .from('agents')
    .select('*', { count: 'exact' })
    .eq('approval_status', 'approved')
    .or(`listing_expires_at.gt.${new Date().toISOString()},and(listing_expires_at.is.null,created_at.lt.2026-05-01T00:00:00Z)`);

  // ... (rest of search logic remains same, but we inject featured at top)
  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,category.ilike.%${params.q}%,summary.ilike.%${params.q}%,description.ilike.%${params.q}%,one_liner.ilike.%${params.q}%`);
  }
  if (params.categories && params.categories.length > 0) {
    query = query.in('category', params.categories);
  }
  if (params.pricingModels && params.pricingModels.length > 0) {
    query = query.in('pricing_model', params.pricingModels);
  }
  if (params.industries && params.industries.length > 0) {
    query = query.overlaps('industries', params.industries);
  }
  if (params.minRating) {
    query = query.gte('rating', params.minRating);
  }
  if (params.isVerified) {
    query = query.eq('is_verified', true);
  }
  if (params.globalAvailability) {
    query = query.eq('global_availability', true);
  }
  if (params.hasFreeTrial) {
    query = query.not('free_trial', 'is', null).neq('free_trial', 'No free trial');
  }

  // Sorting
  switch (params.sort) {
    case 'rating': query = query.order('rating', { ascending: false }); break;
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    case 'reviews': query = query.order('reviews_count', { ascending: false }); break;
    default: query = query.order('is_verified', { ascending: false }).order('rating', { ascending: false });
  }

  const { limit = 20, offset = 0 } = params;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error || !data) return { agents: [], count: 0 };

  let agents = data.map((agent: AgentDB) => ({
    id: agent.id,
    name: agent.name,
    oneLiner: agent.one_liner,
    logoUrl: agent.logo_url,
    category: agent.category,
    subCategory: agent.sub_category || '',
    summary: agent.summary,
    pricing: agent.pricing,
    rating: agent.rating,
    reviews_count: agent.reviews_count,
    isVerified: agent.is_verified || false,
    tags: agent.tags,
    industries: agent.industries,
    pricingModel: agent.pricing_model,
    globalAvailability: agent.global_availability,
    slug: agent.slug || '',
    isFeatured: agent.is_featured || false
  } as unknown as Agent));

  // If this is the FIRST page and not filtering by featuredOnly, inject featured listings
  if (offset === 0 && !params.featuredOnly) {
    const featured = await getFeaturedAgents(params.categories?.[0], params.categories ? 'featured_category' : 'featured_home');
    const featuredLimited = featured.slice(0, 3);
    const featuredIds = new Set(featuredLimited.map(a => a.id));
    // Filter out featured agents from main list to avoid duplication
    agents = [...featuredLimited, ...agents.filter(a => !featuredIds.has(a.id))];
  }

  return { agents, count: count || 0 };
}

export async function getUniqueIndustries(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('agents')
    .select('industries')
    .eq('approval_status', 'approved');

  if (error || !data) return [];

  const industries = new Set<string>();
  data.forEach(item => {
    if (item.industries && Array.isArray(item.industries)) {
      item.industries.forEach(ind => industries.add(ind));
    }
  });

  return Array.from(industries).sort();
}

export async function getUserStats(userId: string) {
  const supabase = createClient();
  const [{ count: savedCount }, { count: reviewsCount }, { count: comparesCount }] = await Promise.all([
    supabase.from('saved_tools').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('approval_status', 'approved'),
    supabase.from('agent_interactions').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('action_type', 'compare')
  ]);
  return {
    saved: savedCount || 0,
    reviews: reviewsCount || 0,
    compares: comparesCount || 0
  };
}

export async function getRecentlyViewed(userId: string): Promise<Agent[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('agent_interactions')
    .select('agent_id, agents(*)')
    .eq('user_id', userId)
    .eq('action_type', 'view')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (!data) return [];
  const uniqueAgents = new Map();
  data.forEach((row: Record<string, unknown>) => {
    const agent = row.agents as AgentDB;
    if (agent && !uniqueAgents.has(agent.id)) {
      uniqueAgents.set(agent.id, agent);
    }
  });
  return Array.from(uniqueAgents.values()).slice(0, 4).map((a: AgentDB) => ({
    ...a, logoUrl: a.logo_url, oneLiner: a.one_liner, reviews_count: a.reviews_count, isVerified: a.is_verified
  })) as unknown as Agent[];
}

export async function getSavedToolsList(userId: string): Promise<Agent[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('saved_tools')
    .select('agent_id, agents(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (!data) return [];
  return data.map((row: Record<string, unknown>) => row.agents as AgentDB).filter(Boolean).map((a: AgentDB) => ({
    ...a, logoUrl: a.logo_url, oneLiner: a.one_liner, reviews_count: a.reviews_count, isVerified: a.is_verified, slug: a.slug
  })) as unknown as Agent[];
}

export async function getVendorAnalytics(userId: string) {
  const supabase = createClient();
  const { data: agents } = await supabase.from('agents').select('id, name').eq('user_id', userId);
  if (!agents || agents.length === 0) return { views: 0, clicks: 0, saves: 0, topAgents: [] };
  
  const agentIds = agents.map(a => a.id);
  
  // ✅ FIXED: Query for both 'click' and 'cta_click' for backward compatibility during migration
  const [{ count: viewsCount }, clicksData, { count: savesCount }] = await Promise.all([
    supabase.from('agent_interactions').select('*', { count: 'exact', head: true }).in('agent_id', agentIds).eq('action_type', 'view'),
    supabase.from('agent_interactions').select('*', { count: 'exact', head: true }).in('agent_id', agentIds).or('action_type.eq.click,action_type.eq.cta_click'),
    supabase.from('saved_tools').select('*', { count: 'exact', head: true }).in('agent_id', agentIds)
  ]);
  
  return {
    views: viewsCount || 0,
    clicks: clicksData?.count || 0,
    saves: savesCount || 0,
    topAgents: agents
  };
}

export async function getCompareHistory(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('agent_interactions')
    .select('agent_id, created_at, agents(name)')
    .eq('user_id', userId)
    .eq('action_type', 'compare')
    .order('created_at', { ascending: false });
    
  if (!data) return [];
  // Group by date (simple day grouping)
  const grouped: Record<string, { id: string, date: string, agents: number[], type: string }> = {};
  data.forEach((row: Record<string, unknown>) => {
    const d = new Date(row.created_at as string).toISOString().split('T')[0];
    if (!grouped[d]) {
      grouped[d] = { id: d, date: d, agents: [], type: 'Custom Comparison' };
    }
    if (!grouped[d].agents.includes(row.agent_id as number)) {
      grouped[d].agents.push(row.agent_id as number);
    }
  });
  return Object.values(grouped).filter(g => g.agents.length > 0);
}
