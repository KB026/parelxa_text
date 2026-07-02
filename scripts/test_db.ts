import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data, error } = await supabase.from('agents').select('*');
  if (error) {
    console.error("DB Error:", error.message);
  } else {
    console.log("DB Rows:", data.length);
  }
}

check();
