import dns from 'dns';
import pg from 'pg';
const { Client } = pg;

const host = 'db.quhctuntkvwvjgxebhst.supabase.co';
const password = 'Parlexa@2026';

dns.resolve4(host, async (err, addresses) => {
  console.log('IPv4 addresses for', host, ':', addresses);
  if (err || !addresses || addresses.length === 0) {
    console.log('No IPv4 found directly. Trying IPv6...');
    dns.resolve6(host, (err6, addresses6) => {
      console.log('IPv6 addresses:', addresses6);
    });
  } else {
    const connStr = `postgresql://postgres:${encodeURIComponent(password)}@${addresses[0]}:5432/postgres`;
    console.log('Connecting via IPv4 IP:', addresses[0]);
    const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log('🎉🎉🎉 CONNECTED VIA IP! 🎉🎉🎉');
      const res = await client.query('SELECT current_database();');
      console.log(res.rows);
      await client.end();
    } catch (e) {
      console.log('Failed:', e.message);
    }
  }
});
