/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { aiSearchSchema, safeValidate } from '@/lib/validation';

export const maxDuration = 60;

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;

function getRequestKey(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous';
}

async function isRateLimited(key: string, supabase: SupabaseClient) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

  // Attempt to fetch existing record
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('count, reset_at')
    .eq('key', key)
    .single();

  if (!existing || new Date(existing.reset_at) <= now) {
    // Upsert new or reset bucket
    await supabase.from('rate_limits').upsert({
      key,
      count: 1,
      reset_at: resetAt.toISOString()
    }, { onConflict: 'key' });
    return false;
  }

  const newCount = existing.count + 1;
  await supabase.from('rate_limits').update({ count: newCount }).eq('key', key);

  return newCount > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const requestKey = getRequestKey(req);
    
    if (await isRateLimited(requestKey, supabase)) {
      return NextResponse.json(
        { error: 'Too many AI search requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    // Initialize OpenAI dynamically
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const body = await req.json();
    const validation = safeValidate(aiSearchSchema, body);
    if (!validation.ok) {
      return NextResponse.json({ error: `Invalid request: ${validation.error}` }, { status: 400 });
    }

    const { query } = validation.data;
    const queryHash = query.toLowerCase().trim();

    // 0. Check the Edge Cache first
    const { data: cachedData } = await supabase
      .from('ai_search_cache' as any)
      .select('response_json, created_at')
      .eq('query_hash', queryHash)
      .eq('route', 'ai-search')
      .single();
    
    const cached = cachedData as any;

    if (cached) {
      // Check if cache is still valid (e.g. 7 days)
      const isExpired = new Date().getTime() - new Date(cached.created_at).getTime() > 7 * 24 * 60 * 60 * 1000;
      if (!isExpired) {
        // Log the cached AI search
        await supabase.from('search_queries').insert({
          query,
          is_ai_powered: true,
          recommendation_count: cached.response_json.recommendations?.length || 0
        });
        
        return NextResponse.json({ ...cached.response_json, fromCache: true });
      }
    }

    // 1. Fetch ALL relevant tools to provide full context to the AI
    // Limit the context window to keep cost and latency under control.
    const { data: rawAgents, error } = await supabase
      .from('agents')
      .select('id, name, summary, category, one_liner, slug')
      .eq('approval_status', 'approved')
      .limit(40);

    if (error) throw error;

    const agents = rawAgents?.map(a => ({
      ...a,
      oneLiner: a.one_liner
    }));

    // 2. Try to use OpenAI for intelligent reasoning
    try {
      const context = agents?.map(a => `ID: ${a.id} | Name: ${a.name} | Category: ${a.category} | Description: ${a.summary || a.one_liner}`).join('\n');

      const prompt = `
You are Parlexa AI, a sharp, highly technical, and dynamic AI software curator for the Parlexa AI Agent Marketplace. Your tone is conversational, smart, and charming.

User Query: "${query}"

Available Tools:
${context || 'No specific matches found in the direct database.'}

TASK:

1. Identify Mismatches: If the user searches for something completely unrelated to SaaS/AI (e.g., "shoes", "best food"), acknowledge the mismatch playfully in the ai_explanation (e.g., "Looks like you took a wrong turn! I specialize in AI tools, not ${query}. Try searching for 'Video Generators' instead!"). Set exact_match_found to false and return an EMPTY recommendations array.
2. Determine Matches: If the query IS relevant, determine if there is a tool that is a strong conceptual match (~85% similarity or higher, tolerate misspellings/variations).
   - If an ~85% conceptual match exists, return it FIRST with match_type: "exact", followed by 2 more complementary tools with match_type: "related". Set exact_match_found to true.
   - If no tool meets the ~85% threshold, return your best 3 related tools, ALL with match_type: "related", and set exact_match_found to false.
   - Return exactly 3 recommendations (unless the query is totally unrelated, then 0).
3. The Insight (ai_explanation): Write a punchy, 1-2 sentence executive summary explaining *why* the top tool was chosen for this specific query. NEVER use generic filler phrases like "Yes, [topic] is possible with the right tools." Be sharp and insightful.
4. Dynamic Tool Descriptions (search_description): For EACH recommended tool, write a short, action-oriented 1-2 sentence description highlighting its Unique Selling Point (USP) directly tied to the user's query. STRICTLY FORBIDDEN: Do not use repetitive phrasing (e.g., do not say "X is a video tool perfect for your video needs").

Return ONLY valid JSON, no markdown fences:
{
"ai_explanation": "...",
"exact_match_found": true,
"recommendations": [
{ "id": "tool_id", "search_description": "...", "match_type": "exact" },
{ "id": "tool_id", "search_description": "...", "match_type": "related" },
{ "id": "tool_id", "search_description": "...", "match_type": "related" }
]
}
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      let text = completion.choices[0].message.content || '{}';
      text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      
      const data = JSON.parse(text);
      
      // Match by ID (handling string/number conversion) or by Name as a fallback
      const recommendedAgents = data.recommendations?.map((rec: any) => {
        const agent = agents?.find(a => String(a.id) === String(rec.id) || a.name.toLowerCase() === String(rec.id).toLowerCase());
        if (agent) {
          return {
            ...agent,
            aiDescription: rec.search_description,
            matchType: rec.match_type
          };
        }
        return null;
      }).filter(Boolean) || [];

      // Log the successful AI search
      await supabase.from('search_queries').insert({
        query,
        is_ai_powered: true,
        recommendation_count: recommendedAgents.length
      });

      const responsePayload = {
        explanation: data.ai_explanation,
        exactMatchFound: data.exact_match_found || false,
        recommendations: recommendedAgents.length > 0 ? recommendedAgents : agents?.slice(0, 3) || [],
        isAIPowered: true
      };

      // Save to cache asynchronously so we don't block the response
      supabase.from('ai_search_cache' as any).upsert({
        query_hash: queryHash,
        route: 'ai-search',
        response_json: responsePayload
      }, { onConflict: 'query_hash, route' }).then(({ error: cacheErr }) => {
        if (cacheErr) console.error('Failed to save to AI cache:', cacheErr);
      });

      return NextResponse.json(responsePayload);
    } catch (aiErr) {
      console.error('CRITICAL: AI Reasoning failed:', aiErr);
      
      // Fallback search logic using keyword matching instead of raw slice
      const searchStr = query.toLowerCase();
      const fallbackAgents = agents?.filter(a => 
        a.name.toLowerCase().includes(searchStr) || 
        (a.summary && a.summary.toLowerCase().includes(searchStr)) || 
        (a.category && a.category.toLowerCase().includes(searchStr)) ||
        (a.one_liner && a.one_liner.toLowerCase().includes(searchStr))
      ).slice(0, 3) || [];

      // Log the fallback search
      await supabase.from('search_queries').insert({
        query,
        is_ai_powered: false,
        recommendation_count: fallbackAgents.length
      });

      return NextResponse.json({
        explanation: `Yes, finding tools for "${query}" is very much possible! Here are the best options from our marketplace to help you increase efficiency:`,
        exactMatchFound: false,
        recommendations: fallbackAgents.map(a => ({ ...a, matchType: 'related' })),
        isAIPowered: false
      });
    }

  } catch (err) {
    console.error('AI Search Error:', err);
    return NextResponse.json({ error: 'Failed to process AI search' }, { status: 500 });
  }
}
