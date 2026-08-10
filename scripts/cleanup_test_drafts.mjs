import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  console.log('--- Cleaning up 4 test drafts, keeping latest polished draft ---');
  
  const keepSlug = 'autonomous-multi-dialect-voice-ai-agents-2026-1786101573';

  // Fetch all draft posts
  const { data: drafts, error: fetchErr } = await supabase
    .from('blog_posts')
    .select('id, slug, title')
    .eq('status', 'draft');

  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message);
    return;
  }

  const toDelete = drafts.filter(d => d.slug !== keepSlug);
  console.log(`Found ${toDelete.length} draft(s) to delete:`);
  toDelete.forEach(d => console.log(`   - Deleting ID ${d.id}: "${d.title}" (${d.slug})`));

  for (const d of toDelete) {
    const { error: delErr } = await supabase.from('blog_posts').delete().eq('id', d.id);
    if (delErr) {
      console.error(`Failed to delete ${d.id}:`, delErr.message);
    } else {
      console.log(`✅ Deleted ${d.id}`);
    }
  }

  const { data: remaining } = await supabase.from('blog_posts').select('id, slug, title, status').eq('status', 'draft');
  console.log(`\n🎉 Remaining draft count: ${remaining?.length || 0}`);
  remaining?.forEach(r => console.log(`   - Remaining: "${r.title}" (${r.slug})`));
}

cleanup();
