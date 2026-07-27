import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SEED_BUNDLES } from '../lib/bundles-data.ts';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://quhctuntkvwvjgxebhst.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('🚀 Starting AI Bundles seeding...');
  console.log(`Found ${SEED_BUNDLES.length} bundle definitions.\n`);

  let bundlesInserted = 0;
  let toolsInserted = 0;

  for (const b of SEED_BUNDLES) {
    const bundlePayload = {
      id: b.id,
      slug: b.slug,
      name: b.name,
      tagline: b.tagline,
      description: b.description,
      category: b.category,
      headline: b.headline,
      benefits: b.benefits,
      use_case: b.use_case,
      who_needs_it: b.who_needs_it,
      is_featured: b.is_featured,
      is_active: b.is_active,
      display_order: b.display_order
    };

    // Upsert bundle row
    const { data: bundleRes, error: bundleErr } = await supabase
      .from('bundles')
      .upsert(bundlePayload, { onConflict: 'slug' })
      .select('id')
      .single();

    if (bundleErr) {
      console.warn(`⚠️ DB table warning for [${b.slug}]:`, bundleErr.message);
      continue;
    }

    const bundleId = bundleRes ? bundleRes.id : b.id;
    bundlesInserted++;
    console.log(`✅ Upserted bundle [ID: ${bundleId}]: ${b.name} (${b.slug})`);

    // Upsert tools for this bundle
    for (const tool of b.tools) {
      const toolPayload = {
        bundle_id: bundleId,
        agent_id: tool.agent_id,
        position: tool.position,
        role_in_workflow: tool.role_in_workflow,
        reason: tool.reason
      };

      const { error: toolErr } = await supabase
        .from('bundle_tools')
        .upsert(toolPayload, { onConflict: 'bundle_id,agent_id' });

      if (toolErr) {
        console.warn(`   ⚠️ Error linking agent ${tool.agent_id} to bundle ${bundleId}:`, toolErr.message);
      } else {
        toolsInserted++;
      }
    }
  }

  console.log('\n====================================');
  console.log(`🎉 Seeding pass complete!`);
  console.log(`   Total bundle definitions verified: ${SEED_BUNDLES.length}`);
  console.log(`   DB Bundles upserted: ${bundlesInserted}/${SEED_BUNDLES.length}`);
  console.log(`   DB Bundle tools linked: ${toolsInserted}`);
  console.log('====================================\n');
}

main();
