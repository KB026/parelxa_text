import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendSubmissionConfirmation } from '@/lib/email/actions';
import { verifySubscriptionSchema, safeValidate } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // âœ… INPUT VALIDATION: Validate incoming data
    const validation = safeValidate(verifySubscriptionSchema, body);
    if (!validation.ok) {
      return NextResponse.json({ error: `Invalid input: ${validation.error}` }, { status: 400 });
    }

    const {
      razorpay_subscription_id,
      razorpay_payment_id,
      agent_id,
    } = validation.data;

    // 1. Authenticate user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify Razorpay subscription signature
    // Subscription signature = HMAC-SHA256(subscription_id + "|" + payment_id, secret)
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    // Extract signature from request headers (Razorpay sends it)
    const headerSignature = req.headers.get('x-razorpay-signature');
    const isValid = headerSignature ? expectedSignature === headerSignature : false;

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Do NOT mark as paid.' },
        { status: 400 }
      );
    }

    // 3. Calculate expiry: 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // 4. Update the existing listing in the database
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agents')
      .update({
        subscription_id: razorpay_subscription_id,
        listing_expires_at: expiresAt.toISOString(),
        user_email: user.email || null,
      })
      .eq('id', agent_id)
      .eq('user_id', user.id)
      .select('name')
      .single();

    if (updateError || !updatedAgent) {
      console.error('Listing update after subscription payment error:', updateError);
      return NextResponse.json(
        { error: `Payment verified but DB update failed: ${updateError?.message || 'Listing not found'}` },
        { status: 500 }
      );
    }

    // 5. Record transaction with CORRECT status
    // âœ… FIX: Changed from 'paid' to 'completed' to match admin reporting
    try {
      await supabase.from('transactions').insert([{
        user_id: user.id,
        agent_id: agent_id,
        amount: 2359,
        currency: 'INR',
        status: 'completed', // âœ… FIXED: was 'paid', now 'completed' for consistent reporting
        gateway: 'razorpay',
        gateway_payment_id: razorpay_payment_id,
        gateway_order_id: razorpay_subscription_id,
        created_at: new Date().toISOString(),
      }]);
    } catch (e) {
      console.error('Transaction record failed (non-fatal):', e);
    }

    // 6. Send confirmation email
    try {
      if (user.email) {
        await sendSubmissionConfirmation(user.email, updatedAgent.name);
      }
    } catch (e) {
      console.error('Email trigger failed (non-fatal):', e);
    }

    revalidatePath('/vendor/listings');

    return NextResponse.json({
      success: true,
      message: 'Subscription verified and listing submitted successfully',
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error('verify-listing-subscription error:', err);
    return NextResponse.json({ error: 'Internal server error during subscription verification' }, { status: 500 });
  }
}
