const fs = require('fs');
const path = require('path');

// Dynamically read blog.ts or test imports
const blogContent = fs.readFileSync(path.join(__dirname, '../lib/blog.ts'), 'utf8');

// Match content blocks
const post2Match = blogContent.match(/slug:\s*'comparing-ai-tools-features-pricing-deployment'[\s\S]*?content:\s*`([\s\S]*?)`/);
const post3Match = blogContent.match(/slug:\s*'why-india-needs-vertical-ai-solutions'[\s\S]*?content:\s*`([\s\S]*?)`/);

function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).length;
}

if (post2Match) {
  console.log('Post 2 Content Word Count:', countWords(post2Match[1]));
} else {
  console.error('Post 2 not matched');
}

if (post3Match) {
  console.log('Post 3 Content Word Count:', countWords(post3Match[1]));
} else {
  console.error('Post 3 not matched');
}
