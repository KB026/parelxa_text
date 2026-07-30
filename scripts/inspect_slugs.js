const fs = require('fs');
const path = require('path');

const tools = JSON.parse(fs.readFileSync(path.join(__dirname, '../valid_slugs_list.json'), 'utf8'));

console.log('Sample tools (first 30):');
console.log(tools.slice(0, 30));

const categories = {};
tools.forEach(t => {
  const cat = t.category || 'Uncategorized';
  categories[cat] = (categories[cat] || 0) + 1;
});
console.log('Categories count:', categories);
