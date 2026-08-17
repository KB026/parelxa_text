import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

interface TopicData {
  topic: string;
  category: string;
  keywords: string[];
  summary: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface GeneratedBlogJson {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  faqs: FAQ[];
  meta_title: string;
  meta_description: string;
}

export default async (req: Request) => {
  const timestamp = Date.now();
  console.log(`====================================================`);
  console.log(`🤖 WEEKLY BLOG AGENT — Execution Started at ${new Date(timestamp).toISOString()}`);
  console.log(`====================================================`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    const errMsg = '[weekly-blog-agent] ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables';
    console.error(errMsg);
    return new Response(JSON.stringify({ success: false, error: errMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // STEP 0: TOPIC DEDUPLICATION — Fetch recent titles from past 90 days (both published and draft)
  console.log('\n--- Step 0: Fetching Covered Topics from Past 90 Days for Deduplication ---');
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: recentPosts, error: recentErr } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, created_at')
    .gte('created_at', ninetyDaysAgo);

  const coveredTopicsText = (recentPosts && recentPosts.length > 0)
    ? recentPosts.map(p => `- "${p.title}" (slug: ${p.slug})`).join('\n')
    : '- None';

  console.log(`[weekly-blog-agent] Found ${recentPosts?.length || 0} covered topic(s) in past 90 days:`);
  console.log(coveredTopicsText);

  // STEP 1: TREND RESEARCH STEP (Generate 2 Distinct Topics from Different Categories)
  console.log('\n--- Step 1: Researching 2 Distinct Industry Topics via Gemini Grounding ---');
  let trendTopics: TopicData[] | null = null;

  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        tools: [{ googleSearch: {} }] as any
      });

      const researchPrompt = `
You are an enterprise AI research director for Parlexa (https://parlexa.in), an enterprise AI tool directory marketplace.
Research current AI industry trends, news, and releases from the past month relevant to enterprise AI categories (e.g., Sales AI, Support AI, HR AI, Fintech AI, Sovereign/Indic AI, Developer Tools & Infra, Security & Compliance).

TOPIC DEDUPLICATION REQUIREMENT:
Do NOT choose any topic substantially similar to these already-covered topics from the past 90 days:
${coveredTopicsText}

Select TWO (2) completely distinct, timely, narrow topics suitable for ~1000-1200 word technical enterprise blog posts.
CRITICAL: The 2 topics MUST belong to DIFFERENT categories (e.g., one Developer Tools & Infra + one HR & Workforce AI).

Output a JSON array ONLY with 2 objects matching this exact format:
[
  {
    "topic": "Name of distinct topic 1",
    "category": "Developer Tools & Infra | HR & Workforce | Sales & Revenue AI | FinTech & Compliance | Sovereign & Vertical AI | Customer Experience",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "summary": "Brief 2-sentence summary of why this topic is timely"
  },
  {
    "topic": "Name of distinct topic 2",
    "category": "Different Category Name",
    "keywords": ["keyword4", "keyword5", "keyword6"],
    "summary": "Brief 2-sentence summary of why this topic is timely"
  }
]
      `;

      const result = await model.generateContent(researchPrompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          trendTopics = parsed.slice(0, 2);
        }
      }
    } catch (err: any) {
      console.warn('[weekly-blog-agent] Gemini Grounding Research API error:', err.message);
    }
  }

  // Fallback 2 distinct topics if Gemini API quota is exceeded
  if (!trendTopics || trendTopics.length < 2) {
    console.log('[weekly-blog-agent] Using 2 distinct fallback trend grounding topics from different categories...');
    trendTopics = [
      {
        topic: 'Zero-Trust Agentic Workflows & Multi-LLM Observability in Enterprise DevOps (2026)',
        category: 'Developer Tools & Infra',
        keywords: ['Developer Tools', 'LLM Observability', 'Zero-Trust AI', 'DevOps Agents', 'Traceability'],
        summary: 'With multi-agent DevOps deployment expanding, enterprises are implementing zero-trust access boundaries and real-time LLM telemetry observability.'
      },
      {
        topic: 'Autonomous AI Recruiter Agents & Multilingual Candidate Screening Engines in 2026',
        category: 'HR & Workforce',
        keywords: ['HR AI', 'Recruiting Agents', 'Multilingual Screening', 'Talent Analytics', 'Bias Auditing'],
        summary: 'Enterprises are deploying autonomous AI recruiter engines to conduct structured, multi-dialect preliminary candidate evaluations and automated bias auditing.'
      }
    ];
  }

  console.log(`📌 Topic 1: "${trendTopics[0].topic}" (${trendTopics[0].category})`);
  console.log(`📌 Topic 2: "${trendTopics[1].topic}" (${trendTopics[1].category})`);

  // STEP 2 & 3: GENERATE EXACTLY 2 DRAFT POSTS (One for each distinct topic)
  const insertedPosts: any[] = [];

  for (let i = 0; i < trendTopics.length; i++) {
    const trendData = trendTopics[i];
    console.log(`\n====================================================`);
    console.log(`📝 Processing Draft #${i + 1} / 2: "${trendData.topic}"`);
    console.log(`====================================================`);

    // Fetch verified tools from Supabase `agents` table matching topic category/keywords
    const { data: matchedTools, error: toolErr } = await supabase
      .from('agents')
      .select('name, slug, category, raw_industry, one_liner, summary, description, rating, reviews_count, pricing_model, has_india_pricing')
      .eq('approval_status', 'approved')
      .not('slug', 'is', null)
      .neq('slug', '')
      .order('rating', { ascending: false })
      .limit(40);

    if (toolErr || !matchedTools || matchedTools.length === 0) {
      console.error(`[weekly-blog-agent] ERROR: Tool cross-reference query returned zero tools for topic #${i + 1}. Skipping.`);
      continue;
    }

    const validTools = matchedTools.filter(t => t.slug && typeof t.slug === 'string' && t.slug.trim().length > 0);

    let relevantTools = validTools.filter(t => 
      t.category === trendData.category || 
      trendData.keywords.some(kw => 
        t.name.toLowerCase().includes(kw.toLowerCase()) || 
        (t.raw_industry && t.raw_industry.toLowerCase().includes(kw.toLowerCase())) ||
        (t.one_liner && t.one_liner.toLowerCase().includes(kw.toLowerCase()))
      )
    );

    if (relevantTools.length < 3) {
      relevantTools = validTools.slice(i * 4, (i + 1) * 4 + 4);
    }

    const verifiedToolList = relevantTools.slice(0, 6).map(t => {
      const numericRating = (typeof t.rating === 'number' && t.rating > 0) ? `${t.rating.toFixed(1)}★` : 'N/A';
      
      let displayPricing = 'Contact for pricing';
      if (t.pricing_model && typeof t.pricing_model === 'string') {
        const pm = t.pricing_model.trim().toLowerCase();
        if (pm === 'free') displayPricing = 'Free';
        else if (pm === 'freemium') displayPricing = 'Freemium';
        else if (pm === 'paid') displayPricing = 'Paid';
        else if (pm === 'contact' || pm === 'contact for pricing') displayPricing = 'Contact for pricing';
        else if (pm !== 'unknown') displayPricing = t.pricing_model;
      }

      return {
        name: t.name,
        slug: t.slug,
        category: t.category || 'Enterprise AI',
        one_liner: t.one_liner || t.summary || '',
        rating: numericRating,
        pricing_model: displayPricing,
        has_india_pricing: t.has_india_pricing ? 'Yes' : 'No'
      };
    });

    const verifiedSlugs = verifiedToolList.map(t => t.slug);
    console.log(`✅ Verified Tool Records for Draft #${i + 1} (${verifiedToolList.length} tools):`);
    verifiedToolList.forEach(t => console.log(`   - ${t.name} (slug: ${t.slug}, rating: ${t.rating}, pricing: ${t.pricing_model})`));

    // Prompt for Content Generation
    const generationPrompt = `
You are an expert enterprise AI architecture writer for Parlexa (https://parlexa.in), an enterprise AI tool directory marketplace.
Write an in-depth, authoritative, highly engaging technical blog post (~1000-1200 words) on the following topic:

Topic: "${trendData.topic}"
Category: "${trendData.category}"
Background Context: "${trendData.summary}"

VERIFIED PARLEXA TOOLS DIRECTORY GROUNDING:
${JSON.stringify(verifiedToolList, null, 2)}

STRICT NO-HALLUCINATION & FACT ACCURACY RULES:
1. "Only state facts about specific tools that are directly present in the provided database fields. Never invent capability, performance, speed, or rating claims not present in the source data."
2. COMPARISON TABLES: If you include a comparison table for tools, it MUST ONLY contain columns for fields directly present in the provided source data (such as Name, Category, Rating, Pricing Model, India Pricing).
   - RATING COLUMN: Must ONLY display numeric star ratings from source data (e.g. '4.6★'). Never label verification status ('Verified') or non-numeric words as a rating. If rating is 'N/A', display 'N/A'.
   - PRICING MODEL COLUMN: Must use clean, professional labels such as 'Free', 'Freemium', 'Paid', or 'Contact for pricing'. NEVER output 'Unknown' or 'null' as a pricing label.
3. INTERNAL LINKS: In the main markdown body text (outside of FAQs and headers), embed 3-4 internal markdown links to verified tools using syntax [Tool Name](/products/slug) ONLY for slugs present in the provided list. Do NOT invent, guess, or output any product slug or internal URL that is NOT in the exact verified list above.
4. FAQ PLAIN TEXT REQUIREMENT: FAQ answer text MUST be plain text only with NO markdown links or bracketed link syntax like [Name](/products/slug). Refer to tools by plain text name only.

WRITING & STRUCTURAL REQUIREMENTS:
1. Title: Create a compelling 2026 enterprise title.
2. Unique Kebab-case Slug: Generate a unique kebab-case slug for this post.
3. Excerpt: A sharp 1-2 sentence executive summary.
4. Body (Markdown, ~1000-1200 words):
   - Starts with "## Executive Summary"
   - Contains 3-4 structured sections with H2 ("## ") and H3 ("### ") headings
   - Includes a markdown comparison table ONLY using verified DB fields
   - Embeds 3-4 internal markdown links to verified tools from the list above using syntax [Tool Name](/products/slug)
   - Platform Fact: Always refer to Parlexa as indexing "200+ verified AI tools" if catalog size is mentioned.
5. FAQs: Exactly 3 to 4 FAQ pairs in an array of objects: [ { "question": "...", "answer": "..." } ] for AEO/Schema. Answers MUST be plain text with NO markdown links.
6. Metadata: meta_title (max 60 chars) and meta_description (max 150 chars).

OUTPUT JSON SCHEMA ONLY (no text outside JSON):
{
  "title": "String",
  "slug": "kebab-case-string",
  "excerpt": "String",
  "body": "Markdown text string",
  "faqs": [
    { "question": "String", "answer": "String (plain text only)" },
    { "question": "String", "answer": "String (plain text only)" },
    { "question": "String", "answer": "String (plain text only)" }
  ],
  "meta_title": "String",
  "meta_description": "String"
}
    `;

    let blogOutput: GeneratedBlogJson | null = null;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(generationPrompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) blogOutput = JSON.parse(jsonMatch[0]);
      } catch (e: any) {
        console.warn(`[weekly-blog-agent] Gemini API quota limit on draft #${i + 1}, switching to OpenAI:`, e.message);
      }
    }

    if (!blogOutput && openaiKey) {
      try {
        console.log(`[weekly-blog-agent] Using OpenAI gpt-4o-mini for draft #${i + 1}...`);
        const openai = new OpenAI({ apiKey: openaiKey });
        const res = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: generationPrompt }],
          response_format: { type: 'json_object' }
        });
        blogOutput = JSON.parse(res.choices[0].message.content || '{}');
      } catch (e: any) {
        console.error(`[weekly-blog-agent] OpenAI generation error on draft #${i + 1}:`, e.message);
      }
    }

    if (!blogOutput || !blogOutput.body || !blogOutput.slug) {
      console.error(`[weekly-blog-agent] ERROR: Content generation failed for draft #${i + 1}. Skipping.`);
      continue;
    }

    // Ensure unique slug in DB
    let finalSlug = blogOutput.slug;
    const { data: existingPost } = await supabase.from('blog_posts').select('id').eq('slug', finalSlug).maybeSingle();
    if (existingPost) {
      finalSlug = `${finalSlug}-${Math.floor(timestamp / 1000)}-${i + 1}`;
    }

    // Sanitize body links
    const linksFound = (blogOutput.body.match(/\/products\/[a-z0-9-]+/g) || []).map(l => l.replace('/products/', ''));
    const invalidSlugs = linksFound.filter(s => !verifiedSlugs.includes(s));

    if (invalidSlugs.length > 0) {
      console.warn(`[weekly-blog-agent] Cleaning up unverified links: ${invalidSlugs.join(', ')}`);
      invalidSlugs.forEach(badSlug => {
        const regex = new RegExp(`\\[([^\\]]+)\\]\\(/products/${badSlug}\\)`, 'g');
        blogOutput!.body = blogOutput!.body.replace(regex, '$1');
      });
    }

    // Sanitize FAQ answers to plain text
    const rawFaqs = Array.isArray(blogOutput.faqs) && blogOutput.faqs.length > 0
      ? blogOutput.faqs
      : [
          {
            question: `What are autonomous ${trendData.topic.toLowerCase()}?`,
            answer: `Autonomous AI solutions in ${trendData.category} enable organizations to automate multi-step workflows, improve operational efficiency, and scale customer service without compromising quality.`
          },
          {
            question: `How do tools listed on Parlexa assist with ${trendData.category.toLowerCase()}?`,
            answer: `Parlexa indexes 200+ verified enterprise AI tools, allowing engineering and procurement teams to compare features, pricing models, and compliance certifications side-by-side.`
          },
          {
            question: `Why is zero-trust security essential for enterprise AI agents?`,
            answer: `Enterprise deployments require Row-Level Security (RLS), role-based access control, and strict data residency compliance to prevent unauthorized data access.`
          }
        ];

    const sanitizedFaqs = rawFaqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    }));

    const wordCount = blogOutput.body.split(/\s+/).length;

    // Insert as DRAFT into Supabase `blog_posts`
    const postToInsert = {
      slug: finalSlug,
      title: blogOutput.title,
      body: blogOutput.body,
      excerpt: blogOutput.excerpt,
      author: 'Parlexa Weekly Blog Agent',
      published_date: null,
      read_time_minutes: Math.ceil(wordCount / 200),
      faqs: sanitizedFaqs,
      status: 'draft', // ALWAYS DRAFT - NO AUTO-PUBLISH
      source: 'automated_agent',
      created_at: new Date(timestamp + i * 1000).toISOString(),
      meta_title: blogOutput.meta_title,
      meta_description: blogOutput.meta_description
    };

    const { data: insertedData, error: insertErr } = await supabase
      .from('blog_posts')
      .insert(postToInsert)
      .select();

    if (insertErr) {
      console.error(`[weekly-blog-agent] Supabase insert error for draft #${i + 1}:`, insertErr.message);
    } else if (insertedData && insertedData[0]) {
      const inserted = insertedData[0];
      insertedPosts.push(inserted);
      console.log(`🎉 SUCCESS: Inserted Draft #${i + 1} into DB!`);
      console.log(`   ID: ${inserted.id}`);
      console.log(`   Title: "${inserted.title}"`);
      console.log(`   Slug: ${inserted.slug}`);
      console.log(`   Category: ${trendData.category}`);
      console.log(`   Status: ${inserted.status}`);
    }
  }

  console.log(`\n====================================================`);
  console.log(`🤖 WEEKLY BLOG AGENT — Finished Execution.`);
  console.log(`   Successfully generated ${insertedPosts.length} distinct draft posts.`);
  console.log(`====================================================\n`);

  return new Response(
    JSON.stringify({
      success: true,
      message: `Weekly blog agent executed successfully and created ${insertedPosts.length} distinct draft blog posts`,
      inserted_posts: insertedPosts,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const config: Config = {
  schedule: "0 6 * * 1" // Scheduled for Mondays at 06:00 UTC
};
