-- ============================================
-- PARLEXA SCHEMA MIGRATION: 001_INIT_SCHEMA
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for updated_at column automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  email TEXT,
  full_name TEXT,
  industry TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT
);

-- 3. Agents Table (Listings)
CREATE TABLE IF NOT EXISTS public.agents (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  one_liner TEXT,
  summary TEXT,
  description TEXT,
  website TEXT,
  demo_url TEXT,
  video_url TEXT,
  logo_url TEXT,
  category TEXT REFERENCES public.categories(name) ON DELETE SET NULL,
  sub_category TEXT,
  raw_industry TEXT,
  use_cases TEXT,
  tags TEXT[],
  industries TEXT[],
  pricing_model TEXT,
  pricing TEXT,
  price_range TEXT,
  free_trial TEXT,
  has_india_pricing BOOLEAN DEFAULT false,
  inr_price TEXT,
  company_name TEXT,
  founded_year INTEGER,
  team_size TEXT,
  city TEXT,
  founders TEXT,
  company_linkedin TEXT,
  company_blurb TEXT,
  founder_linkedin TEXT,
  discovered_date TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_maker_claimed BOOLEAN DEFAULT false,
  is_pinned_trending BOOLEAN DEFAULT false,
  trending_score NUMERIC DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  reviews NUMERIC DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  score_authenticity NUMERIC DEFAULT 0,
  score_business NUMERIC DEFAULT 0,
  score_category NUMERIC DEFAULT 0,
  score_cost NUMERIC DEFAULT 0,
  score_reviews NUMERIC DEFAULT 0,
  score_total NUMERIC DEFAULT 0,
  score_reasoning JSONB,
  screenshots TEXT[],
  source_name TEXT,
  source_url TEXT,
  subscription_id TEXT,
  subscription_status TEXT,
  user_email TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  company_gstin TEXT,
  admin_feedback TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  listing_expires_at TIMESTAMPTZ,
  features TEXT[]
);

-- 4. Agent Interactions Table
CREATE TABLE IF NOT EXISTS public.agent_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'cta_click')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Saved Tools Table (Wishlist/Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, agent_id)
);

-- 6. Saved Listings Table (Requested clone for wishlist/bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, agent_id)
);

-- 7. Reviews Table
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

-- 8. Review Responses Table
CREATE TABLE IF NOT EXISTS public.review_responses (
    review_id UUID PRIMARY KEY REFERENCES public.reviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    vendor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Review Votes Table
CREATE TABLE IF NOT EXISTS public.review_votes (
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (review_id, user_id)
);

-- 10. Listing Claims Table
CREATE TABLE IF NOT EXISTS public.listing_claims (
    id SERIAL PRIMARY KEY,
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_email TEXT NOT NULL,
    role TEXT NOT NULL,
    note TEXT,
    verification_token UUID DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'pending_email' CHECK (status IN ('pending_email', 'verified', 'approved', 'rejected', 'verified_pending_admin', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, agent_id)
);

-- 11. Promotions Table
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INT REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('featured_home', 'featured_category')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'manual_authorized')),
  plan TEXT NOT NULL CHECK (plan IN ('weekly', 'monthly')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id INT REFERENCES public.agents(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway TEXT DEFAULT 'razorpay',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  renewal_date TIMESTAMPTZ,
  subscription_id TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Verification Requests Table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id INT REFERENCES public.agents(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT NOT NULL,
  gst_number TEXT NOT NULL,
  press_mentions TEXT,
  product_demo_url TEXT NOT NULL,
  rejection_reason TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'verified', 'rejected')),
  work_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Moderation Reports Table
CREATE TABLE IF NOT EXISTS public.moderation_reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('agent', 'review')),
  target_id INT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. External Reviews Table
