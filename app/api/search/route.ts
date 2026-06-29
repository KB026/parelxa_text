import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ agents: [] });
  }

  const supabase = createClient();

  // STEP 1: Keyword match
  const { data: keywordMatches } = await supabase
    .from('agents')
    .select('id, name, summary, category, rating, slug')
    .eq('approval_status', 'approved')
    .or(`name.ilike.%${query}%,summary.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(30);

  if (!keywordMatches || keywordMatches.length === 0) {
    // Log search
    await supabase.from('search_queries').insert({
      query,
      recommendation_count: 0,
      is_ai_powered: false,
    });
    return NextResponse.json({ agents: [] });
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

    return NextResponse.json({ agents: rankedAgents });

  } catch (err) {
    console.error('AI ranking failed, returning keyword matches:', err);
    
    // Fallback: return keyword matches without AI
    await supabase.from('search_queries').insert({
      query,
      recommendation_count: keywordMatches.length,
      is_ai_powered: false,
    });

    return NextResponse.json({ agents: keywordMatches.slice(0, 10) });
  }
}
