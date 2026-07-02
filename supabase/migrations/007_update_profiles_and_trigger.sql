-- 1. Ensure columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Migrate existing data (split full_name into first_name and last_name)
UPDATE public.profiles
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = NULLIF(SUBSTRING(full_name FROM STRPOS(full_name, ' ') + 1), split_part(full_name, ' ', 1))
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- 3. Drop full_name
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- 4. Recreate the trigger function securely handling raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Extract from raw_user_meta_data
  -- Fallback logic for OAuth providers that only send 'full_name' or 'name'
  v_first_name := COALESCE(
    new.raw_user_meta_data->>'first_name',
    split_part(new.raw_user_meta_data->>'full_name', ' ', 1),
    split_part(new.raw_user_meta_data->>'name', ' ', 1),
    ''
  );
  
  v_last_name := COALESCE(
    new.raw_user_meta_data->>'last_name',
    NULLIF(SUBSTRING(new.raw_user_meta_data->>'full_name' FROM STRPOS(new.raw_user_meta_data->>'full_name', ' ') + 1), v_first_name),
    NULLIF(SUBSTRING(new.raw_user_meta_data->>'name' FROM STRPOS(new.raw_user_meta_data->>'name', ' ') + 1), v_first_name),
    ''
  );

  INSERT INTO public.profiles (id, first_name, last_name, email, role, is_admin)
  VALUES (
    new.id,
    v_first_name,
    v_last_name,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
