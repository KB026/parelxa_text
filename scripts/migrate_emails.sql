-- Add notification preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{
  "weekly_digest": true,
  "verified_alert": true,
  "monthly_newsletter": true
}';

-- Ensure it exists in existing profiles too
UPDATE profiles SET notification_prefs = '{
  "weekly_digest": true,
  "verified_alert": true,
  "monthly_newsletter": true
}' WHERE notification_prefs IS NULL;
