-- ============================================
-- PARLEXA SCHEMA MIGRATION: 004_CREATE_LEADS
-- ============================================

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own leads
CREATE POLICY "Vendors can view their own leads"
    ON public.leads
    FOR SELECT
    USING (auth.uid() = vendor_id);

-- Anyone can insert a lead (public form)
CREATE POLICY "Anyone can insert a lead"
    ON public.leads
    FOR INSERT
    WITH CHECK (true);
