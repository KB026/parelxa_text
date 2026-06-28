import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';

// ₹1,999 base + 18% GST = ₹2,358.82 → rounded to ₹2,359
const LISTING_FEE_BASE = 1999;
const GST_RATE = 0.18;
const LISTING_FEE_TOTAL = Math.round(LISTING_FEE_BASE * (1 + GST_RATE)); // ₹2,359
const LISTING_FEE_PAISE = LISTING_FEE_TOTAL * 100; // 235900 paise

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

    // 2. Validate amount (min 100 paise as per Razorpay)
    if (LISTING_FEE_PAISE < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 3. Ensure Razorpay is configured
    if (!razorpay) {
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 });
    }

    // 4. Create Razorpay order
    const order = await razorpay.orders.create({
      amount: LISTING_FEE_PAISE,
      currency: 'INR',
      receipt: `list_${user.id.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        purpose: 'tool_listing_fee',
        base_amount: LISTING_FEE_BASE.toString(),
        gst_amount: Math.round(LISTING_FEE_BASE * GST_RATE).toString(),
        gstin: gstin || 'Unregistered',
        company: company_name || 'Individual'
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      breakdown: {
        base: LISTING_FEE_BASE,
        gst: Math.round(LISTING_FEE_BASE * GST_RATE),
        total: LISTING_FEE_TOTAL,
      },
    });
  } catch (err) {
    console.error('Razorpay create-listing-order error:', err);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
