ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS comparison_id UUID DEFAULT gen_random_uuid();
