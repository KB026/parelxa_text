import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAgentColumns() {
  const { data, error } = await supabase.from('agents').select('*').limit(3);
  if (error) {
    console.error('Error fetching agents:', error.message);
    return;
  }
  if (data && data[0]) {
    console.log('Sample agent columns:', Object.keys(data[0]));
    console.log('Sample agent values:', {
      name: data[0].name,
      rating: data[0].rating,
      rating_avg: data[0].rating_avg,
      pricing: data[0].pricing,
      pricing_model: data[0].pricing_model,
      inr_price: data[0].inr_price,
      pricing_tiers: data[0].pricing_tiers
    });
  }
}

checkAgentColumns();
