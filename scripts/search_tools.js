const fs = require('fs');
const path = require('path');

const tools = JSON.parse(fs.readFileSync(path.join(__dirname, '../all_verified_tools.json'), 'utf8'));

console.log('Total tools loaded:', tools.length);

function findMatches(keyword) {
  return tools.filter(t => {
    if (!t) return false;
    const nameStr = (t.name || '').toLowerCase();
    const slugStr = (t.slug || '').toLowerCase();
    const catStr = (t.category || '').toLowerCase();
    const kw = keyword.toLowerCase();
    return nameStr.includes(kw) || slugStr.includes(kw) || catStr.includes(kw);
  });
}

const keywords = ['bharat', 'gnani', 'sarvam', 'krutrim', 'kore', 'yellow', 'haptik', 'uniphore', 'observe', 'gong', 'jasper', 'copy', 'intercom', 'zendesk', 'drift', 'hubspot', 'salesforce', 'claude', 'chatgpt', 'notion', 'writer', 'retell', 'vapi', 'syllable', 'bland', 'devrev', 'vernacular', 'reversinglabs'];

const report = {};
keywords.forEach(kw => {
  report[kw] = findMatches(kw).map(t => ({ slug: t.slug, name: t.name, category: t.category }));
});

fs.writeFileSync(path.join(__dirname, '../keyword_tool_matches.json'), JSON.stringify(report, null, 2));

console.log('Written keyword_tool_matches.json');
