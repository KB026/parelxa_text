import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { aiSearchSchema, safeValidate } from '@/lib/validation';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function getRequestKey(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous';
}

function isRateLimited(key: string) {
  const now = Date.now();
  const bucket = requestBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  requestBuckets.set(key, bucket);
  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  try {
    const requestKey = getRequestKey(req);
    if (isRateLimited(requestKey)) {
      return NextResponse.json(
        { error: 'Too many AI search requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const body = await req.json();
    const validation = safeValidate(aiSearchSchema, body);
    if (!validation.ok) {
      return NextResponse.json({ error: `Invalid request: ${validation.error}` }, { status: 400 });
    }

    const { query } = validation.data;

    const supabase = createClient();

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

    // 2. Try to use Gemini for intelligent reasoning
    try {
      const context = agents?.map(a => `- ${a.name} (${a.category}): ${a.summary || a.one_liner}`).join('\n');

      const prompt = `
        You are Parlexa AI, the intelligent assistant for the Parlexa AI Agent Marketplace.
        User Query: "${query}"
        
        Available Tools from our database:
        ${context || 'No specific matches found in the direct database.'}
        
        TASK:
        1. TONE: Avoid ALL technical jargon (no "multi-channel," "NLP," "operational costs," etc.). Speak like a friendly human assistant.
        2. FORMAT: Start your response exactly with a variation of: "Yes, automating [User's Request] is very much possible, and it can drastically increase the efficiency of your business. Here are a few tools that we would recommend that you could use to get started."
        3. RECOMMENDATIONS: Suggest 2-3 specific tools from the provided list.
        4. NO CATEGORIES: Do not suggest categories or industries. Focus only on the tools.
        5. CONCISENESS: Keep the entire response under 60 words.
        
        Format your response ONLY as a valid JSON object:
        {
          "ai_explanation": "...",
          "recommended_ids": [id1, id2]
        }
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      
      const data = JSON.parse(text);
      
      // Match by ID (handling string/number conversion) or by Name as a fallback
      const recommendedAgents = agents?.filter(a => 
        data.recommended_ids?.some((id: string | number) => String(id) === String(a.id)) ||
        data.recommended_ids?.some((id: string | number) => typeof id === 'string' && id.toLowerCase() === a.name.toLowerCase())
      ) || [];

      // Log the successful AI search
      await supabase.from('search_queries').insert({
        query,
        is_ai_powered: true,
        recommendation_count: recommendedAgents.length
      });

      return NextResponse.json({
        explanation: data.ai_explanation,
        recommendations: recommendedAgents.length > 0 ? recommendedAgents : agents?.slice(0, 3) || [],
        isAIPowered: true
      });
    } catch (aiErr) {
      console.error('CRITICAL: AI Reasoning failed:', aiErr);
      
      // Log the fallback search
      await supabase.from('search_queries').insert({
        query,
        is_ai_powered: false,
        recommendation_count: agents?.slice(0, 3).length || 0
      });

      return NextResponse.json({
        explanation: `Yes, finding tools for "${query}" is very much possible! Here are the best options from our marketplace to help you increase efficiency:`,
        recommendations: agents?.slice(0, 3) || [],
        isAIPowered: false
      });
    }

  } catch (err) {
    console.error('AI Search Error:', err);
    return NextResponse.json({ error: 'Failed to process AI search' }, { status: 500 });
  }
}
