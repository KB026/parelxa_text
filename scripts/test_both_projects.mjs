import { createClient } from '@supabase/supabase-js';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aGN0dW50a3Z3dmpneGViaHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjE1NTcsImV4cCI6MjA5ODI5NzU1N30.q-oSlGMqYpQY7um_cxXTwQu4Ww7_OvGQsMqg7ShWY8A';

const proj1 = createClient('https://quhctuntkvwvjgxebhst.supabase.co', anonKey);
const proj2 = createClient('https://cxjwtswbhznjmtxccxug.supabase.co', anonKey);

async function test() {
  console.log('Testing quhctuntkvwvjgxebhst...');
  const res1 = await proj1.from('agents').select('count', { count: 'exact' });
  console.log('quhctuntkvwvjgxebhst agents count:', res1);

  console.log('Testing cxjwtswbhznjmtxccxug...');
  const res2 = await proj2.from('agents').select('count', { count: 'exact' });
  console.log('cxjwtswbhznjmtxccxug agents count:', res2);
}

test();
