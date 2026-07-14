const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, role, is_admin, first_name');
  console.log('Current profiles:');
  console.log(profiles);

  // Restore the admin role for kushagraverma951@gmail.com or other admins
  for (const p of (profiles || [])) {
    if (p.is_admin && p.role !== 'admin') {
      console.log(`Fixing admin role for ${p.email}...`);
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', p.id);
    }
  }

  console.log('Fixing welcome_email_sent for old users...');
  // For any profile that has it as false or null, AND created_at < today
  const { data: oldProfiles } = await supabase
    .from('profiles')
    .select('id, created_at, welcome_email_sent');

  let count = 0;
  for (const p of (oldProfiles || [])) {
    if (!p.welcome_email_sent) {
      const created = new Date(p.created_at).getTime();
      const now = new Date().getTime();
      // If it's older than 1 hour, mark it as sent so they don't get the welcome email now
      if (now - created > 3600000) {
        await supabase.from('profiles').update({ welcome_email_sent: true }).eq('id', p.id);
        count++;
      }
    }
  }
  console.log(`Fixed ${count} old profiles.`);
}

fix();
