const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'external_reviews';");
    console.log(res.rows);
  } catch (err) { console.error(err); }
  finally { await client.end(); }
}
run();
