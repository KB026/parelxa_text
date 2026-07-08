-- ============================================================
-- ADMIN PANEL STEP 1: DATABASE MIGRATIONS
-- 6 features: messaging, approval, collections, featured,
--              payouts, invoices
-- ============================================================
-- Run with: supabase migration up
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- MIGRATION 1: vendor_messages (two-way ticket system)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.vendor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'vendor')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_messages_agent ON public.vendor_messages(agent_id);
CREATE INDEX idx_vendor_messages_vendor ON public.vendor_messages(vendor_id);
CREATE INDEX idx_vendor_messages_admin ON public.vendor_messages(admin_id);
CREATE INDEX idx_vendor_messages_unread ON public.vendor_messages(vendor_id, is_read);

ALTER TABLE public.vendor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can read their own messages" ON public.vendor_messages
  FOR SELECT USING (auth.uid() = vendor_id OR auth.uid() = admin_id);

CREATE POLICY "Vendors can insert messages (as vendor)" ON public.vendor_messages
  FOR INSERT WITH CHECK (auth.uid() = vendor_id AND sender_type = 'vendor');

CREATE POLICY "Admins can insert messages (as admin)" ON public.vendor_messages
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    AND sender_type = 'admin'
  );

CREATE POLICY "Admins can update read status" ON public.vendor_messages
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ═══════════════════════════════════════════════════════════
-- MIGRATION 2: Enrich agents approval workflow
-- approval_status already exists in 001_init_schema.sql,
-- so we only add the missing columns.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Index already exists on approval_status from init schema; add only if missing
CREATE INDEX IF NOT EXISTS idx_agents_approval_status ON public.agents(approval_status);


-- ═══════════════════════════════════════════════════════════
-- MIGRATION 3: agent_collections (content curation)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.agent_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_collections_order ON public.agent_collections(display_order);

ALTER TABLE public.agent_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read collections" ON public.agent_collections
  FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage collections" ON public.agent_collections
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ═══════════════════════════════════════════════════════════
-- MIGRATION 4: featured_agents (rank tools within collections)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.featured_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.agent_collections(id) ON DELETE CASCADE,
  feature_type TEXT CHECK (feature_type IN ('trending', 'top_rated', 'new')),
  rank_position INT DEFAULT 0,
  featured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, collection_id)
);

CREATE INDEX idx_featured_agents_collection ON public.featured_agents(collection_id);
CREATE INDEX idx_featured_agents_rank ON public.featured_agents(collection_id, rank_position);

ALTER TABLE public.featured_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read featured agents" ON public.featured_agents
  FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage featured agents" ON public.featured_agents
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ═══════════════════════════════════════════════════════════
-- MIGRATION 5: vendor_payouts (lead-based payout tracking)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.vendor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_leads INT DEFAULT 0,
  payout_amount DECIMAL(10, 2) DEFAULT 0.00,
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processed', 'paid')),
  payout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_payouts_vendor ON public.vendor_payouts(vendor_id);
CREATE INDEX idx_vendor_payouts_status ON public.vendor_payouts(payout_status);

ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can read own payouts" ON public.vendor_payouts
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Only admins can manage payouts" ON public.vendor_payouts
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ═══════════════════════════════════════════════════════════
-- MIGRATION 6: vendor_invoices (billing/invoicing)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.vendor_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_number INT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  invoice_status TEXT DEFAULT 'draft' CHECK (invoice_status IN ('draft', 'sent', 'paid', 'overdue')),
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_invoices_vendor ON public.vendor_invoices(vendor_id);
CREATE INDEX idx_vendor_invoices_status ON public.vendor_invoices(invoice_status);

ALTER TABLE public.vendor_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can read own invoices" ON public.vendor_invoices
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Only admins can manage invoices" ON public.vendor_invoices
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ═══════════════════════════════════════════════════════════
-- AUTO-UPDATE TRIGGERS for updated_at columns
-- (re-uses update_updated_at_column() from 001_init_schema)
-- ═══════════════════════════════════════════════════════════

CREATE TRIGGER set_updated_at_vendor_messages
  BEFORE UPDATE ON public.vendor_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_agent_collections
  BEFORE UPDATE ON public.agent_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_vendor_payouts
  BEFORE UPDATE ON public.vendor_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_vendor_invoices
  BEFORE UPDATE ON public.vendor_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
