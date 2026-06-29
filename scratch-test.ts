import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  console.log('Testing saved tools query...');
  
  // Get a user who has saved tools
  const { data: saved } = await supabase.from('saved_tools').select('*').limit(1);
  if (!saved || saved.length === 0) {
    console.log('No saved tools in DB at all.');
    return;
  }
  
  const userId = saved[0].user_id;
  console.log('Found user with saved tool:', userId);
  
  const { data, error } = await supabase
    .from('saved_tools')
    .select('agent_id, folder_id, agents(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log('Query Result:', JSON.stringify(data, null, 2));
}

test();
