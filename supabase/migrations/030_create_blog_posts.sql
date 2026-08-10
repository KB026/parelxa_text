-- ============================================================
-- MIGRATION 030: Blog Posts Table for Automated Weekly Agent
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'Parlexa Team',
  published_date TIMESTAMPTZ,
  read_time_minutes INTEGER,
  faqs JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  meta_title TEXT,
  meta_description TEXT
);

-- Indexes for fast querying by slug and status
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Public/anon read access ONLY for published posts
DROP POLICY IF EXISTS "Public read access for published blog posts" ON public.blog_posts;
CREATE POLICY "Public read access for published blog posts" ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- RLS Policy 2: Authenticated admin access for read/write on drafts and insert/update
DROP POLICY IF EXISTS "Admins full access to blog posts" ON public.blog_posts;
CREATE POLICY "Admins full access to blog posts" ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
