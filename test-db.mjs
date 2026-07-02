import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://quhctuntkvwvjgxebhst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aGN0dW50a3Z3dmpneGViaHN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcyMTU1NywiZXhwIjoyMDk4Mjk3NTU3fQ.LjF69eODrwVa47ZqpWHLtiapUacBrZdxfUa63JpApt8'
);

async function test() {
  const { data, error } = await supabase.from('profiles').select('company_name').limit(1);
  console.log('Error:', error?.message || 'None');
  console.log('Data:', data);
}

test();
