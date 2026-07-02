import Razorpay from 'razorpay';
import crypto from 'node:crypto';

let instance: Razorpay | null = null;

export const getRazorpay = (): Razorpay => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('CRITICAL ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be defined in environment variables.');
  }
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};

export const razorpay = new Proxy({} as Razorpay, {
  get(target, prop, receiver) {
    const r = getRazorpay();
    const value = Reflect.get(r, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(r);
    }
    return value;
  }
});

export const validatePaymentVerification = (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");
  
  return expectedSignature === signature;
};

