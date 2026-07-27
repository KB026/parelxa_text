-- Migration 029: Journey-Based AI Bundles Schema

CREATE TABLE IF NOT EXISTS public.bundles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('journey', 'department')),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.bundle_roles (
  id SERIAL PRIMARY KEY,
  bundle_id INT NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  role_name VARCHAR(255) NOT NULL,
  role_description TEXT,
  role_order INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.bundle_tools (
  id SERIAL PRIMARY KEY,
  bundle_id INT NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES public.bundle_roles(id) ON DELETE CASCADE,
  agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bundle_id, role_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_bundles_slug ON public.bundles(slug);
CREATE INDEX IF NOT EXISTS idx_bundle_roles_bundle ON public.bundle_roles(bundle_id, role_order);
CREATE INDEX IF NOT EXISTS idx_bundle_tools_bundle_role ON public.bundle_tools(bundle_id, role_id);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_tools ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read bundles') THEN
    CREATE POLICY "Public read bundles" ON public.bundles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read bundle roles') THEN
    CREATE POLICY "Public read bundle roles" ON public.bundle_roles FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read bundle tools') THEN
    CREATE POLICY "Public read bundle tools" ON public.bundle_tools FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage bundles') THEN
    CREATE POLICY "Admins manage bundles" ON public.bundles FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage bundle roles') THEN
    CREATE POLICY "Admins manage bundle roles" ON public.bundle_roles FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage bundle tools') THEN
    CREATE POLICY "Admins manage bundle tools" ON public.bundle_tools FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;
