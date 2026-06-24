-- =============================================================================
-- FIX: Infinite Recursion in profiles RLS Policies
-- =============================================================================
-- Problem: The "profiles" table has RLS policies that query the "profiles" 
-- table itself to check admin status, creating infinite recursion.
-- 
-- Solution: Drop ALL existing policies on profiles, then recreate only safe ones.
-- For admin checks on OTHER tables, use auth.jwt() metadata instead of 
-- subquerying profiles.
-- =============================================================================

-- Step 1: Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by users who created them." ON public.profiles;

-- Step 2: Recreate safe policies (NO self-referencing subqueries)
-- SELECT: Everyone can read profiles (public marketplace data)
CREATE POLICY "profiles_select_public" ON public.profiles 
  FOR SELECT USING (true);

-- INSERT: Users can create their own profile (signup trigger / manual)
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- DELETE: Only service role can delete (no RLS policy needed; service role bypasses RLS)
-- No DELETE policy = users cannot delete profiles via client

-- =============================================================================
-- Step 3: Fix admin check patterns on OTHER tables
-- Instead of: EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
-- Use:        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
-- Or create a SECURITY DEFINER function that bypasses RLS
-- =============================================================================

-- Create a SECURITY DEFINER function to safely check admin status
-- This function runs with table owner privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Now update all policies on OTHER tables to use is_admin() instead of 
-- direct profiles subquery. The SECURITY DEFINER function bypasses RLS 
-- on profiles, preventing the recursion.

-- Categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories 
  FOR ALL USING (public.is_admin());

-- Agents: Fix the SELECT policy that also checks admin
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON public.agents;
CREATE POLICY "Agents are viewable by everyone" ON public.agents 
  FOR SELECT USING (
    approval_status = 'approved' 
    OR auth.uid() = user_id 
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage all agents" ON public.agents;
CREATE POLICY "Admins can manage all agents" ON public.agents 
  FOR ALL USING (public.is_admin());

-- Agent Interactions  
DROP POLICY IF EXISTS "Users can manage their own interactions" ON public.agent_interactions;
CREATE POLICY "Users can manage their own interactions" ON public.agent_interactions
  FOR ALL USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- Reviews
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews 
  FOR SELECT USING (
    approval_status = 'approved' 
    OR auth.uid() = user_id 
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews" ON public.reviews 
  FOR ALL USING (public.is_admin());

-- Listing Claims
DROP POLICY IF EXISTS "Admins can manage all claims" ON public.listing_claims;
CREATE POLICY "Admins can manage all claims" ON public.listing_claims 
  FOR ALL USING (public.is_admin());

-- Promotions
DROP POLICY IF EXISTS "Admins can manage all promotions" ON public.promotions;
CREATE POLICY "Admins can manage all promotions" ON public.promotions 
  FOR ALL USING (public.is_admin());

-- Transactions
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
CREATE POLICY "Admins can manage all transactions" ON public.transactions 
  FOR ALL USING (public.is_admin());

-- Verification Requests
DROP POLICY IF EXISTS "Admins can manage all verification requests" ON public.verification_requests;
CREATE POLICY "Admins can manage all verification requests" ON public.verification_requests 
  FOR ALL USING (public.is_admin());

-- Moderation Reports
DROP POLICY IF EXISTS "Admins can manage all moderation reports" ON public.moderation_reports;
CREATE POLICY "Admins can manage all moderation reports" ON public.moderation_reports 
  FOR ALL USING (public.is_admin());

-- Site Settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings 
  FOR ALL USING (public.is_admin());

-- External Reviews
DROP POLICY IF EXISTS "Admins can manage external reviews" ON public.external_reviews;
CREATE POLICY "Admins can manage external reviews" ON public.external_reviews 
  FOR ALL USING (public.is_admin());

-- Search Logs
DROP POLICY IF EXISTS "Admins can view search logs" ON public.search_logs;
CREATE POLICY "Admins can view search logs" ON public.search_logs 
  FOR SELECT USING (public.is_admin());

-- Tools
DROP POLICY IF EXISTS "Admins can manage tools" ON public.tools;
CREATE POLICY "Admins can manage tools" ON public.tools 
  FOR ALL USING (public.is_admin());

-- Organizations
DROP POLICY IF EXISTS "Organization members can view their org" ON public.organizations;
CREATE POLICY "Organization members can view their org" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
    ) OR public.is_admin()
  );

DROP POLICY IF EXISTS "Organization owners can update their org" ON public.organizations;
CREATE POLICY "Organization owners can update their org" ON public.organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
      AND role = 'owner'
    ) OR public.is_admin()
  );

-- Organization Members
DROP POLICY IF EXISTS "Members can view their org members" ON public.organization_members;
CREATE POLICY "Members can view their org members" ON public.organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members AS om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    ) OR public.is_admin()
  );

-- Billing Transactions
DROP POLICY IF EXISTS "Users can view their own billing" ON public.billing_transactions;
CREATE POLICY "Users can view their own billing" ON public.billing_transactions
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin()
  );
