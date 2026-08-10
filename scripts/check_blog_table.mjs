import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkTable() {
  const { data, error } = await supabase.from('blog_posts').select('*').limit(1);
  console.log('Select from blog_posts error:', error);
  console.log('Select from blog_posts data:', data);
}

checkTable();
