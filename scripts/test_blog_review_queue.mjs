import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testQueueQuery() {
  console.log('--- Querying Blog Review Queue Drafts ---');
  const { data: drafts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, meta_title, meta_description, read_time_minutes, faqs, status, source, created_at')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Query error:', error.message);
    return;
  }

  console.log(`✅ Found ${drafts.length} pending draft(s) in review queue:`);
  drafts.forEach((d, i) => {
    console.log(`\nDraft #${i + 1}:`);
    console.log(`   ID: ${d.id}`);
    console.log(`   Title: ${d.title}`);
    console.log(`   Slug: ${d.slug}`);
    console.log(`   Source: ${d.source}`);
    console.log(`   Created At: ${d.created_at}`);
    console.log(`   FAQs Count: ${d.faqs?.length || 0}`);
  });
}

testQueueQuery();
