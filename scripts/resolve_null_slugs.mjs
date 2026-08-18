import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function run() {
  console.log('=== STARTING NULL-SLUG RESOLUTION ===\n');

  // Step 1: Check existing slugs
  const { data: allAgents, error: fetchErr } = await supabase
    .from('agents')
    .select('id, slug, name');
  if (fetchErr) throw fetchErr;

  const existingSlugs = new Set(allAgents.filter(a => a.slug).map(a => a.slug));
  console.log(`Found ${existingSlugs.size} existing slugs in database.`);

  // Target 12 Approved Agents
  const updateIds = [176, 177, 178, 179, 180, 190, 192, 193, 194, 195, 196, 197];
  const { data: updateAgents, error: updateFetchErr } = await supabase
    .from('agents')
    .select('id, name, slug, category, approval_status, created_at')
    .in('id', updateIds)
    .order('id', { ascending: true });

  if (updateFetchErr) throw updateFetchErr;

  const updatePlan = [];
  for (const agent of updateAgents) {
    let slug = slugify(agent.name);
    // Special cleanups if any
    if (existingSlugs.has(slug)) {
      slug = `${slug}-${agent.id}`;
    }
    existingSlugs.add(slug); // reserve it for the session
    updatePlan.push({
      id: agent.id,
      name: agent.name,
      old_slug: agent.slug,
      new_slug: slug
    });
  }

  console.log('Generated Slugs for 12 Real Agents:');
  console.table(updatePlan);

  // Apply Updates
  const updateLogs = [];
  for (const item of updatePlan) {
    const { error: updErr } = await supabase
      .from('agents')
      .update({ slug: item.new_slug })
      .eq('id', item.id);

    if (updErr) {
      console.error(`Failed to update ID ${item.id}:`, updErr);
      throw updErr;
    }
    updateLogs.push(item);
    console.log(`✔ Updated ID ${item.id} (${item.name}) -> slug: "${item.new_slug}"`);
  }

  // Step 2: Delete 9 Junk Agents
  const deleteIds = [201, 203, 204, 205, 206, 207, 208, 209, 210];
  const { data: deleteAgents, error: deleteFetchErr } = await supabase
    .from('agents')
    .select('id, name, slug, category, approval_status, created_at')
    .in('id', deleteIds)
    .order('id', { ascending: true });

  if (deleteFetchErr) throw deleteFetchErr;

  console.log(`\nFound ${deleteAgents.length} junk agents to delete:`);
  console.table(deleteAgents);

  // Check and clean any child foreign keys if they exist
  for (const id of deleteIds) {
    await supabase.from('agent_interactions').delete().eq('agent_id', id);
    await supabase.from('saved_tools').delete().eq('agent_id', id);
    await supabase.from('reviews').delete().eq('agent_id', id);
  }

  const { error: delErr } = await supabase
    .from('agents')
    .delete()
    .in('id', deleteIds);

  if (delErr) {
    console.error('Failed to delete junk agents:', delErr);
    throw delErr;
  }

  console.log(`✔ Successfully deleted ${deleteIds.length} junk agent records.`);

  // Write audit log file
  const logDir = path.join(process.cwd(), 'scripts', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFilePath = path.join(logDir, `null_slug_resolution_${timestamp}.json`);
  const logData = {
    timestamp: new Date().toISOString(),
    updated_agents: updateLogs,
    deleted_agents: deleteAgents
  };

  fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
  console.log(`\n✔ Audit log written to: ${logFilePath}`);
  console.log('\n=== NULL-SLUG RESOLUTION COMPLETE ===');
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
