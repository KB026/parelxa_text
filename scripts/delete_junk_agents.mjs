import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const deleteIds = [201, 203, 204, 205, 206, 207, 208, 209, 210];
  console.log('Deleting junk IDs:', deleteIds);

  const { data, error } = await supabase
    .from('agents')
    .delete()
    .in('id', deleteIds)
    .select('id, name');

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }

  console.log('Deleted rows:', data);

  // Check if any null slugs remain
  const { data: remainingNulls } = await supabase
    .from('agents')
    .select('id, name, slug')
    .is('slug', null);

  console.log('Remaining null slug agents count:', remainingNulls?.length || 0);

  // Write audit log
  const logDir = path.join(process.cwd(), 'scripts', 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const logPath = path.join(logDir, `null_slug_resolution_complete.json`);
  fs.writeFileSync(logPath, JSON.stringify({
    deleted_count: data?.length || 0,
    deleted_records: data,
    remaining_null_slugs: remainingNulls
  }, null, 2));

  console.log('Audit log written to:', logPath);
}

main().catch(console.error);
