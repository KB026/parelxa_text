import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SEED_JOURNEY_BUNDLES } from '../lib/bundles-data.ts';

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

async function seed() {
  console.log('🚀 Seeding 7 Journey & Department Bundles...');
  console.log(`Found ${SEED_JOURNEY_BUNDLES.length} bundle definitions.\n`);

  let bundlesCount = 0;
  let rolesCount = 0;
  let toolsCount = 0;

  for (const b of SEED_JOURNEY_BUNDLES) {
    const bundlePayload = {
      slug: b.slug,
      name: b.name,
      description: b.description,
      type: b.type,
      display_order: b.display_order
    };

    // 1. Upsert bundle
    const { data: bRes, error: bErr } = await supabase
      .from('bundles')
      .upsert(bundlePayload, { onConflict: 'slug' })
      .select('id')
      .single();

    if (bErr) {
      console.warn(`⚠️ Error upserting bundle [${b.slug}]:`, bErr.message);
      continue;
    }

    const bundleId = bRes ? bRes.id : b.id;
    bundlesCount++;
    console.log(`✅ Upserted bundle [ID: ${bundleId}]: ${b.name} (${b.type})`);

    // Clean old roles and tools for fresh journey seed
    await supabase.from('bundle_tools').delete().eq('bundle_id', bundleId);
    await supabase.from('bundle_roles').delete().eq('bundle_id', bundleId);

    // 2. Insert roles & tools in sequence
    for (const r of b.roles) {
      const rolePayload = {
        bundle_id: bundleId,
        role_name: r.role_name,
        role_description: r.role_description,
        role_order: r.role_order
      };

      const { data: rRes, error: rErr } = await supabase
        .from('bundle_roles')
        .insert(rolePayload)
        .select('id')
        .single();

      if (rErr) {
        console.error(`   ❌ Error inserting role [${r.role_name}]:`, rErr.message);
        continue;
      }

      const roleId = rRes.id;
      rolesCount++;

      // 3. Insert tool link into bundle_tools
      const toolPayload = {
        bundle_id: bundleId,
        role_id: roleId,
        agent_id: r.agent_id,
        is_primary: true
      };

      const { error: tErr } = await supabase
        .from('bundle_tools')
        .insert(toolPayload);

      if (tErr) {
        console.error(`   ⚠️ Error linking agent ${r.agent_id} to role ${r.role_name}:`, tErr.message);
      } else {
        toolsCount++;
        console.log(`   └─ Step ${r.role_order}: ${r.role_name} → Agent #${r.agent_id}`);
      }
    }
  }

  console.log('\n====================================');
  console.log(`🎉 Journey Bundles Seeding Finished!`);
  console.log(`   Bundles upserted: ${bundlesCount}/${SEED_JOURNEY_BUNDLES.length}`);
  console.log(`   Journey roles created: ${rolesCount}`);
  console.log(`   Tools linked to roles: ${toolsCount}`);
  console.log('====================================\n');
}

seed();
