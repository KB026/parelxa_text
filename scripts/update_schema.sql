-- Migration Script: Add Moderation Fields to Agents Table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Backfill existing seeded components to be securely approved right away
UPDATE public.agents SET approval_status = 'approved' WHERE approval_status = 'pending';
