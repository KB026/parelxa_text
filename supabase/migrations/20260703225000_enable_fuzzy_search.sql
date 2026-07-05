CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_agents_name_trgm ON public.agents USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_agents_summary_trgm ON public.agents USING gin (summary gin_trgm_ops);

CREATE OR REPLACE FUNCTION fuzzy_search_agents(search_query TEXT, similarity_threshold FLOAT DEFAULT 0.25)
RETURNS SETOF public.agents AS $$
  SELECT * FROM public.agents
  WHERE approval_status = 'approved'
  AND (similarity(name, search_query) > similarity_threshold OR similarity(summary, search_query) > similarity_threshold)
  ORDER BY GREATEST(similarity(name, search_query), similarity(summary, search_query)) DESC
  LIMIT 10;
$$ LANGUAGE sql STABLE;
