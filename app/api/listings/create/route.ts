import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendSubmissionConfirmation } from '@/lib/email/actions';

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

    // 2. Parse listing data
    let tags: string[] = [];
    let industries: string[] = [];
    try {
      if (listing_data.tags) tags = typeof listing_data.tags === 'string' ? JSON.parse(listing_data.tags) : listing_data.tags;
    } catch { /* ignore */ }
    try {
      if (listing_data.industries) industries = typeof listing_data.industries === 'string' ? JSON.parse(listing_data.industries) : listing_data.industries;
    } catch { /* ignore */ }

    // 3. Insert listing into database (status: pending, NO subscription attached yet)
    const { data: insertedData, error: insertError } = await supabase.from('agents').insert([
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
        approval_status: 'pending',
      },
    ]).select();

    if (insertError) {
      console.error('Listing insert error:', insertError);
      return NextResponse.json(
        { error: `DB insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 4. Send confirmation email
    try {
      if (user.email) {
        await sendSubmissionConfirmation(user.email, listing_data.name);
      }
    } catch (e) {
      console.error('Email trigger failed (non-fatal):', e);
    }

    revalidatePath('/vendor/listings');

    return NextResponse.json({
      success: true,
      message: 'Listing submitted successfully for review.',
      id: insertedData?.[0]?.id
    });
  } catch (err) {
    console.error('listings/create error:', err);
    return NextResponse.json({ error: 'Internal server error during listing creation' }, { status: 500 });
  }
}
