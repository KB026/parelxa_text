-- ============================================
-- Parlexa Verified Badge Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add verified flag to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  gst_number TEXT NOT NULL,
  company_website TEXT NOT NULL,
  work_email TEXT NOT NULL,
  product_demo_url TEXT NOT NULL,
  press_mentions TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'verified', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own requests
CREATE POLICY "Users can view own verification requests"
  ON public.verification_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own requests
CREATE POLICY "Users can insert verification requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admin full access (service role bypasses RLS, but this is a fallback)
CREATE POLICY "Admin full access to verification requests"
  ON public.verification_requests FOR ALL
  USING (true);

-- 4. Update existing seed agents — mark some as verified for demo
UPDATE public.agents SET is_verified = true WHERE id IN (1, 7, 9, 12, 19, 40, 46, 55, 80);
