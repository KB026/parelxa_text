import { NextRequest, NextResponse } from 'next/server';
import { validatePaymentVerification } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendSubmissionConfirmation } from '@/lib/email/actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate required payment fields
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listing_data,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification fields' },
        { status: 400 }
      );
    }

    if (!listing_data) {
      return NextResponse.json(
        { error: 'Missing listing data' },
        { status: 400 }
      );
    }

    // 2. Authenticate user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Verify payment signature
    const isValid = validatePaymentVerification(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Do NOT mark as paid.' },
        { status: 400 }
      );
    }

    // 4. Parse listing data
    let tags: string[] = [];
    let industries: string[] = [];
    try {
      if (listing_data.tags) tags = typeof listing_data.tags === 'string' ? JSON.parse(listing_data.tags) : listing_data.tags;
    } catch { /* ignore */ }
    try {
      if (listing_data.industries) industries = typeof listing_data.industries === 'string' ? JSON.parse(listing_data.industries) : listing_data.industries;
    } catch { /* ignore */ }

    // 5. Insert the listing into database
    const { error: insertError } = await supabase.from('agents').insert([
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
        // Payment metadata
        payment_id: razorpay_payment_id,
        payment_order_id: razorpay_order_id,
        payment_status: 'paid',
      },
    ]);

    if (insertError) {
      console.error('Listing insert after payment error:', insertError);
      // Payment was verified but DB insert failed — log this critically
      return NextResponse.json(
        { error: 'Payment verified but listing creation failed. Contact support with payment ID: ' + razorpay_payment_id },
        { status: 500 }
      );
    }

    // 6. Record transaction with correct status
    // ✅ FIX: Use 'completed' instead of 'paid' for consistent revenue reporting
    try {
      await supabase.from('transactions').insert([{
        user_id: user.id,
        agent_id: listing_data.agent_id || null,
        amount: listing_data.amount || 0,
        currency: listing_data.currency || 'INR',
        status: 'completed', // ✅ FIXED: was potentially 'paid', now 'completed'
        gateway: 'razorpay',
        gateway_payment_id: razorpay_payment_id,
        gateway_order_id: razorpay_order_id,
        created_at: new Date().toISOString(),
      }]);
    } catch (e) {
      console.error('Transaction record failed (non-fatal):', e);
    }

    // 7. Send confirmation email
    try {
      if (user.email) {
        await sendSubmissionConfirmation(user.email, listing_data.name);
      }
    } catch (e) {
      console.error('Email trigger failed:', e);
      // Non-fatal — listing is already created
    }

    // 8. Revalidate paths
    revalidatePath('/vendor/listings');

    return NextResponse.json({
      success: true,
      message: 'Payment verified and listing submitted successfully',
    });
  } catch (err) {
    console.error('verify-listing-payment error:', err);
    return NextResponse.json(
      { error: 'Internal server error during payment verification' },
      { status: 500 }
    );
  }
}
