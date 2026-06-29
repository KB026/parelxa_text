-- Explicitly ensure the role column exists with proper constraints
DO $$ 
BEGIN
    -- Check if column exists, add it if it doesn't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- Drop constraint if it exists to replace it safely
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add check constraint to ensure validity of role
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'vendor', 'admin'));
