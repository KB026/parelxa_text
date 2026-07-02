-- ============================================
-- Parlexa Consumer Dashboard Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create Profiles Table (if not exists) or Extend
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    industry TEXT,
    company_size TEXT,
    notification_prefs JSONB DEFAULT '{"new_tools": true, "price_drops": true, "review_responses": true}'::jsonb,
    ai_finder_prefs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Saved Tools (Wishlist) Table
CREATE TABLE IF NOT EXISTS public.saved_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    folder_name TEXT DEFAULT 'Wishlist',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, agent_id)
);

-- 3. Create Compare History Table
CREATE TABLE IF NOT EXISTS public.compare_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_ids INT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compare_history ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Policies for Saved Tools
CREATE POLICY "Users can manage their own wishlist" ON public.saved_tools
    FOR ALL USING (auth.uid() = user_id);

-- 7. Policies for Compare History
CREATE POLICY "Users can view their own history" ON public.compare_history
    FOR ALL USING (auth.uid() = user_id);

-- 8. Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
