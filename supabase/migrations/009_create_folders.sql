-- Create the saved_tools_folders table
CREATE TABLE IF NOT EXISTS public.saved_tools_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable RLS for folders
ALTER TABLE public.saved_tools_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own folders"
  ON public.saved_tools_folders FOR ALL
  USING (auth.uid() = user_id);

-- Add folder_id to saved_tools
ALTER TABLE public.saved_tools 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.saved_tools_folders(id) ON DELETE SET NULL;
