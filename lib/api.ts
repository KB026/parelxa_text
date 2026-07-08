/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from './supabase/client';
import { Agent, AgentDB, Category, Review, ReviewStats, ReviewDB, SearchParams, PromotionDB } from './types';

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient() as any;
  const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
  if (error || !data) {
    console.error('CRITICAL ERROR fetching categories:', error);
    return [];
  }
  return data;
}

export async function getAgents(category?: string): Promise<Agent[]> {
  const supabase = createClient() as any;
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
  const supabase = createClient() as any;
  const { data: agent, error } = await supabase.from('agents').select('*').eq('id', Number(id)).eq('approval_status', 'approved').single();
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
  const supabase = createClient() as any;
  
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
  const supabase = createClient() as any;
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
  const supabase = createClient() as any;
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
  const supabase = createClient() as any;
  
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
  const supabase = createClient() as any;
  
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

  data.forEach((r: any) => {
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
  const supabase = createClient() as any;
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

export async function getFeaturedAgents(limit: number = 8): Promise<Agent[]> {
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_featured', true)
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((agent: AgentDB) => ({
    id: agent.id,
    name: agent.name,
    oneLiner: agent.one_liner,
    logoUrl: agent.logo_url,
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
    slug: agent.slug || '',
    isFeatured: true
  } as Agent));
}

export async function getPaginatedAgents(page: number = 1, limit: number = 24): Promise<{ agents: Agent[], total: number }> {
  const supabase = createClient() as any;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('agents')
    .select('*', { count: 'exact' })
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) return { agents: [], total: 0 };

  const agents = data.map((agent: AgentDB) => ({
    id: agent.id,
    name: agent.name,
    oneLiner: agent.one_liner,
    logoUrl: agent.logo_url,
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
    slug: agent.slug || '',
    isFeatured: agent.is_featured || false
  } as Agent));

  return { agents, total: count || 0 };
}

export async function trackClick(promotionId: string) {
  const supabase = createClient() as any;
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
  const supabase = createClient() as any;
  
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
    const featured = await getFeaturedAgents(3);
    const featuredIds = new Set(featured.map((a: any) => a.id));
    // Filter out featured agents from main list to avoid duplication
    agents = [...featured, ...agents.filter((a: any) => !featuredIds.has(a.id))];
  }

  return { agents, count: count || 0 };
}

export async function getUniqueIndustries(): Promise<string[]> {
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('agents')
    .select('industries')
    .eq('approval_status', 'approved');

  if (error || !data) return [];

  const industries = new Set<string>();
  data.forEach((item: any) => {
    if (item.industries && Array.isArray(item.industries)) {
      item.industries.forEach((ind: any) => industries.add(ind));
    }
  });

  return Array.from(industries).sort();
}

export async function getUserStats(userId: string) {
  const supabase = createClient() as any;
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
  const supabase = createClient() as any;
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

export async function getSavedToolsList(userId: string, folderId?: string | null): Promise<Agent[]> {
  const supabase = createClient() as any;
  let query = supabase
    .from('saved_tools')
    .select('agent_id, folder_id, agents!saved_tools_agent_id_fkey(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (folderId !== undefined) {
    if (folderId === null) {
      query = query.is('folder_id', null);
    } else {
      query = query.eq('folder_id', folderId);
    }
  }

  const { data } = await query;
    
  if (!data) return [];
  return data.map((row: Record<string, unknown>) => {
    const a = row.agents as AgentDB;
    if (!a) return null;
    return {
      ...a, 
      logoUrl: a.logo_url, 
      oneLiner: a.one_liner, 
      reviews_count: a.reviews_count, 
      isVerified: a.is_verified, 
      slug: a.slug,
      folder_id: row.folder_id // Pass the folder_id for UI state
    };
  }).filter(Boolean) as unknown as Agent[];
}

export async function getVendorAnalytics(userId: string) {
  const supabase = createClient() as any;
  const { data: agents } = await supabase.from('agents').select('id, name').eq('user_id', userId);
  if (!agents || agents.length === 0) return { views: 0, clicks: 0, saves: 0, topAgents: [] };
  
  const agentIds = agents.map((a: any) => a.id);
  
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

export async function getCompareHistory(userId: string, supabaseClient?: any) {
  const supabase = supabaseClient || (createClient() as any);
  const { data } = await supabase
    .from('agent_interactions')
    .select('agent_id, created_at, comparison_id, agents(name)')
    .eq('user_id', userId)
    .eq('action_type', 'compare')
    .order('created_at', { ascending: false });
    
  if (!data) return [];
  // Group by comparison_id
  const grouped: Record<string, { id: string, date: string, agents: number[], type: string }> = {};
  data.forEach((row: Record<string, unknown>) => {
    // Fallback to date grouping if comparison_id is missing for old records
    const d = new Date(row.created_at as string).toISOString().split('T')[0];
    const compId = (row.comparison_id as string) || d;
    
    if (!grouped[compId]) {
      grouped[compId] = { id: compId, date: row.created_at as string, agents: [], type: 'Custom Comparison' };
    }
    if (!grouped[compId].agents.includes(row.agent_id as number)) {
      grouped[compId].agents.push(row.agent_id as number);
    }
  });
  return Object.values(grouped).filter(g => g.agents.length > 0);
}
