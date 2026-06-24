-- Add India-specific columns for scaling 500 AI tools
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS pricing_in_inr TEXT,
ADD COLUMN IF NOT EXISTS indian_origin_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS integration_type TEXT[];
