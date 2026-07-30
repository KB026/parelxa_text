const fs = require('fs');
const path = require('path');

const tools = JSON.parse(fs.readFileSync(path.join(__dirname, '../all_verified_tools.json'), 'utf8'));

const validTools = tools.filter(t => t && t.slug).map(t => ({ slug: t.slug, name: t.name, category: t.category }));

fs.writeFileSync(path.join(__dirname, '../valid_slugs_list.json'), JSON.stringify(validTools, null, 2));

console.log('Total valid slugs:', validTools.length);
