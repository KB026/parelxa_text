-- ============================================
-- PARLEXA SCHEMA MIGRATION: 005_CREATE_RATE_LIMITS
-- ============================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    reset_at TIMESTAMPTZ NOT NULL
);

-- Note: In a production environment, you would want a cron job or pg_cron to periodically clean up expired rows.
