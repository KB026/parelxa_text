-- ============================================
-- Parlexa Featured Listings Migration
-- ============================================

-- 1. Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('featured_category', 'featured_home')),
  category TEXT, -- Nullable for featured_home
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'manual_authorized')),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id INTEGER REFERENCES public.agents(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Promotions Policies
CREATE POLICY "Users can view own promotions"
  ON public.promotions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active promotions"
  ON public.promotions FOR SELECT
  USING (status = 'active' AND end_date > NOW());

-- Transactions Policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Initial Seed for Demo
-- Mark some agents as 'Featured' for homepage/category visibility
-- Assuming agent 1, 5, 10 are verified and high rated
INSERT INTO public.promotions (agent_id, user_id, type, end_date, status)
SELECT id, user_id, 'featured_home', NOW() + interval '30 days', 'active'
FROM public.agents
WHERE id IN (1, 5, 12, 18, 40) AND is_verified = true
ON CONFLICT DO NOTHING;
