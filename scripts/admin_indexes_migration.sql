-- Performance indexes for admin dashboards and transaction views

CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON public.agents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_approval_status ON public.agents (approval_status);
CREATE INDEX IF NOT EXISTS idx_agents_category ON public.agents (category);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_agent_id ON public.transactions (agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests (status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON public.moderation_reports (status);