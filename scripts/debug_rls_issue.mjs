import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(url, anonKey);
const serviceClient = createClient(url, serviceKey);

async function test() {
  console.log('--- 1. Querying with Anon Client (Client-side default) ---');
  const { data: anonDrafts, error: anonErr } = await anonClient
    .from('blog_posts')
    .select('*')
    .eq('status', 'draft');

  console.log('Anon client error:', anonErr ? anonErr.message : 'none');
  console.log('Anon client returned drafts count:', anonDrafts?.length || 0);

  console.log('\n--- 2. Querying with Service Role Client (Server-side admin) ---');
  const { data: serviceDrafts, error: serviceErr } = await serviceClient
    .from('blog_posts')
    .select('*')
    .eq('status', 'draft');

  console.log('Service client error:', serviceErr ? serviceErr.message : 'none');
  console.log('Service client returned drafts count:', serviceDrafts?.length || 0);
}

test();
