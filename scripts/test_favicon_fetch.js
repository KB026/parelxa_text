const http = require('http');

http.get('http://localhost:3000/favicon.ico', (res) => {
  console.log('GET /favicon.ico status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Headers:', res.headers);
    console.log('Body:', data.slice(0, 500));
  });
}).on('error', (err) => {
  console.error('Error fetching /favicon.ico:', err.message);
});
