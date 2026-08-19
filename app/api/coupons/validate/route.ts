import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

const PLAN_BASE_PRICES: Record<string, number> = {
  listing_claim: 1999,
  growth: 499,
  pro: 899,
  growth_annual: 4999,
  pro_annual: 8499,
  scale_annual: 9999,
  verified_annual: 4999,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code, plan, basePrice: rawBasePrice } = body;

    if (!code) {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 });
    }

    let basePrice = Number(rawBasePrice);
    if (!basePrice || isNaN(basePrice)) {
      if (plan && PLAN_BASE_PRICES[plan]) {
        basePrice = PLAN_BASE_PRICES[plan];
      } else {
        basePrice = 4999; // Default fallback to growth annual base
      }
    }

    const result = await validateCoupon(code, basePrice);

    if (!result.valid) {
      return NextResponse.json({ error: result.error || 'Invalid coupon code' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: result.coupon?.code,
      discount_type: result.coupon?.discount_type,
      discount_value: result.coupon?.discount_value,
      breakdown: result.breakdown,
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
