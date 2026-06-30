CREATE TABLE IF NOT EXISTS public.lead_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INTEGER NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_clicks_agent_id ON public.lead_clicks(agent_id);
CREATE INDEX IF NOT EXISTS idx_lead_clicks_user_id ON public.lead_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_clicks_created_at ON public.lead_clicks(created_at);
