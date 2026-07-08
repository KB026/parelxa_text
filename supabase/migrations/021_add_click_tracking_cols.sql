ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS referrer_page TEXT;
ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS device_type TEXT;
