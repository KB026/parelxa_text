import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateCoupon } from '@/lib/coupons';

const PLAN_AMOUNTS_PAISE: Record<string, number> = {
  growth:        49900,   // ₹499/mo
  pro:           89900,   // ₹899/mo
  growth_annual: 499900,  // ₹4,999/yr
  pro_annual:    849900,  // ₹8,499/yr
};

const PLAN_BASE_PRICES: Record<string, number> = {
  growth:        499,
  pro:           899,
  growth_annual: 4999,
  pro_annual:    8499,
};

export async function POST(req: NextRequest) {
  try {
    const { agentId, plan, couponCode } = await req.json();

    if (!plan) {
      return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
    }

    if (!['growth', 'pro', 'growth_annual', 'pro_annual'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be growth, pro, growth_annual, or pro_annual.' }, { status: 400 });
    }

    // Authenticate (fallback to test session if user is previewing demo)
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'demo_vendor_test';
    const userEmail = user?.email || 'demo@parlexa.com';

    // Check if coupon is supplied and validate server-side
    let couponResult = null;
    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const basePrice = PLAN_BASE_PRICES[plan] || 4999;
      couponResult = await validateCoupon(couponCode, basePrice);
      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error || 'Invalid coupon code' }, { status: 400 });
      }
    }

    const isTestMode = process.env.RAZORPAY_TEST_MODE === 'true';
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const finalAmountPaise = couponResult?.breakdown?.amountInPaise || PLAN_AMOUNTS_PAISE[plan];

    if (isTestMode || !keyId || !keySecret) {
      console.warn('[create-plan-order] Test mode active or keys missing — returning mock order');
      return NextResponse.json({
        isMock:  true,
        orderId: `mock_order_${Date.now()}`,
        keyId:   'mock_key',
        amount:  finalAmountPaise,
        breakdown: couponResult?.breakdown,
      });
    }

    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    // Check for Plan IDs in environment (supports both exact new keys & fallbacks)
    const PLAN_IDS: Record<string, string | undefined> = {
      growth:        process.env.RAZORPAY_MONTHLY_GROWTH_PLAN_ID || process.env.RAZORPAY_GROWTH_PLAN_ID,
      pro:           process.env.RAZORPAY_MONTHLY_SCALE_PLAN_ID || process.env.RAZORPAY_PRO_PLAN_ID,
      growth_annual: process.env.RAZORPAY_YEARLY_GROWTH_PLAN_ID || process.env.RAZORPAY_GROWTH_ANNUAL_PLAN_ID,
      pro_annual:    process.env.RAZORPAY_YEARLY_SCALE_PLAN_ID || process.env.RAZORPAY_PRO_ANNUAL_PLAN_ID,
    };
    const razorpayPlanId = PLAN_IDS[plan];

    // Check for linked offer ID (e.g. offer_TRIdCGgr6BBUWH for EARLY250)
    const offerId = couponResult?.coupon?.offer_id || process.env.RAZORPAY_OFFER_ID || (couponCode?.trim()?.toUpperCase() === 'EARLY250' ? 'offer_TRIdCGgr6BBUWH' : undefined);

    // 1. Try creating a Razorpay Subscription (with optional linked offer) if Plan ID is available
    if (razorpayPlanId) {
      const subPayload: Record<string, any> = {
        plan_id: razorpayPlanId,
        total_count: plan.endsWith('_annual') ? 10 : 60,
        quantity: 1,
        customer_notify: 1,
        notes: {
          agent_id:   String(agentId),
          plan,
          user_id:    userId,
          user_email: userEmail,
          coupon_code: couponResult?.coupon?.code || couponCode || '',
        },
      };

      if (offerId) {
        subPayload.offer_id = offerId;
      }

      const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subPayload),
      });

      if (subRes.ok) {
        const subscription = await subRes.json();
        return NextResponse.json({
          subscriptionId: subscription.id,
          keyId,
          amount: finalAmountPaise,
          type: 'subscription',
          offerId: offerId || null,
        });
      } else {
        const errData = await subRes.json().catch(() => ({}));
        console.warn('[create-plan-order] Razorpay Subscription creation failed, falling back to Order API:', errData);
      }
    }

    // 2. Dynamic Razorpay Order (used for coupon discounts and fallback)
    const amount = finalAmountPaise;
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `parlexa_plan_${agentId}_${plan}_${Date.now()}`,
        notes: {
          agent_id:      String(agentId),
          plan,
          user_id:       userId,
          user_email:    userEmail,
          coupon_code:   couponResult?.coupon?.code || '',
          discount_val:  couponResult?.breakdown?.discountAmount ? String(couponResult.breakdown.discountAmount) : '0',
          gst_val:       couponResult?.breakdown?.gstAmount ? String(couponResult.breakdown.gstAmount) : '0',
        },
      }),
    });

    if (!rzpRes.ok) {
      const errData = await rzpRes.json().catch(() => ({}));
      console.error('[create-plan-order] Razorpay order creation failed:', errData);
      return NextResponse.json(
        { error: errData?.error?.description || 'Failed to create Razorpay order' },
        { status: 502 }
      );
    }

    const order = await rzpRes.json();

    return NextResponse.json({
      orderId: order.id,
      keyId,
      amount:  order.amount,
      currency: order.currency,
      type: 'order',
      breakdown: couponResult?.breakdown,
    });

  } catch (err) {
    console.error('[create-plan-order] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
