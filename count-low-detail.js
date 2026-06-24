const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT count(*) FROM agents WHERE description IS NULL OR LENGTH(description) < 100;");
    console.log(res.rows[0]);
  } catch (err) { console.error(err); }
  finally { await client.end(); }
}
run();
