import Razorpay from 'razorpay';
import crypto from 'node:crypto';

// Detection for Mock Mode (useful for prototype testing without keys)
export const isMockMode = !process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true';

if (isMockMode) {
  console.log('ðŸ’³ Razorpay: Operating in MOCK MODE (No active gateway)');
} else if (!process.env.RAZORPAY_KEY_ID) {
  console.warn('RAZORPAY_KEY_ID is missing from environment variables');
}

export const razorpay = isMockMode ? null : new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const validatePaymentVerification = (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  if (isMockMode && signature === 'mock_signature') return true;
  
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
    .update(body.toString())
    .digest("hex");
  
  return expectedSignature === signature;
};
