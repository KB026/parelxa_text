import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_AMOUNTS_PAISE: Record<string, number> = {
  growth:        49900,   // ₹499/mo
  pro:           89900,   // ₹899/mo
  growth_annual: 499900,  // ₹4,999/yr
  pro_annual:    849900,  // ₹8,499/yr
};

export async function POST(req: NextRequest) {
  try {
    const { agentId, plan } = await req.json();

    if (!plan) {
      return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
    }

    if (!['growth', 'pro', 'growth_annual', 'pro_annual'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be growth, pro, growth_annual, or pro_annual.' }, { status: 400 });
    }

    // Authenticate
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTestMode = process.env.RAZORPAY_TEST_MODE === 'true';
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (isTestMode || !keyId || !keySecret) {
      console.warn('[create-plan-order] Test mode active or keys missing — returning mock order');
      return NextResponse.json({
        isMock:  true,
        orderId: `mock_order_${Date.now()}`,
        keyId:   'mock_key',
        amount:  PLAN_AMOUNTS_PAISE[plan],
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

    // 1. Try creating a Razorpay Subscription if Plan ID is available
    if (razorpayPlanId) {
      const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: razorpayPlanId,
          total_count: plan.endsWith('_annual') ? 10 : 60,
          quantity: 1,
          customer_notify: 1,
          notes: {
            agent_id:   String(agentId),
            plan,
            user_id:    user.id,
            user_email: user.email || '',
          },
        }),
      });

      if (subRes.ok) {
        const subscription = await subRes.json();
        return NextResponse.json({
          subscriptionId: subscription.id,
          keyId,
          amount: PLAN_AMOUNTS_PAISE[plan],
          type: 'subscription',
        });
      } else {
        const errData = await subRes.json().catch(() => ({}));
        console.warn('[create-plan-order] Razorpay Subscription creation failed, falling back to Order API:', errData);
      }
    }

    // 2. Fallback: Create standard Razorpay Order
    const amount = PLAN_AMOUNTS_PAISE[plan];
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
          agent_id:   String(agentId),
          plan,
          user_id:    user.id,
          user_email: user.email || '',
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
    });

  } catch (err) {
    console.error('[create-plan-order] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
