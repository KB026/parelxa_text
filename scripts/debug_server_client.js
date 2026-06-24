import { createClient } from './lib/supabase/server.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testServerClient() {
  console.log('--- Supabase Server Client Diagnostic ---');
  console.log('Environment Check:');
  console.log('URL Set:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key Set:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    console.log('Initializing client...');
    const supabase = createClient();
    console.log('Client initialized successfully.');
    
    console.log('Testing auth.getUser()...');
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('Auth Error (Expected if no session):', error.message);
    } else {
      console.log('Auth Success. User:', data.user ? data.user.email : 'None');
    }
    
    console.log('Testing DB reachability (fetching categories)...');
    const { data: categories, error: dbError } = await supabase.from('categories').select('count');
    if (dbError) {
      console.error('DB Error:', dbError.message);
    } else {
      console.log('DB Success. Categories count:', categories ? categories.length : 0);
    }
    
    console.log('--- Diagnostic Complete ---');
  } catch (err) {
    console.error('CRITICAL ERROR DURING DIAGNOSTIC:');
    console.error(err);
  }
}

testServerClient();
