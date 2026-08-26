-- 034_create_coupons_table.sql
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  times_used INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of active coupons" 
  ON public.coupons 
  FOR SELECT 
  TO public, authenticated 
  USING (is_active = true);

-- Insert starter coupon (EARLY250)
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, max_uses, times_used, expires_at, is_active)
VALUES
  ('EARLY250', 'percentage', 40, 0, 250, 0, '2026-09-15 23:59:59+00', true)
ON CONFLICT (code) DO UPDATE SET discount_value = 40, expires_at = '2026-09-15 23:59:59+00', is_active = true;
