import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const categoriesParam = request.nextUrl.searchParams.get('categories');
  const categories = categoriesParam ? categoriesParam.split(',').filter(Boolean) : [];
  
  if ((!query || query.trim().length < 2) && categories.length === 0) {
    return NextResponse.json({ agents: [] });
  }

  const supabase = createClient();

  // STEP 1: Keyword match + filters
  let dbQuery = supabase
    .from('agents')
    .select('*')
    .eq('approval_status', 'approved')
    .or(`listing_expires_at.gt.${new Date().toISOString()},listing_expires_at.is.null`);

  if (categories.length > 0) {
    dbQuery = dbQuery.in('category', categories);
  }

  if (query && query.trim().length >= 2) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,summary.ilike.%${query}%,category.ilike.%${query}%`);
  }

  let { data: keywordMatches } = await dbQuery.limit(30);

  // STEP 1.5: Fuzzy search fallback if exact matches are too few
  if (query && query.trim().length >= 2 && (!keywordMatches || keywordMatches.length < 3)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: fuzzyMatches } = await supabase.rpc('fuzzy_search_agents' as any, { 
      search_query: query 
    });

    if (fuzzyMatches && fuzzyMatches.length > 0) {
      // Filter fuzzy matches by categories if any are active
      let filteredFuzzy = fuzzyMatches;
      if (categories.length > 0) {
        filteredFuzzy = filteredFuzzy.filter((a: Record<string, unknown>) => categories.includes(a.category as string));
      }

      const existingIds = new Set((keywordMatches || []).map(a => a.id));
      const uniqueFuzzy = filteredFuzzy.filter((a: Record<string, unknown>) => !existingIds.has(a.id as number));
      
      keywordMatches = [...(keywordMatches || []), ...uniqueFuzzy].slice(0, 30);
    }
  }

  if (!keywordMatches || keywordMatches.length === 0) {
    // Log search if there was a query
    if (query && query.trim().length >= 2) {
      await supabase.from('search_queries').insert({
        query,
        recommendation_count: 0,
        is_ai_powered: false,
      });
    }
    return NextResponse.json({ agents: [] });
  }

  // Helper to map DB row to Agent frontend model
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapToAgent = (agent: any) => ({
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
  });

  // If no valid text query, just return the filtered category results without AI ranking
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ agents: keywordMatches.map(mapToAgent) });
  }

  // Initialize OpenAI dynamically inside handler to prevent module-load crashes
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // STEP 2: AI ranking via OpenAI
  const agentList = keywordMatches
    .map(a => `${a.name} (${a.category}): ${a.summary}`)
    .join('\n');

  const prompt = `User searched: "${query}"
  
These agents matched:
${agentList}

Rank these agents by relevance to the search. Return ONLY a JSON array of agent names in ranked order.
["Best Agent", "Second Best", ...]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const responseText = completion.choices[0].message.content || '[]';
    const cleanText = responseText.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
    const rankedNames = JSON.parse(cleanText);

    // Reorder by AI ranking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rankedAgents = rankedNames
      .map((name: string) => keywordMatches.find(a => a.name === name))
      .filter(Boolean)
      .slice(0, 10);

    // STEP 3: Log with is_ai_powered: TRUE
    await supabase.from('search_queries').insert({
      query,
      recommendation_count: rankedAgents.length,
      is_ai_powered: true,
    });

    return NextResponse.json({ agents: rankedAgents.map(mapToAgent) });

  } catch (err) {
    console.error('AI ranking failed, returning keyword matches:', err);
    
    // Fallback: return keyword matches without AI
    await supabase.from('search_queries').insert({
      query,
      recommendation_count: keywordMatches.length,
      is_ai_powered: false,
    });

    return NextResponse.json({ agents: keywordMatches.slice(0, 10).map(mapToAgent) });
  }
}
