const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

console.log('=== APP DIRS ICON FILES ===');
['app/favicon.ico', 'app/icon.png', 'app/icon.ico', 'app/apple-icon.png'].forEach(f => {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    console.log(f, 'exists! Size:', stat.size, 'bytes');
  } else {
    console.log(f, 'does NOT exist');
  }
});

console.log('=== PUBLIC DIRS ICON FILES ===');
['public/favicon.ico', 'public/favicon-16x16.png', 'public/favicon-32x32.png', 'public/apple-touch-icon.png', 'public/site.webmanifest', 'public/icon.png'].forEach(f => {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    console.log(f, 'exists! Size:', stat.size, 'bytes');
  } else {
    console.log(f, 'does NOT exist');
  }
});
