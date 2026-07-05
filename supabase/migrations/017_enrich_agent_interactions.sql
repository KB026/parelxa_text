ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS traffic_source TEXT;
ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS visitor_location TEXT;
ALTER TABLE public.agent_interactions ADD COLUMN IF NOT EXISTS search_keyword TEXT;
