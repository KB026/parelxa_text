import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface SubScore {
  score: number; // 0-10
  reason: string;
}

export interface AiScores {
  business_application: SubScore;
  user_friendliness: SubScore;
  ui_ux_design: SubScore;
  foundation_leadership: SubScore;
  indian_pricing: SubScore;
}

// Everything this function needs from the `agents` row + vendor form fields.
export interface AgentForScoring {
  name: string;
  summary: string | null;
  use_cases?: string | null;
  category?: string | null;
  raw_industry?: string | null;
  demo_url?: string | null;
  video_url?: string | null;
  screenshots?: string[] | null;
  logo_url?: string | null;
  founders?: string | null;
  founded_year?: number | null;
  team_size?: string | null;
  company_linkedin?: string | null;
  company_name?: string | null;
  city?: string | null;
  has_india_pricing?: boolean | null;
  inr_price?: string | null;
  pricing_model?: string | null;
  pricing?: string | null;
  free_trial?: string | null;
  company_gstin?: string | null;
  is_verified?: boolean | null;
  verification_status?: string | null;
  website?: string | null;
}

// ---------------------------------------------------------------------------
// STEP 1: Indian Sensitive Pricing — pure rules, no AI call needed.
// ---------------------------------------------------------------------------
export function scoreIndianPricing(agent: AgentForScoring): SubScore {
  let score = 0;
  const reasons: string[] = [];

  if (agent.has_india_pricing && agent.inr_price) {
    score += 4;
    reasons.push('has India-specific INR pricing');
  } else {
    reasons.push('no India-specific pricing listed');
  }

  if (agent.free_trial === 'Yes' || agent.free_trial === 'Free Tier') {
    score += 3;
    reasons.push('offers a free trial or free tier');
  }

  if (agent.pricing_model === 'Free' || agent.pricing_model === 'Freemium') {
    score += 1;
  }

  if (agent.company_gstin && agent.company_gstin.trim().length > 0) {
    score += 2;
    reasons.push('has a registered GSTIN on file');
  }

  score = Math.min(score, 10);

  return {
    score,
    reason: reasons.join('; ') || 'No pricing details provided.',
  };
}

// ---------------------------------------------------------------------------
// STEP 2: The 4 dimensions Gemini judges.
// ---------------------------------------------------------------------------
async function scoreWithGemini(
  agent: AgentForScoring
): Promise<Omit<AiScores, 'indian_pricing'>> {
  // Model name locked to gemini-flash-latest — do not swap to gemini-2.5-flash
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `
You are scoring a submitted AI tool listing for a marketplace. Score each dimension 0-10 with a short reason (max 2 sentences each).

TOOL INFO:
Name: ${agent.name || 'not provided'}
Summary: ${agent.summary || 'not provided'}
Use cases: ${agent.use_cases ?? 'not provided'}
Category: ${agent.category ?? 'not provided'}
Industry: ${agent.raw_industry ?? 'not provided'}
Demo URL: ${agent.demo_url ?? 'not provided'}
Video URL: ${agent.video_url ?? 'not provided'}
Screenshots provided: ${agent.screenshots?.length ?? 0}
Logo provided: ${agent.logo_url ? 'yes' : 'no'}
Founders: ${agent.founders ?? 'not provided'}
Founded year: ${agent.founded_year ?? 'not provided'}
Team size: ${agent.team_size ?? 'not provided'}
Company LinkedIn: ${agent.company_linkedin ?? 'not provided'}
Company name: ${agent.company_name ?? 'not provided'}
City: ${agent.city ?? 'not provided'}

Score these 4 dimensions:
1. business_application — Is the use case clear, specific, and viable as a business tool? Base this on the summary, use cases, and category.
2. user_friendliness — Base this on whether a demo or video walkthrough is provided and what it suggests about ease of use. Do not judge screenshots here.
3. ui_ux_design — Base this on whether screenshots and a logo are provided and whether the description suggests a polished, professional product. Do not judge the demo/video here.
4. foundation_leadership — Base this on founders, founding year, team size, company LinkedIn, and company name. Does this look like a credible, real company?

If a field is "not provided," score the relevant dimension conservatively but do not let it drag down dimensions that don't depend on it.

Return ONLY valid JSON, no markdown formatting, no preamble, in exactly this shape:
{
  "business_application": {"score": 0-10, "reason": "..."},
  "user_friendliness": {"score": 0-10, "reason": "..."},
  "ui_ux_design": {"score": 0-10, "reason": "..."},
  "foundation_leadership": {"score": 0-10, "reason": "..."}
}
`.trim();

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  let parsed: Omit<AiScores, 'indian_pricing'>;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini invalid JSON:', cleaned);
    throw new Error(`Gemini returned invalid JSON, could not parse: ${cleaned}`);
  }

  const clamp = (n: any) => Math.max(0, Math.min(10, Number(n) || 0));

  return {
    business_application: {
      score: clamp(parsed.business_application?.score),
      reason: parsed.business_application?.reason || 'No reasoning provided.',
    },
    user_friendliness: {
      score: clamp(parsed.user_friendliness?.score),
      reason: parsed.user_friendliness?.reason || 'No reasoning provided.',
    },
    ui_ux_design: {
      score: clamp(parsed.ui_ux_design?.score),
      reason: parsed.ui_ux_design?.reason || 'No reasoning provided.',
    },
    foundation_leadership: {
      score: clamp(parsed.foundation_leadership?.score),
      reason: parsed.foundation_leadership?.reason || 'No reasoning provided.',
    },
  };
}

