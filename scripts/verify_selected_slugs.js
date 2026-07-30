const fs = require('fs');
const path = require('path');

const tools = JSON.parse(fs.readFileSync(path.join(__dirname, '../valid_slugs_list.json'), 'utf8'));

const testSlugsPost2 = ['uniphore', 'observe-ai', 'kore-ai', 'yellow-ai', 'leena-ai'];
const testSlugsPost3 = ['bharatgpt', 'gnani-ai', 'sarvam-ai', 'krutrim', 'intello-labs', 'locus', 'jiffy-ai', 'manthan'];

console.log('=== POST 2 SLUGS CHECK ===');
testSlugsPost2.forEach(slug => {
  const match = tools.find(t => t.slug === slug);
  console.log(slug, '=>', match ? `FOUND: ${match.name} (${match.category})` : 'NOT FOUND');
});

console.log('\n=== POST 3 SLUGS CHECK ===');
testSlugsPost3.forEach(slug => {
  const match = tools.find(t => t.slug === slug);
  console.log(slug, '=>', match ? `FOUND: ${match.name} (${match.category})` : 'NOT FOUND');
});
