const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function makeAdmin(email) {
  if (!email) {
    console.error('Please provide an email address as the first argument.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log(`Connected to database. Setting role=admin for ${email}...`);

    // We can merge the existing jsonb raw_user_meta_data with {"role":"admin"}
    const query = `
      UPDATE auth.users
      SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'
      )
      WHERE email = $1
      RETURNING id, email, raw_user_meta_data;
    `;

    const res = await client.query(query, [email]);
    if (res.rowCount > 0) {
      console.log('Successfully promoted user to admin:', res.rows[0]);
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Error promoting user:', err);
  } finally {
    await client.end();
  }
}

makeAdmin(process.argv[2]);
