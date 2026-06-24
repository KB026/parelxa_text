import { z } from 'zod';

/**
 * ✅ Centralized Zod schemas for API input validation
 * Used to sanitize and validate all payment, listing, and agent data
 */

// ============ LISTING SCHEMAS ============

export const createListingSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must be less than 200 characters')
    .trim(),
  
  website: z.string()
    .url('Invalid website URL')
    .max(500, 'Website URL too long'),
  
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category name too long'),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .min(3)
    .max(100),
  
  summary: z.string()
    .max(500, 'Summary too long')
    .optional(),
  
  description: z.string()
    .max(5000, 'Description too long')
    .optional(),
  
  logo_url: z.string()
    .url('Invalid logo URL')
    .max(500, 'Logo URL too long')
    .optional(),
  
  pricing: z.string()
    .max(200, 'Pricing text too long')
    .optional(),
  
  use_cases: z.string()
    .max(1000, 'Use cases text too long')
    .optional(),
  
  founded_year: z.number()
    .int('Founded year must be an integer')
    .min(1900, 'Founded year must be 1900 or later')
    .max(new Date().getFullYear(), 'Founded year cannot be in the future')
    .optional()
    .nullable(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

// ============ PAYMENT SCHEMAS ============

export const createOrderSchema = z.object({
  agent_id: z.number()
    .int('Agent ID must be an integer')
    .positive('Agent ID must be positive'),
  
  amount: z.number()
    .positive('Amount must be positive')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places')
    .max(1000000, 'Amount too large'),
  
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  
  type: z.enum(['listing', 'promotion', 'subscription'])
    .optional(),
  
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be at least 1')
    .max(1000, 'Quantity too large')
    .optional()
    .default(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string()
    .min(1, 'Order ID required')
    .max(100, 'Order ID too long'),
  
  razorpay_payment_id: z.string()
    .min(1, 'Payment ID required')
    .max(100, 'Payment ID too long'),
  
  razorpay_signature: z.string()
    .min(1, 'Signature required')
    .max(500, 'Signature too long'),
  
  agent_id: z.number()
    .int('Agent ID must be an integer')
    .positive('Agent ID must be positive'),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// ============ SUBSCRIPTION SCHEMAS ============

export const createSubscriptionSchema = z.object({
  agent_id: z.number()
    .int('Agent ID must be an integer')
    .positive('Agent ID must be positive'),
  
  plan: z.enum(['weekly', 'monthly', 'quarterly', 'annual']),
  
  amount: z.number()
    .positive('Amount must be positive')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places')
    .max(1000000, 'Amount too large'),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const verifySubscriptionSchema = z.object({
  razorpay_subscription_id: z.string()
    .min(1, 'Subscription ID required')
    .max(100, 'Subscription ID too long'),
  
  razorpay_payment_id: z.string()
    .min(1, 'Payment ID required')
    .max(100, 'Payment ID too long'),
  
  agent_id: z.number()
    .int('Agent ID must be an integer')
    .positive('Agent ID must be positive'),
});

export type VerifySubscriptionInput = z.infer<typeof verifySubscriptionSchema>;

// ============ AI SEARCH SCHEMAS ============

export const aiSearchSchema = z.object({
  query: z.string()
    .min(1, 'Query required')
    .max(1000, 'Query too long'),
  
  agentIds: z.array(z.number().int().positive())
    .max(20, 'Too many agents (max 20 for AI context)')
    .optional()
    .default([]),
});

export type AISearchInput = z.infer<typeof aiSearchSchema>;

// ============ UTILITY FUNCTIONS ============

/**
 * Safely parse and validate input, return { ok: true, data } or { ok: false, error }
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const errorMessages = result.error.issues.map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
  return { ok: false, error: errorMessages };
}
