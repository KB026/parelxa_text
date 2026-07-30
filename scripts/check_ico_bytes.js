const fs = require('fs');
const path = require('path');

const appFavicon = path.join(__dirname, '../app/favicon.ico');
const publicFavicon = path.join(__dirname, '../public/favicon.ico');

console.log('App favicon exists:', fs.existsSync(appFavicon));
if (fs.existsSync(appFavicon)) {
  const buf = fs.readFileSync(appFavicon);
  console.log('App favicon size:', buf.length);
  console.log('App favicon header bytes (hex):', buf.slice(0, 16).toString('hex'));
}

console.log('Public favicon exists:', fs.existsSync(publicFavicon));
if (fs.existsSync(publicFavicon)) {
  const buf = fs.readFileSync(publicFavicon);
  console.log('Public favicon size:', buf.length);
  console.log('Public favicon header bytes (hex):', buf.slice(0, 16).toString('hex'));
}
