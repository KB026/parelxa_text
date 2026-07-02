import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';

// ₹1,999 base + 18% GST = ₹2,358.82 → ₹2,359/year
const LISTING_FEE_BASE = 1999;
const GST_RATE = 0.18;
const LISTING_FEE_TOTAL = Math.round(LISTING_FEE_BASE * (1 + GST_RATE)); // ₹2,359

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

    if (!razorpay) {
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 });
    }

    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      return NextResponse.json({ 
        error: 'Razorpay Plan ID not configured',
        debug: {
          has_key_id: !!process.env.RAZORPAY_KEY_ID,
          has_key_secret: !!process.env.RAZORPAY_KEY_SECRET,
          has_plan_id: !!process.env.RAZORPAY_PLAN_ID,
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
