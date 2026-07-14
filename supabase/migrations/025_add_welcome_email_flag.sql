-- Add welcome_email_sent flag to track if the welcome email was sent
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;
