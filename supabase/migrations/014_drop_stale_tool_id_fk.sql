-- Drop the stale foreign key constraint and tool_id column from saved_tools table
-- This column was added previously but causes ambiguous relationship errors with agents table.
ALTER TABLE public.saved_tools DROP CONSTRAINT IF EXISTS fk_saved_tools_agent_id;
ALTER TABLE public.saved_tools DROP COLUMN IF EXISTS tool_id;
