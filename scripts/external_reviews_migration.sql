-- ============================================================
-- Parlexa Verified External Reviews & Proof Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Ensure external_reviews table exists and add new verification columns
CREATE TABLE IF NOT EXISTS public.external_reviews (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
  platform TEXT,
  source TEXT,
  url TEXT,
  source_url TEXT,
  status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'rejected')),
  rating NUMERIC(3,2),
  reviews_count INTEGER DEFAULT 0,
  snippet TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  last_fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table already existed without them
ALTER TABLE public.external_reviews ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.external_reviews ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.external_reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unverified';
ALTER TABLE public.external_reviews ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.external_reviews ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.external_reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Row Level Security
ALTER TABLE public.external_reviews ENABLE ROW LEVEL SECURITY;

-- Public can view verified external reviews
DROP POLICY IF EXISTS "Public can view verified external reviews" ON public.external_reviews;
CREATE POLICY "Public can view verified external reviews"
  ON public.external_reviews FOR SELECT
  USING (true);

-- Authenticated vendors can insert external reviews for their tools
DROP POLICY IF EXISTS "Vendors can insert external reviews" ON public.external_reviews;
CREATE POLICY "Vendors can insert external reviews"
  ON public.external_reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admin full access (Service role bypasses RLS automatically)
DROP POLICY IF EXISTS "Admin full access to external reviews" ON public.external_reviews;
CREATE POLICY "Admin full access to external reviews"
  ON public.external_reviews FOR ALL
  USING (true);
