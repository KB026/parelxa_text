-- Soft delete RLS policies for public read access
DROP POLICY IF EXISTS "Enable read access for agents" ON public.agents;
DROP POLICY IF EXISTS "Public Read" ON public.agents;

CREATE POLICY "Enable read access for non-deleted agents" ON public.agents 
  FOR SELECT 
  USING (is_deleted = false AND approval_status = 'approved');
