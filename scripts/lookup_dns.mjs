import dns from 'dns';

dns.lookup('quhctuntkvwvjgxebhst.supabase.co', { all: true }, (err, addresses) => {
  console.log('Lookup quhctuntkvwvjgxebhst.supabase.co:', err, addresses);
});
