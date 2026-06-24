const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT * FROM search_queries ORDER BY created_at DESC LIMIT 5;");
    console.log("LAST 5 QUERIES:", res.rows);
  } catch (err) { console.error(err); }
  finally { await client.end(); }
}
run();
