import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentPosts() {
  console.log('--- Querying Blog Posts Table ---');
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, status, source, created_at, published_date')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Query Error:', error);
    return;
  }

  console.log(`Found ${data.length} total blog posts in database:\n`);
  data.forEach((post, i) => {
    console.log(`[#${i + 1}] ID: ${post.id}`);
    console.log(`  Title: "${post.title}"`);
    console.log(`  Slug: ${post.slug}`);
    console.log(`  Status: ${post.status}`);
    console.log(`  Source: ${post.source || 'N/A'}`);
    console.log(`  Created At: ${post.created_at}`);
    console.log(`  Published Date: ${post.published_date}`);
    console.log('--------------------------------------------------');
  });
}

checkRecentPosts().catch(console.error);
