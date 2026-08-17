-- ===================================================
-- MIGRATION 031: VENDOR TOOL SUBMISSION WEBHOOK TRIGGER
-- ===================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_vendor_submission()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  request_id BIGINT;
BEGIN
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW)
  );

  -- Perform HTTP POST to Netlify Function via pg_net
  SELECT net.http_post(
    url := 'https://parlexa.in/.netlify/functions/vendor-submission-notify',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_vendor_submission_notify ON public.agents;

CREATE TRIGGER trigger_vendor_submission_notify
  AFTER INSERT ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_vendor_submission();
