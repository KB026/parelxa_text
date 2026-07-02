-- ============================================
-- PARLEXA MASTER SCHEMA SYNC (PRODUCTION READY)
-- Run this in your Supabase SQL Editor
-- ============================================

-- 0. Profiles Table Extension
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- 1. Helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Hardening Agents Table
-- This ensures all columns expected by the server components exist
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_pinned_trending BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS trending_score NUMERIC DEFAULT 0;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS total_saves INTEGER DEFAULT 0;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add missing field columns if they don't exist
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS one_liner TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS demo_url TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS screenshots TEXT[];
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS industries TEXT[];
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS pricing_model TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS price_range TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS free_trial TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS has_india_pricing BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS inr_price TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS company_linkedin TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS company_blurb TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS summary TEXT;

-- 3. Create Interactions Table
CREATE TABLE IF NOT EXISTS public.agent_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'cta_click')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Saved Tools (Wishlist)
CREATE TABLE IF NOT EXISTS public.saved_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, agent_id)
);

-- 5. Create Reviews system
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating_ease_use SMALLINT CHECK (rating_ease_use BETWEEN 1 AND 5),
    rating_value SMALLINT CHECK (rating_value BETWEEN 1 AND 5),
    rating_support SMALLINT CHECK (rating_support BETWEEN 1 AND 5),
    rating_relevance SMALLINT CHECK (rating_relevance BETWEEN 1 AND 5),
    rating_overall DECIMAL(3,2),
    content TEXT NOT NULL,
    recommend BOOLEAN DEFAULT true,
    use_case TEXT,
    approval_status TEXT DEFAULT 'approved',
    is_reported BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, agent_id)
);

-- 6. Create Listing Claims
CREATE TABLE IF NOT EXISTS public.listing_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_email TEXT NOT NULL,
    role TEXT NOT NULL,
    note TEXT,
    verification_token UUID DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'pending_email' CHECK (status IN ('pending_email', 'verified', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, agent_id)
);

-- 7. Create Promotions & Transactions
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'manual_authorized')),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id INTEGER REFERENCES public.agents(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  gateway_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RPC for Trending algorithm
CREATE OR REPLACE FUNCTION public.calculate_weekly_trending_scores()
RETURNS void AS $$
BEGIN
  UPDATE public.agents a
  SET trending_score = (
    COALESCE((SELECT COUNT(*) * 0.4 FROM public.agent_interactions i WHERE i.agent_id = a.id AND i.action_type = 'view' AND i.created_at > now() - interval '7 days'), 0) +
    COALESCE((SELECT COUNT(*) * 0.3 FROM public.saved_tools s WHERE s.agent_id = a.id AND s.created_at > now() - interval '7 days'), 0) +
    COALESCE((SELECT COUNT(*) * 0.2 FROM public.reviews r WHERE r.agent_id = a.id AND r.created_at > now() - interval '7 days'), 0) +
    COALESCE((SELECT COUNT(*) * 0.1 FROM public.agent_interactions i WHERE i.agent_id = a.id AND i.action_type = 'cta_click' AND i.created_at > now() - interval '7 days'), 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger for trending score RPC on some interval is complex in Supabase, 
-- but Next.js will call it every time the homepage is hit via a server action / revalidation logic.

-- 10. Enable RLS and insert initial policies
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    LOOP
        EXECUTE 'ALTER TABLE public.' || t || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- 11. Global Select Policy
-- This assumes public discovery by default
CREATE POLICY IF NOT EXISTS "Public Read" ON public.agents FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public Read" ON public.categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public Read" ON public.reviews FOR SELECT USING (approval_status = 'approved');

-- 12. Update IDs seq
SELECT setval('agents_id_seq', (SELECT MAX(id) FROM public.agents));
