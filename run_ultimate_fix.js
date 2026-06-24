const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fix() {
  const connectionString = process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'first_name', 'User'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Fallback to minimal insert if metadata causes issues
  BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (new.id, 'User', new.email)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore completely
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  await client.query(sql);
  console.log("Ultimate trigger applied.");
  await client.end();
}
fix();
