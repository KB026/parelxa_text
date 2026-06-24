const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function restoreSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database. Starting restoration...');

    const sqlQueries = [
      // 1. Missing Tables
      `CREATE TABLE IF NOT EXISTS public.moderation_reports (
        id SERIAL PRIMARY KEY,
        reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('agent', 'review')),
        target_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        details TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );`,

      `CREATE TABLE IF NOT EXISTS public.site_settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now()
      );`,

      `CREATE TABLE IF NOT EXISTS public.listing_claims (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
        work_email TEXT NOT NULL,
        role TEXT NOT NULL,
        note TEXT,
        status TEXT DEFAULT 'pending_email' CHECK (status IN ('pending_email', 'verified_pending_admin', 'approved', 'rejected', 'disputed')),
        verification_token TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );`,

      `CREATE TABLE IF NOT EXISTS public.external_reviews (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
        source TEXT NOT NULL,
        rating DECIMAL(3,2),
        reviews_count INTEGER,
        snippet TEXT,
        source_url TEXT,
        last_fetched_at TIMESTAMPTZ DEFAULT now()
      );`,

      `CREATE TABLE IF NOT EXISTS public.promotions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('featured_home', 'featured_category')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
        plan TEXT NOT NULL CHECK (plan IN ('weekly', 'monthly')),
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'INR',
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        start_date TIMESTAMPTZ DEFAULT now(),
        end_date TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );`,

      `CREATE TABLE IF NOT EXISTS public.transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        agent_id INTEGER REFERENCES public.agents(id) ON DELETE SET NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        gateway TEXT DEFAULT 'razorpay',
        gateway_order_id TEXT,
        gateway_payment_id TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );`,

      // 2. Enable RLS
      `ALTER TABLE public.external_reviews ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;`,

      // 3. RLS Policies
      `DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all promotions') THEN
              CREATE POLICY "Admins can manage all promotions" ON public.promotions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable public read for active promotions') THEN
              CREATE POLICY "Enable public read for active promotions" ON public.promotions FOR SELECT USING (status = 'active');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable public read for external reviews') THEN
              CREATE POLICY "Enable public read for external reviews" ON public.external_reviews FOR SELECT USING (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage claims') THEN
              CREATE POLICY "Admins manage claims" ON public.listing_claims FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
          END IF;
      END $$;`,

      // 4. Functions
      `CREATE OR REPLACE FUNCTION public.increment_impressions(promotion_ids UUID[])
      RETURNS void AS $$
      BEGIN
        UPDATE public.promotions
        SET impressions = impressions + 1
        WHERE id = ANY(promotion_ids);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;`,

      `CREATE OR REPLACE FUNCTION public.increment_clicks(promotion_id UUID)
      RETURNS void AS $$
      BEGIN
        UPDATE public.promotions
        SET clicks = clicks + 1
        WHERE id = promotion_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;`
    ];

    for (let query of sqlQueries) {
      try {
        await client.query(query);
        console.log('Executed query successfully.');
      } catch (e) {
        console.warn('Query failed or table already exists:', e.message);
      }
    }

    console.log('Restoration complete.');

  } catch (err) {
    console.error('Fatal restoration error:', err);
  } finally {
    await client.end();
  }
}

restoreSchema();
