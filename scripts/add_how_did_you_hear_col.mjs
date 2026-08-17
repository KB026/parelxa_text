import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Testing/Adding how_did_you_hear column to agents table...');
  // We test selecting or updating a row to check if the column exists
  const { data, error } = await supabase.from('agents').select('id, how_did_you_hear').limit(1);
  if (error && error.message.includes('how_did_you_hear')) {
    console.log('Column does not exist yet in schema cache. Please run migration 032 SQL in Supabase SQL Editor:');
    console.log('ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS how_did_you_hear text;');
  } else if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Column how_did_you_hear exists and is ready!');
  }
}

run();
