import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const industryToCategory: Record<string, string[]> = {
  'saas-tech': ['AI & LLMs', 'Developer Tools & Infra', 'Enterprise & Automation'],
  'marketing-sales': ['Marketing & Sales', 'Customer Experience'],
  'ecommerce-retail': ['Retail & E-Commerce', 'Marketing & Sales'],
  'healthcare': ['Healthcare'],
  'fintech': ['FinTech', 'Enterprise & Automation'],
  'hr-recruitment': ['HR & Workforce'],
  'logistics': ['Logistics & Supply Chain', 'Enterprise & Automation'],
  'agritech': ['AgriTech'],
  'edtech': ['EdTech'],
  'content-creation': ['Marketing & Sales', 'AI & LLMs'],
  'real-estate': ['Customer Experience', 'Marketing & Sales'],
  'other': [],
};

export async function POST(request: NextRequest) {
  try {
    const { industry, problem, size } = await request.json();

    if (!industry || !problem || !size) {
      return NextResponse.json({ error: 'Missing answers' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('CRITICAL: OPENAI_API_KEY is missing from environment variables');
      return NextResponse.json({ error: 'System temporarily unavailable' }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey });
    const supabase = createClient();

    // Get relevant agents from Supabase filtered by industry categories
    const relevantCategories = industryToCategory[industry] || [];

    let query = supabase
      .from('agents')
      .select('id, name, summary, category, rating, slug, one_liner')
      .eq('approval_status', 'approved')
      .order('rating', { ascending: false })
      .limit(30);

    if (relevantCategories.length > 0) {
      query = query.in('category', relevantCategories);
    }

    const { data: agents, error } = await query;
    if (error) {
      console.error('Supabase DB Error:', error);
      throw error;
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Build prompt for OpenAI
    const agentList = agents
      .map(a => `ID: ${a.id} | Name: ${a.name} | Category: ${a.category} | Description: ${a.summary || a.one_liner}`)
      .join('\n');

    const prompt = `
You are an expert B2B AI tool advisor for Parlexa, a global AI agent marketplace.

A business user has answered 3 questions:
- Industry: ${industry}
- Biggest Business Problem: ${problem}
- Company Size: ${size}

Here are the available AI tools on Parlexa:
${agentList}

Your task:
1. Pick the TOP 3 to 5 tools that best match this user's industry, problem, and company size
2. For each tool give a match_score (0-100) based on fit
3. Write a SHORT match_reason (max 12 words) explaining why this tool fits them specifically

Return ONLY a valid JSON array. No other text. Format:
[
  {
    "id": "tool_id_here",
    "match_score": 95,
    "match_reason": "Perfect for SaaS lead generation at startup scale"
  }
]
`;

    let matches = [];
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      });

      const responseText = completion.choices[0].message.content || '[]';
      const cleanText = responseText.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      matches = JSON.parse(cleanText);
    } catch (aiErr) {
      console.error('OpenAI API Error:', aiErr);
      return NextResponse.json(
        { error: 'System temporarily unavailable' },
        { status: 503 }
      );
    }

    // Enrich with full agent data
    const enrichedResults = matches
      .map((match: { id: string; match_score: number; match_reason: string }) => {
        const agent = agents.find(a => String(a.id) === String(match.id));
        if (!agent) return null;
        return {
          ...agent,
          match_score: match.match_score,
          match_reason: match.match_reason,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ results: enrichedResults });

  } catch (err) {
    console.error('AI Finder Match Error:', err);
    return NextResponse.json(
      { error: 'System temporarily unavailable' },
      { status: 500 }
    );
  }
}
