-- Migration 028: Create Bundles and Bundle Tools Tables

CREATE TABLE IF NOT EXISTS public.bundles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  description TEXT,
  category VARCHAR(100) NOT NULL,
  headline VARCHAR(255),
  benefits TEXT[],
  use_case VARCHAR(255),
  who_needs_it TEXT[],
  bundle_icon_url TEXT,
  cover_image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.bundle_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id INT NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  position INT CHECK (position BETWEEN 1 AND 7),
  role_in_workflow VARCHAR(255),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bundle_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_bundles_category ON public.bundles(category);
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON public.bundles(slug);
CREATE INDEX IF NOT EXISTS idx_bundles_featured ON public.bundles(is_featured) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_bundle_tools_bundle ON public.bundle_tools(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_tools_agent ON public.bundle_tools(agent_id);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_tools ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active bundles') THEN
    CREATE POLICY "Public read active bundles" ON public.bundles FOR SELECT USING (is_active = TRUE);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read bundle tools') THEN
    CREATE POLICY "Public read bundle tools" ON public.bundle_tools FOR SELECT
      USING (bundle_id IN (SELECT id FROM public.bundles WHERE is_active = TRUE));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage bundles') THEN
    CREATE POLICY "Admins manage bundles" ON public.bundles FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage bundle tools') THEN
    CREATE POLICY "Admins manage bundle tools" ON public.bundle_tools FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;