CREATE TABLE IF NOT EXISTS public.external_reviews (
  id SERIAL PRIMARY KEY,
  agent_id INT REFERENCES public.agents(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  rating DECIMAL(3,2),
  reviews_count INTEGER,
  snippet TEXT,
  source_url TEXT,
  last_fetched_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Search Logs Table
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. Search Queries Table
CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  recommendation_count INTEGER DEFAULT 0,
  is_ai_powered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Tools Table (Legacy/Alternate metadata registry)
CREATE TABLE IF NOT EXISTS public.tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT,
  logo_url TEXT,
  website_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. Organizations Table (CTO Request)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  billing_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 21. Organization Members Table (CTO Request)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 22. Billing Transactions Table (CTO Request)
CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway TEXT DEFAULT 'razorpay',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Triggers for auto-updating updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_responses_updated_at BEFORE UPDATE ON public.review_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listing_claims_updated_at BEFORE UPDATE ON public.listing_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON public.verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moderation_reports_updated_at BEFORE UPDATE ON public.moderation_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_members_updated_at BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Custom functions for analytics, trending scores, and promotions
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

-- Auto profile creation trigger on User Signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

-- Establish RLS Policies
-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Agents Policies
CREATE POLICY "Agents are viewable by everyone" ON public.agents FOR SELECT USING (approval_status = 'approved' OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Vendors can insert their own agents" ON public.agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vendors can update their own agents" ON public.agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all agents" ON public.agents FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Agent Interactions Policies
CREATE POLICY "Anyone can log interactions" ON public.agent_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Interactions are viewable by admins and owners" ON public.agent_interactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) OR 
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid())
);

-- Saved Tools / Listings Policies
CREATE POLICY "Users can manage their saved tools" ON public.saved_tools FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their saved listings" ON public.saved_listings FOR ALL USING (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews FOR SELECT USING (approval_status = 'approved' OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can submit reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update/delete their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Review Responses Policies
CREATE POLICY "Responses are viewable by everyone" ON public.review_responses FOR SELECT USING (true);
CREATE POLICY "Vendors can respond to reviews on their agents" ON public.review_responses FOR ALL USING (
  auth.uid() = vendor_id AND EXISTS (
    SELECT 1 FROM public.reviews r
    JOIN public.agents a ON r.agent_id = a.id
    WHERE r.id = review_id AND a.user_id = auth.uid()
  )
);

-- Review Votes Policies
CREATE POLICY "Votes are viewable by everyone" ON public.review_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on reviews" ON public.review_votes FOR ALL USING (auth.uid() = user_id);

-- Listing Claims Policies
CREATE POLICY "Users can view their own claims" ON public.listing_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit claims" ON public.listing_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all claims" ON public.listing_claims FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Promotions Policies
CREATE POLICY "Active promotions are viewable by everyone" ON public.promotions FOR SELECT USING (status = 'active');
CREATE POLICY "Users can view their own promotions" ON public.promotions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all promotions" ON public.promotions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Transactions Policies
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all transactions" ON public.transactions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Verification Requests Policies
CREATE POLICY "Users can view their own verification requests" ON public.verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit verification requests" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all verification requests" ON public.verification_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Moderation Reports Policies
CREATE POLICY "Users can submit moderation reports" ON public.moderation_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage all moderation reports" ON public.moderation_reports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Site Settings Policies
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- External Reviews Policies
CREATE POLICY "External reviews are viewable by everyone" ON public.external_reviews FOR SELECT USING (true);
CREATE POLICY "Admins can manage external reviews" ON public.external_reviews FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Search Logs Policies
CREATE POLICY "Admins can view search logs" ON public.search_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Anyone can insert search logs" ON public.search_logs FOR INSERT WITH CHECK (true);

-- Search Queries Policies
CREATE POLICY "Search queries are viewable by everyone" ON public.search_queries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert search queries" ON public.search_queries FOR INSERT WITH CHECK (true);

-- Tools Policies
CREATE POLICY "Tools are viewable by everyone" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Admins can manage tools" ON public.tools FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Organizations Policies
CREATE POLICY "Members can view their organization" ON public.organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Owners can update organization details" ON public.organizations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = id AND user_id = auth.uid() AND role = 'owner')
);

-- Organization Members Policies
CREATE POLICY "Members can view organization memberships" ON public.organization_members FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Owners/Admins can manage memberships" ON public.organization_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = organization_members.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Billing Transactions Policies
CREATE POLICY "Users can view organization billing transactions" ON public.billing_transactions FOR SELECT USING (
  user_id = auth.uid() OR
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- -------------------------------------------------------------
-- PERFORMANCE INDEXES (Optimized for marketplace queries)
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_agents_approval_status ON public.agents(approval_status);
CREATE INDEX IF NOT EXISTS idx_agents_category ON public.agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON public.agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_trending_score ON public.agents(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_agents_is_featured ON public.agents(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_reviews_agent_id ON public.reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approval_status ON public.reviews(approval_status);

CREATE INDEX IF NOT EXISTS idx_saved_tools_user_id ON public.saved_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON public.saved_listings(user_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);

CREATE INDEX IF NOT EXISTS idx_promotions_status ON public.promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON public.promotions(end_date);
