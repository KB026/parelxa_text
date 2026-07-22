-- Enable storage bucket RLS policies for agent-logos and agent-screenshots

-- 1. Create or update agent-logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-logos', 'agent-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create or update agent-screenshots bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-screenshots', 'agent-screenshots', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Public Access agent-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload agent-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Update agent-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete agent-logos" ON storage.objects;

DROP POLICY IF EXISTS "Public Access agent-screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload agent-screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Public Update agent-screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete agent-screenshots" ON storage.objects;

-- 4. RLS policies for agent-logos
CREATE POLICY "Public Access agent-logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'agent-logos');

CREATE POLICY "Public Upload agent-logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'agent-logos');

CREATE POLICY "Public Update agent-logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'agent-logos');

CREATE POLICY "Public Delete agent-logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'agent-logos');

-- 5. RLS policies for agent-screenshots
CREATE POLICY "Public Access agent-screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'agent-screenshots');

CREATE POLICY "Public Upload agent-screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'agent-screenshots');

CREATE POLICY "Public Update agent-screenshots" ON storage.objects
  FOR UPDATE USING (bucket_id = 'agent-screenshots');

CREATE POLICY "Public Delete agent-screenshots" ON storage.objects
  FOR DELETE USING (bucket_id = 'agent-screenshots');
