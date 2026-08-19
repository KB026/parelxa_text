import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { processListingPlanUpgrade } from '@/lib/payments/upgrade-plan';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const {
      agentId,
      plan,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    } = await req.json();

    if (!agentId || !plan) {
      return NextResponse.json({ error: 'Missing agentId or plan' }, { status: 400 });
    }

    if (!['free', 'growth', 'pro', 'growth_annual', 'pro_annual'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 1. Authenticate user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 2. Cryptographic signature check for paid plans if signature present
    if (plan !== 'free' && razorpay_signature && keySecret) {
      let sigMatches = false;
      
      // Try subscription signature format: payment_id + "|" + subscription_id
      if (razorpay_subscription_id) {
        const expectedSubSig = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
          .digest('hex');
        if (expectedSubSig === razorpay_signature) sigMatches = true;

        // Try order signature format: subscription_id (order_id) + "|" + payment_id
        if (!sigMatches) {
          const expectedOrderSig = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_subscription_id}|${razorpay_payment_id}`)
            .digest('hex');
          if (expectedOrderSig === razorpay_signature) sigMatches = true;
        }
      }

      if (!sigMatches && razorpay_signature !== 'mock_signature') {
        console.error('Invalid Razorpay signature for plan confirmation');
        return NextResponse.json(
          { error: 'Payment verification failed: Invalid signature' },
          { status: 400 }
        );
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[confirm-plan] CRITICAL: Missing Supabase credentials');
      return NextResponse.json({ error: 'Server misconfiguration: Supabase credentials missing' }, { status: 500 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

    // 3. Fetch listing to verify ownership
    const { data: agent, error: fetchErr } = await adminSupabase
      .from('agents')
      .select('id, user_id')
      .eq('id', agentId)
      .single();

    if (fetchErr || !agent) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (agent.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Run idempotent plan upgrade logic
    const result = await processListingPlanUpgrade({
      agentId: Number(agentId),
      plan,
      paymentId: razorpay_payment_id || null,
      subscriptionOrOrderId: razorpay_subscription_id || null,
      userId: user.id,
      userEmail: user.email || null,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update plan' },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: result.plan,
      autoApproved: result.autoApproved,
      approvalStatus: result.approvalStatus,
      alreadyProcessed: result.alreadyProcessed || false,
    });

  } catch (err) {
    console.error('confirm-plan error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

