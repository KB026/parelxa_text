import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function findAdmins() {
  console.log('Fetching admin accounts...\n');
  const { data: admins, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('role', 'admin');

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  if (!admins || admins.length === 0) {
    console.log('❌ No admin accounts found in the profiles table.');
    console.log('To make an account an admin, run this script with an email argument:');
    console.log('  node supabase/manage_admins.mjs make-admin your@email.com');
    return;
  }

  // Fetch emails from auth.users (requires service role key)
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  console.log('✅ Found the following Admin accounts:');
  console.log('--------------------------------------------------');
  let found = false;
  
  for (const admin of admins) {
    const user = users.find(u => u.id === admin.id);
    if (user) {
      console.log(`- Email: ${user.email} (ID: ${admin.id})`);
      found = true;
    }
  }
  
  if (!found) {
    console.log('Found admin profiles but could not match them to auth emails.');
  }
  console.log('--------------------------------------------------');
}

async function makeAdmin(email) {
  console.log(`Looking up user with email: ${email}...`);
  
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching users:', authError);
    return;
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`❌ User with email ${email} not found in Supabase Auth.`);
    return;
  }
  
  console.log(`Found user: ${user.id}. Updating profile role to 'admin'...`);
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id);
    
  if (updateError) {
    console.error('❌ Error updating profile:', updateError);
    return;
  }
  
  console.log(`✅ Success! ${email} is now an admin. You can log in with this account.`);
}

const args = process.argv.slice(2);
if (args[0] === 'make-admin' && args[1]) {
  makeAdmin(args[1]);
} else {
  findAdmins();
}