// ---------------------------------------------------------------------------
// STEP 3: Verified Badge bonus — applied only to Foundation/Leadership.
// ---------------------------------------------------------------------------
export function applyVerificationBonus(
  foundationScore: SubScore,
  isVerified?: boolean | null,
  verificationStatus?: string | null
): SubScore {
  const isFullyVerified =
    isVerified === true || verificationStatus === 'verified';

  if (!isFullyVerified) return foundationScore;

  const boosted = Math.min(foundationScore.score + 2, 10);
  return {
    score: boosted,
    reason: `${foundationScore.reason} (+2 for completed vendor verification — legal, domain, and product proof on file.)`,
  };
}

// ---------------------------------------------------------------------------
// MAIN ENTRY POINT — call this from send-to-review/route.ts
// ---------------------------------------------------------------------------
export async function scoreAgent(agent: AgentForScoring): Promise<AiScores> {
  const [geminiScores, indianPricing] = await Promise.all([
    scoreWithGemini(agent),
    Promise.resolve(scoreIndianPricing(agent)),
  ]);

  const foundationWithBonus = applyVerificationBonus(
    geminiScores.foundation_leadership,
    agent.is_verified,
    agent.verification_status
  );

  return {
    ...geminiScores,
    foundation_leadership: foundationWithBonus,
    indian_pricing: indianPricing,
  };
}

// ---------------------------------------------------------------------------
// Combined average across all active dimensions (with legacy support).
// ---------------------------------------------------------------------------
export function computeAiAverage(scores: any): number {
  if (!scores || typeof scores !== 'object') return 0;

  const keys5 = [
    'business_application',
    'user_friendliness',
    'ui_ux_design',
    'foundation_leadership',
    'indian_pricing',
  ];

  const hasKeys5 = keys5.some(
    k => scores[k] && typeof scores[k].score === 'number'
  );

  if (hasKeys5) {
    const validScores = keys5
      .map(k => scores[k]?.score)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s));

    if (validScores.length === 0) return 0;
    const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    return Math.round(avg * 10) / 10;
  }

  // Legacy 3-dimension fallback (clarity, credibility, visual)
  const keys3 = ['clarity', 'credibility', 'visual'];
  const validScores3 = keys3
    .map(k => scores[k]?.score)
    .filter((s): s is number => typeof s === 'number' && !isNaN(s));

  if (validScores3.length > 0) {
    const avg = validScores3.reduce((a, b) => a + b, 0) / validScores3.length;
    return Math.round(avg * 10) / 10;
  }

  // Generic sub-score fallback
  const allSubScores = Object.values(scores)
    .map((v: any) => v?.score)
    .filter((s): s is number => typeof s === 'number' && !isNaN(s));

  if (allSubScores.length > 0) {
    const avg = allSubScores.reduce((a, b) => a + b, 0) / allSubScores.length;
    return Math.round(avg * 10) / 10;
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Backwards-compatible v1 wrapper function
// ---------------------------------------------------------------------------
export async function scoreToolWithAI(agent: {
  summary: string | null;
  website: string | null;
  screenshots: string[] | null;
  name?: string;
  [key: string]: any;
}): Promise<{ ai_score: number; ai_scores: any }> {
  const fullAgent: AgentForScoring = {
    ...agent,
    name: agent.name || 'Unnamed Agent',
    summary: agent.summary,
  };

  const scores = await scoreAgent(fullAgent);
  const ai_score = computeAiAverage(scores);

  return {
    ai_score,
    ai_scores: scores,
  };
}