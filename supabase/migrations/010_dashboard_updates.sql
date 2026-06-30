-- Add folder_name column to existing saved_tools table since the user asked for it
ALTER TABLE public.saved_tools ADD COLUMN IF NOT EXISTS folder_name TEXT DEFAULT 'All Tools';

-- Create saved_tool_folders table (similar to 009 but following exactly the user's schema naming)
CREATE TABLE IF NOT EXISTS public.saved_tool_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, folder_name)
);

-- Enable RLS
ALTER TABLE public.saved_tool_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own folders"
  ON public.saved_tool_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create folders"
  ON public.saved_tool_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
