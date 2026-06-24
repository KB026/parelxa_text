const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  const migrationSql = `
-- ============================================
-- PARLEXA SCHEMA RECOVERY (DIRECT RUN)
-- ============================================

-- 0. Profiles Table Extension
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    industry TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1. Helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. New User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Hardening Agents Table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_pinned_trending BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS trending_score NUMERIC DEFAULT 0;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- 4. Create Interactions Table
CREATE TABLE IF NOT EXISTS public.agent_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'cta_click')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Saved Tools (Wishlist)
CREATE TABLE IF NOT EXISTS public.saved_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, agent_id)
);

-- 6. Create Trending algorithm function
CREATE OR REPLACE FUNCTION public.calculate_weekly_trending_scores()
RETURNS void AS $$
BEGIN
  UPDATE public.agents a
  SET trending_score = (
    COALESCE((SELECT COUNT(*) * 1.0 FROM public.transactions t WHERE t.agent_id = a.id AND t.status = 'completed' AND t.created_at > now() - interval '7 days'), 0) +
    COALESCE((SELECT COUNT(*) * 0.3 FROM public.saved_tools s WHERE s.agent_id = a.id AND s.created_at > now() - interval '7 days'), 0) +
    COALESCE((SELECT COUNT(*) * 0.2 FROM public.agent_interactions i WHERE i.agent_id = a.id AND i.action_type = 'view' AND i.created_at > now() - interval '7 days'), 0) +
    COALESCE((SELECT COUNT(*) * 0.1 FROM public.agent_interactions i WHERE i.agent_id = a.id AND i.action_type = 'cta_click' AND i.created_at > now() - interval '7 days'), 0)
  )
  WHERE true; -- Standard PG update for all rows
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Execute Sync
SELECT public.calculate_weekly_trending_scores();

-- 8. Final Schema Reload
NOTIFY pgrst, 'reload schema';
  `;

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully. Executing recovery migration...');
    
    await client.query(migrationSql);
    
    console.log('SUCCESS: Database schema sync complete.');
  } catch (err) {
    console.error('CRITICAL ERROR during migration:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.where) console.error('Where:', err.where);
  } finally {
    await client.end();
  }
}

run();
