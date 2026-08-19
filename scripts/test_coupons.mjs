import { validateCoupon } from '../lib/coupons.js';

async function test() {
  console.log('--- Testing Coupon Validation Engine ---');

  const testCases = [
    { code: 'LAUNCH50', base: 4999, desc: '50% off on Growth Annual (₹4,999)' },
    { code: 'launch50', base: 4999, desc: 'Lowercase coupon code tolerance' },
    { code: 'WELCOME20', base: 1999, desc: '20% off on Listing Claim (₹1,999)' },
    { code: 'PARLEXA500', base: 4999, desc: 'Flat ₹500 off on Growth Annual (₹4,999)' },
    { code: 'FAKECODE', base: 4999, desc: 'Invalid code handling' },
  ];

  for (const tc of testCases) {
    const res = await validateCoupon(tc.code, tc.base);
    console.log(`\nTest: ${tc.desc}`);
    if (res.valid) {
      console.log(`✅ VALID: Code=${res.coupon?.code}, Type=${res.coupon?.discount_type}, Value=${res.coupon?.discount_value}`);
      console.log(`   Original Base: ₹${res.breakdown?.originalBase}`);
      console.log(`   Discount:      -₹${res.breakdown?.discountAmount}`);
      console.log(`   Discounted:    ₹${res.breakdown?.discountedBase}`);
      console.log(`   18% GST:       +₹${res.breakdown?.gstAmount}`);
      console.log(`   Final Total:   ₹${res.breakdown?.finalTotal} (${res.breakdown?.amountInPaise} paise)`);
    } else {
      console.log(`❌ INVALID: Error = "${res.error}"`);
    }
  }
}

test().catch(console.error);
