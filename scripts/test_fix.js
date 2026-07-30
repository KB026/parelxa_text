const fs = require('fs');
const path = require('path');
const http = require('http');

const root = path.join(__dirname, '..');
const appFavicon = path.join(root, 'app/favicon.ico');
const appIconPng = path.join(root, 'app/icon.png');
const appAppleIconPng = path.join(root, 'app/apple-icon.png');

console.log('--- Removing app/ directory icon files ---');
if (fs.existsSync(appFavicon)) fs.unlinkSync(appFavicon);
if (fs.existsSync(appIconPng)) fs.unlinkSync(appIconPng);
if (fs.existsSync(appAppleIconPng)) fs.unlinkSync(appAppleIconPng);

console.log('Removed app/ icon files. Testing GET /favicon.ico ...');

setTimeout(() => {
  http.get('http://localhost:3000/favicon.ico', (res) => {
    console.log('Status code for GET /favicon.ico after removing app/ icon files:', res.statusCode);
    console.log('Headers:', res.headers);
  }).on('error', (err) => {
    console.error('Error fetching /favicon.ico:', err.message);
  });
}, 1000);
