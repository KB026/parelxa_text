-- Drop the obsolete lead_clicks table since we are consolidating lead tracking into agent_interactions
DROP TABLE IF EXISTS public.lead_clicks CASCADE;
