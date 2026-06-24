-- ============================================
-- Parlexa Listing Claim Table (Consolidated)
-- ============================================

-- 1. Create Listing Claims Table
CREATE TABLE IF NOT EXISTS public.listing_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_email TEXT NOT NULL,
    role TEXT NOT NULL,
    note TEXT,
    verification_token UUID DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'pending_email' CHECK (status IN ('pending_email', 'verified', 'approved', 'rejected', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- Prevent duplicate pending claims for same tool by same user
    UNIQUE(user_id, agent_id)
);

-- 2. Index for verification token lookup
CREATE INDEX IF NOT EXISTS idx_listing_claims_token ON public.listing_claims(verification_token);

-- 3. Enable RLS
ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own claims') THEN
        CREATE POLICY "Users can view their own claims" ON public.listing_claims
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all claims') THEN
        CREATE POLICY "Admins can manage all claims" ON public.listing_claims
            FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own claims') THEN
        CREATE POLICY "Users can insert their own claims" ON public.listing_claims
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Trigger for updated_at (ensure the function update_updated_at_column exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_listing_claims_updated_at ON public.listing_claims;
CREATE TRIGGER update_listing_claims_updated_at 
BEFORE UPDATE ON public.listing_claims 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Trigger for profile synchronization (Hardening)
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

-- Re-attach trigger to auth.users (requires superuser or bypassrls, usually works in Supabase SQL editor)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
