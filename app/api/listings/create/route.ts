import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { scoreAgent, computeAiAverage } from '@/lib/ai-scoring';

export async function POST(req: NextRequest) {
  try {
    const listing_data = await req.json();

    if (!listing_data || !listing_data.name) {
      return NextResponse.json({ error: 'Missing listing data' }, { status: 400 });
    }

    // 1. Authenticate user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse array fields
    let tags: string[] = [];
    let industries: string[] = [];
    let screenshots: string[] = [];
    try {
      if (listing_data.tags) tags = typeof listing_data.tags === 'string' ? JSON.parse(listing_data.tags) : listing_data.tags;
    } catch { /* ignore */ }
    try {
      if (listing_data.industries) industries = typeof listing_data.industries === 'string' ? JSON.parse(listing_data.industries) : listing_data.industries;
    } catch { /* ignore */ }
    try {
      if (listing_data.screenshots) screenshots = typeof listing_data.screenshots === 'string' ? JSON.parse(listing_data.screenshots) : listing_data.screenshots;
    } catch { /* ignore */ }

    // 3. Validate mandatory visual assets
    if (!listing_data.logo_url) {
      return NextResponse.json({ error: 'Logo Upload is required' }, { status: 400 });
    }
    if (!screenshots || screenshots.length === 0) {
      return NextResponse.json({ error: 'At least 1 Product Screenshot is required' }, { status: 400 });
    }

    // 4. Run AI scoring silently — stored in DB, no emails fired yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let aiScores: any = null;
    let aiScoreAvg = 0;
    try {
      aiScores = await scoreAgent({
        name: listing_data.name,
        summary: listing_data.summary,
        use_cases: listing_data.use_cases,
        category: listing_data.category,
        raw_industry: listing_data.raw_industry,
        demo_url: listing_data.demo_url,
        video_url: listing_data.video_url,
        screenshots,
        logo_url: listing_data.logo_url,
        founders: listing_data.founders,
        founded_year: listing_data.founded_year ? parseInt(listing_data.founded_year) : null,
        team_size: listing_data.team_size,
        company_linkedin: listing_data.company_linkedin,
        company_name: listing_data.company_name,
        city: listing_data.city,
        has_india_pricing: listing_data.has_india_pricing === 'true' || listing_data.has_india_pricing === true,
        inr_price: listing_data.inr_price,
        pricing_model: listing_data.pricing_model,
        pricing: listing_data.pricing,
        free_trial: listing_data.free_trial,
        company_gstin: listing_data.company_gstin,
        website: listing_data.website,
      });
      aiScoreAvg = computeAiAverage(aiScores);
    } catch (scoreErr) {
      console.error('AI evaluation error (non-fatal):', scoreErr);
    }

    // 5. Insert listing — always PENDING until plan is confirmed via /api/vendor/confirm-plan
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[listings/create] CRITICAL: Missing Supabase credentials');
      return NextResponse.json({ error: 'Server misconfiguration: Supabase credentials missing' }, { status: 500 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

    const { data: insertedData, error: insertError } = await adminSupabase.from('agents').insert([
      {
        name: listing_data.name,
        one_liner: listing_data.one_liner || null,
        summary: listing_data.summary,
        website: listing_data.website,
        demo_url: listing_data.demo_url || null,
        video_url: listing_data.video_url || null,
        logo_url: listing_data.logo_url || null,
        category: listing_data.category || null,
        raw_industry: listing_data.raw_industry || null,
        use_cases: listing_data.use_cases,
        tags: tags.length > 0 ? tags : null,
        industries: industries.length > 0 ? industries : null,
        screenshots: screenshots.length > 0 ? screenshots : null,
        pricing_model: listing_data.pricing_model || null,
        pricing: listing_data.pricing || null,
        price_range: listing_data.price_range || null,
        free_trial: listing_data.free_trial || null,
        has_india_pricing: listing_data.has_india_pricing === 'true' || listing_data.has_india_pricing === true,
        inr_price: listing_data.inr_price || null,
        company_name: listing_data.company_name || null,
        founded_year: listing_data.founded_year ? parseInt(listing_data.founded_year) : null,
        team_size: listing_data.team_size || null,
        city: listing_data.city || null,
        founders: listing_data.founders || null,
        company_linkedin: listing_data.company_linkedin || null,
        user_id: user.id,
        user_email: user.email || null,
        contact_name: listing_data.contact_name || null,
        contact_phone: listing_data.contact_phone || null,
        company_gstin: listing_data.company_gstin || null,
        source_name: listing_data.how_did_you_hear || null,
        approval_status: 'pending',
        vendor_plan: 'free',
        ai_score: aiScoreAvg > 0 ? aiScoreAvg : null,
        ai_scores: aiScores,
        quality_score: null,
        reviewed_at: null,
      },
    ]).select();

    if (insertError) {
      console.error('Listing insert error:', insertError);
      return NextResponse.json({ error: `DB insert failed: ${insertError.message}` }, { status: 500 });
    }

    const newListing = insertedData?.[0];

    // 6. Insert external review links
    if (listing_data.external_reviews && Array.isArray(listing_data.external_reviews) && newListing?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validLinks = (listing_data.external_reviews as any[])
        .filter((item) => item && item.platform && item.url && item.url.trim().length > 0)
        .slice(0, 3)
        .map((item) => ({
          agent_id: newListing.id,
          platform: item.platform,
          source: item.platform,
          url: item.url.trim(),
          source_url: item.url.trim(),
          status: 'unverified',
        }));

      if (validLinks.length > 0) {
        const { error: extError } = await adminSupabase.from('external_reviews').insert(validLinks);
        if (extError) console.error('External review insert error:', extError);
      }
    }

    revalidatePath('/vendor/listings');
    revalidatePath('/products');

    // Return agentId + AI score for plan picker to use
    return NextResponse.json({
      success: true,
      id: newListing?.id,
      ai_score: aiScoreAvg,
    });

  } catch (err) {
    console.error('listings/create error:', err);
    return NextResponse.json({ error: 'Internal server error during listing creation' }, { status: 500 });
  }
}
