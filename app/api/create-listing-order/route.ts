import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';
import { validateCoupon } from '@/lib/coupons';

const LISTING_FEE_BASE = 1999;
const GST_RATE = 0.18;
const DEFAULT_TOTAL = Math.round(LISTING_FEE_BASE * (1 + GST_RATE)); // ₹2,359

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { gstin, company_name, coupon_code, couponCode } = body;
    const code = coupon_code || couponCode;

    // 1. Authenticate user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate coupon if provided
    let couponResult = null;
    if (code && typeof code === 'string' && code.trim()) {
      couponResult = await validateCoupon(code, LISTING_FEE_BASE);
      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error || 'Invalid coupon code' }, { status: 400 });
      }
    }

    const finalAmountPaise = couponResult?.breakdown?.amountInPaise || (DEFAULT_TOTAL * 100);
    const breakdown = couponResult?.breakdown || {
      originalBase: LISTING_FEE_BASE,
      discountAmount: 0,
      discountedBase: LISTING_FEE_BASE,
      gstAmount: Math.round(LISTING_FEE_BASE * GST_RATE),
      finalTotal: DEFAULT_TOTAL,
      amountInPaise: DEFAULT_TOTAL * 100,
    };

    // 3. Ensure Razorpay is configured
    if (!razorpay) {
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 });
    }

    // 4. Create Razorpay order
    const order = await razorpay.orders.create({
      amount: finalAmountPaise,
      currency: 'INR',
      receipt: `list_${user.id.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        purpose: 'tool_listing_fee',
        coupon_code: couponResult?.coupon?.code || '',
        base_amount: String(breakdown.originalBase),
        discount_amount: String(breakdown.discountAmount),
        gst_amount: String(breakdown.gstAmount),
        final_total: String(breakdown.finalTotal),
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
        base: breakdown.discountedBase,
        originalBase: breakdown.originalBase,
        discount: breakdown.discountAmount,
        gst: breakdown.gstAmount,
        total: breakdown.finalTotal,
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
