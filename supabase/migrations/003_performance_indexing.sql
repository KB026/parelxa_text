-- =======================================================
-- PARLEXA PERFORMANCE & INDEXING MIGRATION
-- =======================================================

-- 1. Agents (Listings) Table Indexes
CREATE INDEX IF NOT EXISTS idx_agents_category ON public.agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON public.agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_sub_category ON public.agents(sub_category);
CREATE INDEX IF NOT EXISTS idx_agents_approval_status ON public.agents(approval_status);

-- 2. Reviews Table Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_agent_id ON public.reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approval_status ON public.reviews(approval_status);

-- 3. Profiles Table Index
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- 4. Billing Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_billing_transactions_user_id ON public.billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_created_at ON public.billing_transactions(created_at DESC);

-- 5. Search Logs Indexes
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON public.search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at DESC);

-- 6. Trigger for Denormalizing Review Count and Average Rating on Agents
CREATE OR REPLACE FUNCTION public.update_agent_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_agent_id INT;
BEGIN
  target_agent_id := COALESCE(NEW.agent_id, OLD.agent_id);

  UPDATE public.agents
  SET 
    reviews_count = COALESCE((
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE agent_id = target_agent_id AND approval_status = 'approved'
    ), 0),
    rating = COALESCE((
      SELECT ROUND(AVG(rating_overall)::numeric, 2)
      FROM public.reviews 
      WHERE agent_id = target_agent_id AND approval_status = 'approved'
    ), 0.0)
  WHERE id = target_agent_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS review_stats_trigger ON public.reviews;
CREATE TRIGGER review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_review_stats();
