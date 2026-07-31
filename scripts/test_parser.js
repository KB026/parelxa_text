const testStrings = [
  '**[Gnani.ai](/products/gnani-ai)**: A patent-backed conversational AI platform',
  '- **[BharatGPT](/products/bharatgpt)**: Co-created to address the unique',
  'By combining domain-adapted models like **[Gnani.ai](/products/gnani-ai)** and **[BharatGPT](/products/bharatgpt)**',
  'Explore the full selection in the **[Parlexa AI Directory](/directory)**.',
  '**[Start comparing tools on Parlexa →](/compare)**',
  'Regular **bold text** and standard [link text](/directory) and **[bold link](/compare)** mix'
];

function parseFormattedText(text) {
  if (!text) return [];

  // Match bold-link: **[text](url)** OR link-bold: [**text**](url) OR link: [text](url) OR bold: **text**
  // We can tokenise by matching these patterns in order of precedence:
  const tokenRegex = /(\*\*\s*\[.*?\]\(.*?\)\s*\*\*|\[\s*\*\*.*?\*\*\s*\]\(.*?\)|\[.*?\]\(.*?\)|\*\*.*?\*\*)/g;
  const parts = text.split(tokenRegex);

  const nodes = [];
  parts.forEach((part, index) => {
    if (!part) return;

    // 1. Match **[text](url)**
    const boldLinkMatch = part.match(/^\*\*\s*\[(.*?)\]\((.*?)\)\s*\*\*$/);
    if (boldLinkMatch) {
      const [, linkText, linkUrl] = boldLinkMatch;
      nodes.push({ type: 'BOLD_LINK', text: linkText, url: linkUrl });
      return;
    }

    // 2. Match [**text**](url)
    const linkBoldMatch = part.match(/^\[\s*\*\*(.*?)\*\*\s*\]\((.*?)\)$/);
    if (linkBoldMatch) {
      const [, linkText, linkUrl] = linkBoldMatch;
      nodes.push({ type: 'BOLD_LINK', text: linkText, url: linkUrl });
      return;
    }

    // 3. Match standard link [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, linkText, linkUrl] = linkMatch;
      nodes.push({ type: 'LINK', text: linkText, url: linkUrl });
      return;
    }

    // 4. Match bold text **text**
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      const [, boldText] = boldMatch;
      nodes.push({ type: 'BOLD', text: boldText });
      return;
    }

    // Plain text
    nodes.push({ type: 'TEXT', text: part });
  });

  return nodes;
}

console.log('=== NEW PARSER OUTPUT ===');
testStrings.forEach(s => {
  console.log('INPUT:', s);
  console.log('OUTPUT:', JSON.stringify(parseFormattedText(s), null, 2));
});
