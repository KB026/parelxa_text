-- ============================================
-- Profile Role Migration (Tech Team Final Build)
-- ============================================

-- 1. Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin'));

-- 2. Populate roles from existing metadata (optional for existing users)
UPDATE public.profiles p
SET role = (u.raw_user_meta_data->>'role')
FROM auth.users u
WHERE p.id = u.id AND u.raw_user_meta_data->>'role' IS NOT NULL;

-- 3. Hardening Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
