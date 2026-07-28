import { execSync } from 'child_process';
import fs from 'fs';

const pages = [
  { name: 'homepage', url: 'http://127.0.0.1:3005/' },
  { name: 'category', url: 'http://127.0.0.1:3005/directory' },
  { name: 'product', url: 'http://127.0.0.1:3005/products' }
];

console.log('--- RUNNING LIGHTHOUSE AUDITS ---');

const results = {};

for (const p of pages) {
  const outFile = `./scratch/lh_${p.name}.json`;
  try {
    console.log(`Auditing ${p.name} (${p.url})...`);
    execSync(`npx -y lighthouse ${p.url} --output=json --output-path=${outFile} --chrome-flags="--headless --no-sandbox --disable-gpu --ignore-certificate-errors --allow-insecure-localhost" --only-categories=performance`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Note: Lighthouse CLI finished with output check...`);
  }

  if (fs.existsSync(outFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      const perfScore = Math.round((data.categories?.performance?.score || 0) * 100);
      const lcp = data.audits?.['largest-contentful-paint']?.displayValue || 'N/A';
      const cls = data.audits?.['cumulative-layout-shift']?.displayValue || 'N/A';
      const fcp = data.audits?.['first-contentful-paint']?.displayValue || 'N/A';
      results[p.name] = { score: perfScore, lcp, cls, fcp };
      console.log(`✅ ${p.name.toUpperCase()} => Score: ${perfScore}, LCP: ${lcp}, CLS: ${cls}, FCP: ${fcp}`);
    } catch (e) {
      console.error(`Failed to parse ${outFile}:`, e.message);
    }
  } else {
    console.error(`Output file ${outFile} missing`);
  }
}

console.log('\n--- AUDIT SUMMARY RESULT ---');
console.log(JSON.stringify(results, null, 2));
