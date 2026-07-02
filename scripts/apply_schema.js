const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    await client.query("DROP POLICY IF EXISTS \"Enable all for admins\" ON public.agents;");
    await client.query("CREATE POLICY \"Enable all for admins\" ON public.agents FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('Admin global policy applied and schema reloaded.');
  } catch (err) {
    console.error('Error running seed:', err);
  } finally {
    await client.end();
  }
}

run();
