const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT name, category, approval_status FROM agents WHERE category ILIKE '%LLM%';");
    console.log(res.rows);
  } catch (err) { console.error(err); }
  finally { await client.end(); }
}
run();
