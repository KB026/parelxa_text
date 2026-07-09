-- Migration to add soft delete support for agents
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
