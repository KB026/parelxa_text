-- ============================================
-- Parlexa Dynamic Homepage & Trending Migration
-- ============================================

-- 1. Create interactions table (Views & CTA clicks)
CREATE TABLE IF NOT EXISTS public.agent_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'cta_click')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add pinning and scoring columns to agents
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS is_pinned_trending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trending_score NUMERIC DEFAULT 0;

-- 3. Indexes for fast aggregation
CREATE INDEX IF NOT EXISTS idx_interactions_agent_date ON public.agent_interactions(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_saved_tools_created ON public.saved_tools(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_at);

-- 4. Enable RLS on interactions
ALTER TABLE public.agent_interactions ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Public can insert interactions" ON public.agent_interactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view interactions" ON public.agent_interactions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 6. RPC for calculating trending scores (Algorithm implementation)
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
