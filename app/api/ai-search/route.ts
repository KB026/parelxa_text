/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { aiSearchSchema, safeValidate } from '@/lib/validation';

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
You are Parlexa AI, an intelligent assistant for the Parlexa AI Agent Marketplace.
User Query: "${query}"
Available Tools:
${context || 'No specific matches found in the direct database.'}
TASK:

Determine if there is ONE tool that is a strong, near-exact match to the user's query (i.e. it directly and specifically does what they asked for, not just loosely related).
If such an exact match exists: return it FIRST with match_type: "exact", followed by 2 more tools that are related/complementary with match_type: "related".
If NO tool is a strong exact match: return your best 3 related tools, ALL with match_type: "related", and set exact_match_found: false in the response.
If an exact match WAS found, set exact_match_found: true.
Always return exactly 3 recommendations total (or fewer only if the tool list genuinely has fewer than 3 relevant options).
Write a friendly, jargon-free explanation (ai_explanation) starting with "Yes, [rephrase of their need] is very much possible..." under 60 words.
For EACH of the recommended tools, write a short 1-2 sentence search_description that explains HOW that specific tool helps with THIS SPECIFIC QUERY (not a generic summary — tie it back to what the user searched for).
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

      return NextResponse.json({
        explanation: data.ai_explanation,
        exactMatchFound: data.exact_match_found || false,
        recommendations: recommendedAgents.length > 0 ? recommendedAgents : agents?.slice(0, 3) || [],
        isAIPowered: true
      });
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
