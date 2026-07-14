-- Create ai_search_cache table to store AI responses
CREATE TABLE IF NOT EXISTS public.ai_search_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL,
    route TEXT NOT NULL,
    response_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a unique constraint on query_hash and route to ensure we don't have duplicates for the same query on the same route
CREATE UNIQUE INDEX IF NOT EXISTS ai_search_cache_query_hash_route_idx ON public.ai_search_cache (query_hash, route);

-- Enable RLS
ALTER TABLE public.ai_search_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read the cache (it only stores AI responses for public tools)
CREATE POLICY "Anyone can read AI cache" 
    ON public.ai_search_cache FOR SELECT 
    USING (true);

-- Create policy to allow anyone to insert into the cache
CREATE POLICY "Anyone can insert AI cache" 
    ON public.ai_search_cache FOR INSERT 
    WITH CHECK (true);

-- Create policy to allow anyone to update the cache (for upsert)
CREATE POLICY "Anyone can update AI cache" 
    ON public.ai_search_cache FOR UPDATE 
    USING (true);
