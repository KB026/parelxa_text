import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://quhctuntkvwvjgxebhst.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runAgent() {
  console.log('====================================================');
  console.log('🤖 WEEKLY BLOG AGENT — STARTING GENERATION PIPELINE');
  console.log('====================================================\n');

  // STEP 1: TREND RESEARCH STEP
  console.log('--- Step 1: Researching Industry Trends via Gemini Grounding ---');
  let trendData = null;

  if (GEMINI_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        tools: [{ googleSearch: {} }]
      });

      const researchPrompt = `
You are an enterprise AI research director for Parlexa, an AI tool directory marketplace.
Research current AI industry trends, news, and releases from the past month relevant to enterprise AI categories (e.g., voice AI contact center agents, Indic sovereign language models, AI procurement frameworks, developer agent tools, HR/fintech automation, zero-trust security for AI).

Identify ONE specific, timely, narrow topic suitable for a 1000-1200 word technical enterprise blog post.
Do NOT choose a generic evergreen topic; pick something tied to actual recent 2026 enterprise AI developments.

Return a JSON object ONLY with the following format (no markdown fences around JSON if possible):
{
  "topic": "Name of specific timely topic",
  "category": "Customer Experience | Enterprise & Automation | Sovereign & Vertical AI | Procurement & Evaluation | Developer Tools & Infra | HR & Workforce",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "summary": "Brief 2-sentence summary of why this topic is timely right now"
}
      `;

      const result = await model.generateContent(researchPrompt);
      const text = result.response.text();
      console.log('Gemini Research Output:', text.substring(0, 300));
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        trendData = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('⚠️ Gemini Grounding Research encountered quota/rate limit error:', err.message);
    }
  }

  // Fallback research topic if Gemini API hit free tier 429 quota
  if (!trendData) {
    console.log('ℹ️ Using fallback trend grounding context based on 2026 Voice & Sovereign AI developments...');
    trendData = {
      topic: 'Autonomous Multi-Dialect Voice AI Agents in High-Concurrency Enterprise Contact Centers',
      category: 'Customer Experience',
      keywords: ['Voice AI', 'Contact Center', 'Indic Speech', 'Omnichannel', 'Sub-second Latency'],
      summary: 'With sub-800ms streaming speech synthesis and local Indic dialect support, enterprises are moving beyond text chatbots to autonomous voice interaction engines.'
    };
  }

  console.log('📌 Chosen Topic:', trendData.topic);
  console.log('📂 Category:', trendData.category);
  console.log('🔑 Keywords:', trendData.keywords.join(', '));
  console.log('📝 Summary:', trendData.summary);

  // STEP 2: REAL TOOL CROSS-REFERENCE (Query Supabase `agents` table)
  console.log('\n--- Step 2: Querying Supabase `agents` Table for Verified Tool Grounding ---');
  
  // Search for verified agents matching keywords or category
  const { data: matchedTools, error: toolErr } = await supabase
    .from('agents')
    .select('name, slug, category, raw_industry, one_liner, summary, description, features')
    .eq('approval_status', 'approved')
    .order('rating', { ascending: false })
    .limit(30);

  if (toolErr || !matchedTools || matchedTools.length === 0) {
    console.error('❌ ERROR: Tool cross-reference query returned zero tools. Aborting post creation.');
    return;
  }

  // Filter tools relevant to category or keywords
  let relevantTools = matchedTools.filter(t => 
    t.category === trendData.category || 
    trendData.keywords.some(kw => 
      t.name.toLowerCase().includes(kw.toLowerCase()) || 
      (t.raw_industry && t.raw_industry.toLowerCase().includes(kw.toLowerCase())) ||
      (t.one_liner && t.one_liner.toLowerCase().includes(kw.toLowerCase()))
    )
  );

  if (relevantTools.length < 3) {
    relevantTools = matchedTools.slice(0, 8); // Top rated fallback tools from directory
  }

  const verifiedToolList = relevantTools.slice(0, 6).map(t => ({
    name: t.name,
    slug: t.slug,
    category: t.category,
    summary: t.one_liner || t.summary || ''
  }));

  console.log(`✅ Retrieved ${verifiedToolList.length} verified tools for grounding:`);
  verifiedToolList.forEach(t => console.log(`   - ${t.name} (slug: ${t.slug})`));

  const verifiedSlugs = verifiedToolList.map(t => t.slug);

  // STEP 3: CONTENT GENERATION STEP
  console.log('\n--- Step 3: Generating Full Article via LLM ---');

  const generationPrompt = `
You are an expert enterprise AI architecture writer for Parlexa (https://parlexa.in), an enterprise AI tool directory marketplace.
Write an in-depth, authoritative, highly engaging technical blog post (~1000-1200 words) on the following topic:

Topic: "${trendData.topic}"
Category: "${trendData.category}"
Background Context: "${trendData.summary}"

VERIFIED PARLEXA TOOLS DIRECTORY GROUNDING:
You MUST ONLY link to tools from this verified list using syntax [Tool Name](/products/slug).
CRITICAL: Do NOT invent, guess, or output any product slug or internal URL that is NOT in this exact list:
${JSON.stringify(verifiedToolList, null, 2)}

WRITING & STRUCTURAL REQUIREMENTS:
1. Title: Create a compelling 2026 enterprise title (e.g. "The 2026 Enterprise Guide to...").
2. Unique Kebab-case Slug: Generate a unique kebab-case slug for this post.
3. Excerpt: A sharp 1-2 sentence executive summary.
4. Body (Markdown, 1000-1200 words):
   - Executive Summary
   - 3-4 structured sections with H2 ("## ") and H3 ("### ") headings
   - A markdown comparative table
   - Naturally incorporate SEO terms ("AI marketplace", "AI agents", "best AI tools") without keyword stuffing
   - Naturally embed 3-4 internal markdown links to verified tools from the list above using syntax [Tool Name](/products/slug)
   - Platform Fact: Always refer to Parlexa as indexing "200+ verified AI tools" if catalog size is mentioned.
5. FAQs: 3-4 FAQ pairs in array of { question: string, answer: string } objects for schema/AEO.
6. Metadata: meta_title (max 60 chars) and meta_description (max 150 chars).

OUTPUT FORMAT: Return a valid JSON object ONLY (no extra prose outside JSON) with keys:
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "body": "...",
  "faqs": [ { "question": "...", "answer": "..." } ],
  "meta_title": "...",
  "meta_description": "..."
}
  `;

  let blogOutput = null;

  // Try Gemini first, fallback to OpenAI if Gemini quota error occurs
  if (GEMINI_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(generationPrompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) blogOutput = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('⚠️ Gemini content generation rate limited, switching to OpenAI:', e.message);
    }
  }

  if (!blogOutput && OPENAI_KEY) {
    try {
      console.log('Using OpenAI gpt-4o-mini for content generation...');
      const openai = new OpenAI({ apiKey: OPENAI_KEY });
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: generationPrompt }],
        response_format: { type: 'json_object' }
      });
      blogOutput = JSON.parse(res.choices[0].message.content);
    } catch (e) {
      console.error('❌ OpenAI content generation error:', e.message);
    }
  }

  if (!blogOutput) {
    console.error('❌ ERROR: Content generation failed. Aborting insertion.');
    return;
  }

  // Validate internal tool links (verify no hallucinated slugs)
  const linksFound = (blogOutput.body.match(/\/products\/[a-z0-9-]+/g) || []).map(l => l.replace('/products/', ''));
  const invalidSlugs = linksFound.filter(s => !verifiedSlugs.includes(s));

  if (invalidSlugs.length > 0) {
    console.warn(`⚠️ Warning: Found unverified links (${invalidSlugs.join(', ')}). Cleaning up links...`);
    // Strip invalid links
    invalidSlugs.forEach(badSlug => {
      const regex = new RegExp(`\\[([^\\]]+)\\]\\(/products/${badSlug}\\)`, 'g');
      blogOutput.body = blogOutput.body.replace(regex, '$1');
    });
  }

  console.log('✅ Article successfully generated!');
  console.log(`   Title: "${blogOutput.title}"`);
  console.log(`   Slug: "${blogOutput.slug}"`);
  console.log(`   Body Word Count: ~${blogOutput.body.split(/\s+/).length} words`);
  console.log(`   Verified Internal Tool Links Used: ${linksFound.filter(s => verifiedSlugs.includes(s)).join(', ')}`);
  console.log(`   FAQs Generated: ${blogOutput.faqs?.length || 0}`);

  // STEP 4: INSERT AS DRAFT
  console.log('\n--- Step 4: Inserting Post into blog_posts Table as DRAFT ---');
  
  const postToInsert = {
    slug: blogOutput.slug,
    title: blogOutput.title,
    body: blogOutput.body,
    excerpt: blogOutput.excerpt,
    author: 'Parlexa Weekly Blog Agent',
    published_date: null,
    read_time_minutes: Math.ceil(blogOutput.body.split(/\s+/).length / 200),
    faqs: blogOutput.faqs || [],
    status: 'draft',
    source: 'automated_agent',
    created_at: new Date().toISOString(),
    meta_title: blogOutput.meta_title,
    meta_description: blogOutput.meta_description
  };

  const { data: insertedData, error: insertErr } = await supabase
    .from('blog_posts')
    .insert(postToInsert)
    .select();

  if (insertErr) {
    console.error('❌ Insertion failed:', insertErr.message);
    return;
  }

  console.log('\n====================================================');
  console.log('🎉 SUCCESS: Inserted Draft Blog Post into DB!');
  console.log('   Row ID:', insertedData[0].id);
  console.log('   Slug:', insertedData[0].slug);
  console.log('   Status:', insertedData[0].status);
  console.log('====================================================\n');

  return insertedData[0];
}

runAgent().catch(console.error);
