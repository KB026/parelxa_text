-- ============================================
-- Parlexa Listing Claim Flow Migration
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
CREATE POLICY "Users can view their own claims" ON public.listing_claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims" ON public.listing_claims
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Trigger for updated_at
CREATE TRIGGER update_listing_claims_updated_at 
BEFORE UPDATE ON public.listing_claims 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
