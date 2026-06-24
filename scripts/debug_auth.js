const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAuthSignup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
    console.error('ERROR: Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log(`Testing signup for: final_tester_${Date.now()}@gmail.com`);
  
  const { data, error } = await supabase.auth.signUp({
    email: `final_tester_${Date.now()}@gmail.com`,
    password: 'Password123',
    options: {
      data: {
        first_name: 'Tester',
        last_name: 'User',
        role: 'user'
      }
    }
  });

  if (error) {
    console.error('❌ Signup FAILED:', error.message);
    if (error.status === 400) console.log('TIP: Check if "Email Auth" is enabled in Supabase Authentication settings.');
  } else {
    console.log('✅ Signup SUCCESS!');
    console.log('User ID:', data.user.id);
  }
}

testAuthSignup();
