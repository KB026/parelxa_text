import { NextRequest, NextResponse } from 'next/server';
import { razorpay, isMockMode } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';

// â‚¹1,999 base + 18% GST = â‚¹2,358.82 â†’ â‚¹2,359/year
const LISTING_FEE_BASE = 1999;
const GST_RATE = 0.18;
const LISTING_FEE_TOTAL = Math.round(LISTING_FEE_BASE * (1 + GST_RATE)); // â‚¹2,359

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { gstin, company_name } = body;

    // 1. Authenticate user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Mock mode for local dev without Razorpay keys
    if (isMockMode || !razorpay) {
      return NextResponse.json({
        subscription_id: `mock_sub_listing_${Date.now()}`,
        key_id: 'rzp_test_mock_key',
        is_mock: true,
        breakdown: {
          base: LISTING_FEE_BASE,
          gst: Math.round(LISTING_FEE_BASE * GST_RATE),
          total: LISTING_FEE_TOTAL,
        },
      });
    }

    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      return NextResponse.json({ 
        error: 'Razorpay Plan ID not configured',
        debug: {
          has_key_id: !!process.env.RAZORPAY_KEY_ID,
          has_key_secret: !!process.env.RAZORPAY_KEY_SECRET,
          has_plan_id: !!process.env.RAZORPAY_PLAN_ID,
          is_mock: isMockMode,
        }
      }, { status: 500 });
    }

    // 3. Create Razorpay Subscription
    try {
      const subscription = await (razorpay.subscriptions as unknown as {
        create: (opts: Record<string, unknown>) => Promise<{ id: string; status: string }>;
      }).create({
        plan_id: planId,
        total_count: 100,
        quantity: 1,
        notes: {
          userId: user.id,
          purpose: 'annual_tool_listing',
          gstin: gstin || 'Unregistered',
          company: company_name || 'Individual',
          base_amount: LISTING_FEE_BASE.toString(),
          gst_amount: Math.round(LISTING_FEE_BASE * GST_RATE).toString(),
        },
      });

      return NextResponse.json({
        subscription_id: subscription.id,
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        breakdown: {
          base: LISTING_FEE_BASE,
          gst: Math.round(LISTING_FEE_BASE * GST_RATE),
          total: LISTING_FEE_TOTAL,
        },
      });
    } catch (rzpErr: unknown) {
      const errMsg = rzpErr instanceof Error ? rzpErr.message : JSON.stringify(rzpErr);
      console.error('Razorpay subscription create failed:', rzpErr);
      return NextResponse.json({ 
        error: 'Razorpay API error: ' + errMsg,
        debug: { plan_id: planId }
      }, { status: 500 });
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('Razorpay create-listing-subscription error:', err);
    return NextResponse.json({ error: 'Failed to create subscription: ' + errMsg }, { status: 500 });
  }
}
