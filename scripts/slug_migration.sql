-- Add slug column to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_slug ON public.agents(slug);

-- Enable RLS for slug if not already (it should be since table is RLS enabled)
