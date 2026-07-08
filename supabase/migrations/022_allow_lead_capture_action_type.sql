ALTER TABLE public.agent_interactions DROP CONSTRAINT IF EXISTS agent_interactions_action_type_check;
ALTER TABLE public.agent_interactions ADD CONSTRAINT agent_interactions_action_type_check CHECK (action_type IN ('view', 'cta_click', 'compare', 'lead_capture'));
