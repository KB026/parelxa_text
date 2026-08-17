-- Migration 032: Add how_did_you_hear column to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS how_did_you_hear text;
