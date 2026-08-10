import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(url, anonKey);
const serviceClient = createClient(url, serviceKey);

async function verify() {
  console.log('--- 1. Testing Anon Client (Public RLS) ---');
  const { data: anonPosts, error: anonErr } = await anonClient.from('blog_posts').select('slug, status');
  if (anonErr) console.error('Anon query error:', anonErr.message);
  console.log(`Anon client visible rows: ${anonPosts?.length || 0}`);
  console.log('Statuses visible to Anon:', anonPosts?.map(p => p.status));

  console.log('\n--- 2. Testing Service Role Client (Admin Bypassing RLS) ---');
  const { data: servicePosts, error: serviceErr } = await serviceClient.from('blog_posts').select('slug, status');
  if (serviceErr) console.error('Service query error:', serviceErr.message);
  console.log(`Service role visible rows: ${servicePosts?.length || 0}`);
  console.log('Statuses visible to Service Role:', servicePosts?.map(p => `${p.slug} (${p.status})`));
}

verify();
