-- ============================================
-- Parlexa Listing Form Migration
-- Run this in Supabase SQL Editor
-- ============================================

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
