-- ============================================
-- MIGRATION 033: Vendor Plan Columns on agents
-- ============================================

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS vendor_plan TEXT DEFAULT 'free'
    CHECK (vendor_plan IN ('free', 'growth', 'pro')),
  ADD COLUMN IF NOT EXISTS vendor_plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vendor_plan_payment_id TEXT;

-- Index for fast plan-tier queries (homepage featured, search ordering)
CREATE INDEX IF NOT EXISTS idx_agents_vendor_plan ON public.agents(vendor_plan);
