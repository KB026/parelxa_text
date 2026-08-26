import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export interface Coupon {
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  times_used?: number;
  expires_at?: string | null;
  is_active?: boolean;
  offer_id?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: Coupon;
  breakdown?: {
    originalBase: number;
    discountAmount: number;
    discountedBase: number;
    gstAmount: number;
    finalTotal: number;
    amountInPaise: number;
  };
}

// Built-in starter coupons as reliable baseline
const DEFAULT_COUPONS: Record<string, Coupon> = {
  EARLY250: {
    code: 'EARLY250',
    discount_type: 'percentage',
    discount_value: 40,
    min_order_amount: 0,
    max_uses: 250,
    times_used: 0,
    expires_at: '2026-09-15T23:59:59Z',
    is_active: true,
    offer_id: 'offer_TRIdCGgr6BBUWH',
  },
};

const GST_RATE = 0.18;

export async function validateCoupon(
  rawCode: string,
  basePrice: number
): Promise<CouponValidationResult> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, error: 'Please enter a coupon code' };
  }

  let coupon: Coupon | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (supabaseUrl && supabaseServiceKey) {
      const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await adminSupabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .single();

      if (!error && data) {
        coupon = data as Coupon;
      }
    }
  } catch {
    // Database table may not be synced yet, fall through to default coupons
  }

  // Fallback to default coupons dictionary
  if (!coupon && DEFAULT_COUPONS[code]) {
    coupon = DEFAULT_COUPONS[code];
  }

  if (!coupon || coupon.is_active === false) {
    return { valid: false, error: 'Invalid or inactive coupon code' };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: 'This coupon code has expired' };
  }

  if (coupon.max_uses && (coupon.times_used || 0) >= coupon.max_uses) {
    return { valid: false, error: 'Coupon usage limit has been reached' };
  }

  if (coupon.min_order_amount && basePrice < coupon.min_order_amount) {
    return {
      valid: false,
      error: `Minimum order amount of ₹${coupon.min_order_amount.toLocaleString('en-IN')} required for this coupon`,
    };
  }

  // Calculate discount on all-inclusive price (₹4,999 & ₹8,499 include taxes)
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = Math.round((basePrice * coupon.discount_value) / 100);
  } else if (coupon.discount_type === 'flat') {
    discountAmount = Math.min(coupon.discount_value, basePrice);
  }

  const finalTotal = Math.max(0, basePrice - discountAmount);
  const discountedBase = Math.round(finalTotal / (1 + GST_RATE));
  const gstAmount = finalTotal - discountedBase;
  const amountInPaise = finalTotal * 100;

  return {
    valid: true,
    coupon,
    breakdown: {
      originalBase: basePrice,
      discountAmount,
      discountedBase,
      gstAmount,
      finalTotal,
      amountInPaise,
    },
  };
}

export async function incrementCouponUsage(rawCode: string): Promise<void> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) return;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (supabaseUrl && supabaseServiceKey) {
      const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);
      const { data } = await adminSupabase
        .from('coupons')
        .select('times_used')
        .eq('code', code)
        .single();

      if (data) {
        await adminSupabase
          .from('coupons')
          .update({ times_used: (data.times_used || 0) + 1 })
          .eq('code', code);
      }
    }
  } catch (err) {
    console.error('Failed to increment coupon usage:', err);
  }
}
