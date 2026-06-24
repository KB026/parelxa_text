-- 1. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin')),
  is_admin BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.agents (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  founders TEXT,
  founder_linkedin TEXT,
  website TEXT,
  city TEXT,
  raw_industry TEXT,
  category TEXT REFERENCES public.categories(name),
  sub_category TEXT,
  one_liner TEXT,
  summary TEXT,
  description TEXT,
  logo_url TEXT,
  founded_year INTEGER,
  use_cases TEXT,
  pricing TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  admin_feedback TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_maker_claimed BOOLEAN DEFAULT false,
  is_pinned_trending BOOLEAN DEFAULT false,
  trending_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  content TEXT,
  rating_overall INTEGER CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_ease_use INTEGER,
  rating_value INTEGER,
  rating_support INTEGER,
  is_reported BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  company_name TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'verified', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moderation_reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('agent', 'review')),
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_claims (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  work_email TEXT NOT NULL,
  role TEXT NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'pending_email' CHECK (status IN ('pending_email', 'verified_pending_admin', 'approved', 'rejected', 'disputed')),
  verification_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.external_reviews (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  rating DECIMAL(3,2),
  reviews_count INTEGER,
  snippet TEXT,
  source_url TEXT,
  last_fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('featured_home', 'featured_category')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  plan TEXT NOT NULL CHECK (plan IN ('weekly', 'monthly')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway TEXT DEFAULT 'razorpay',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS and add policies safely
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Promotions & Transactions Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all promotions') THEN
        CREATE POLICY "Admins can manage all promotions" ON public.promotions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own promotions') THEN
        CREATE POLICY "Users can view their own promotions" ON public.promotions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable public read for active promotions') THEN
        CREATE POLICY "Enable public read for active promotions" ON public.promotions FOR SELECT USING (status = 'active');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage transactions') THEN
        CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own transactions') THEN
        CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- External Reviews Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable public read for external reviews') THEN
        CREATE POLICY "Enable public read for external reviews" ON public.external_reviews FOR SELECT USING (true);
    END IF;

    -- Profiles Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles') THEN
        CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Categories Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
    END IF;

    -- Agents Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for agents') THEN
        CREATE POLICY "Enable read access for agents" ON public.agents FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Vendors can manage their own agents') THEN
        CREATE POLICY "Vendors can manage their own agents" ON public.agents FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Reviews Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Reviews viewable by everyone') THEN
        CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users create reviews') THEN
        CREATE POLICY "Users create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Verification Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own requests') THEN
        CREATE POLICY "Users view own requests" ON public.verification_requests FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage requests') THEN
        CREATE POLICY "Admins manage requests" ON public.verification_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
    END IF;

    -- Listing Claims Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable claim table for RLS') THEN
        ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own claims') THEN
        CREATE POLICY "Users can view their own claims" ON public.listing_claims FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can submit claims') THEN
        CREATE POLICY "Users can submit claims" ON public.listing_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage claims') THEN
        CREATE POLICY "Admins manage claims" ON public.listing_claims FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
    END IF;
END $$;

-- 3. Functions and Triggers
CREATE OR REPLACE FUNCTION public.increment_impressions(promotion_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE public.promotions
  SET impressions = impressions + 1
  WHERE id = ANY(promotion_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_clicks(promotion_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.promotions
  SET clicks = clicks + 1
  WHERE id = promotion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.activate_promotion(
  p_agent_id INTEGER,
  p_plan TEXT,
  p_payment_id TEXT,
  p_amount DECIMAL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_end_date TIMESTAMPTZ;
  v_promo_type TEXT;
  v_promo_id UUID;
BEGIN
  -- Get user_id from agent
  SELECT user_id INTO v_user_id FROM public.agents WHERE id = p_agent_id;
  
  -- Calculate end date
  IF p_plan = 'weekly' THEN
    v_end_date := now() + interval '7 days';
  ELSE
    v_end_date := now() + interval '30 days';
  END IF;

  -- Determine type (defaulting to featured_home for now, but could be specific)
  v_promo_type := 'featured_home';

  -- 1. Create Transaction
  INSERT INTO public.transactions (user_id, agent_id, amount, status, gateway_payment_id)
  VALUES (v_user_id, p_agent_id, p_amount, 'completed', p_payment_id);

  -- 2. Create Promotion
  INSERT INTO public.promotions (agent_id, user_id, type, plan, amount, end_date)
  VALUES (p_agent_id, v_user_id, v_promo_type, p_plan, p_amount, v_end_date)
  RETURNING id INTO v_promo_id;

  -- 3. Update Agent
  UPDATE public.agents SET is_featured = true WHERE id = p_agent_id;

  RETURN jsonb_build_object('success', true, 'promotion_id', v_promo_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger check
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;