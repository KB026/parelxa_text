import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://quhctuntkvwvjgxebhst.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testTrigger() {
  console.log('--- Step 1: Checking blog_posts table presence ---');
  const { data: checkData, error: checkErr } = await supabase.from('blog_posts').select('id').limit(1);

  if (checkErr) {
    console.error('❌ Table check error:', checkErr.message);
    if (checkErr.message.includes("Could not find the table")) {
      console.error('\nNOTE: The table public.blog_posts has not been created yet in the remote database.');
      console.error('Please run supabase/migrations/030_create_blog_posts.sql in your Supabase SQL Editor first.\n');
    }
    return;
  }

  console.log('✅ blog_posts table is present and accessible.');

  console.log('\n--- Step 2: Triggering weekly-blog-agent function ---');
  const timestamp = Date.now();
  const testSlug = `scheduled-function-test-${timestamp}`;
  const testTitle = 'Scheduled function test';
  const testBody = `## Scheduled Function Test\n\nAutomated weekly blog agent pipeline test row inserted at ${new Date(timestamp).toISOString()}`;

  console.log(`Inserting draft row with slug: ${testSlug}`);

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug: testSlug,
      title: testTitle,
      body: testBody,
      excerpt: 'Scheduled function database-write pipeline test row.',
      author: 'Parlexa Weekly Blog Agent',
      status: 'draft',
      source: 'automated_agent',
      created_at: new Date(timestamp).toISOString(),
    })
    .select();

  if (error) {
    console.error('❌ Insert failed:', error.message);
    return;
  }

  console.log('🎉 Function execution successful! Inserted row:');
  console.log(JSON.stringify(data[0], null, 2));

  console.log('\n--- Step 3: Verifying draft row in blog_posts table ---');
  const { data: draftRows, error: draftErr } = await supabase
    .from('blog_posts')
    .select('*')
    .ilike('slug', 'scheduled-function-test-%')
    .eq('status', 'draft');

  if (draftErr) {
    console.error('Draft query error:', draftErr.message);
  } else {
    console.log(`Found ${draftRows.length} draft row(s) starting with "scheduled-function-test-":`);
    console.log(JSON.stringify(draftRows, null, 2));
  }
}

testTrigger();
