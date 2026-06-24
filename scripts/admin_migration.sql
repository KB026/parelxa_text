-- ============================================
-- Parlexa Admin Panel Migration
-- ============================================

-- 1. Extend Profiles Table for Admin Controls
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin_flag BOOLEAN DEFAULT false; -- Extra security layer if needed

-- 2. Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Seed Default Settings
INSERT INTO public.site_settings (key, value, description)
VALUES 
    ('announcement_banner', '{"enabled": false, "text": "Welcome to Parlexa V2!", "link": ""}', 'Marketplace announcement banner config'),
    ('featured_pricing', '{"weekly": 2500, "monthly": 8000}', 'Pricing for featured listings in INR')
ON CONFLICT (key) DO NOTHING;

-- 4. Create Platform Reports/Audit Table (Optional but requested for activity feed)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    changes JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Policies (Admins only for these)
CREATE POLICY "Admins can manage settings" ON public.site_settings
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
