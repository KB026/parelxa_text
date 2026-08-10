import React from 'react';

interface BlogMarkdownRendererProps {
  content: string;
}

export function parseFormattedText(text: string): React.ReactNode {
  // Regex to match markdown links [text](url) and bold **text**
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Check for Markdown Link [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, linkText, linkUrl] = linkMatch;
      const isInternal = linkUrl.startsWith('/');
      return (
        <a
          key={index}
          href={linkUrl}
          target={isInternal ? '_self' : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          className="text-[#A78BFA] hover:text-[#C4B5FD] underline underline-offset-4 decoration-[#8B5CF6]/50 hover:decoration-[#A78BFA] transition-colors font-medium"
        >
          {linkText}
        </a>
      );
    }

    // Check for Bold **text**
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={index} className="font-semibold text-white">
          {boldMatch[1]}
        </strong>
      );
    }

    return part;
  });
}

export function BlogMarkdownRenderer({ content }: BlogMarkdownRendererProps) {
  if (!content) return null;

  // Split text by double newlines into blocks
  const sections = content.split(/\n\s*\n/);

  return (
    <div className="space-y-6 text-[#D4D4D8] leading-relaxed font-sans text-base">
      {sections.map((section, idx) => {
        const trimmed = section.trim();
        if (!trimmed) return null;

        // Check for H2
        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^##\s+/, '');
          return (
            <h2
              key={idx}
              className="text-2xl md:text-3xl font-bold text-white mt-10 mb-4 tracking-tight border-b border-white/10 pb-3 font-serif"
            >
              {parseFormattedText(headingText)}
            </h2>
          );
        }

        // Check for H3
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          return (
            <h3
              key={idx}
              className="text-xl md:text-2xl font-bold text-white/90 mt-8 mb-3 font-serif"
            >
              {parseFormattedText(headingText)}
            </h3>
          );
        }

        // Check for Horizontal Divider
        if (trimmed === '---') {
          return <hr key={idx} className="my-8 border-t border-white/10" />;
        }

        // Check for Markdown Table
        if (trimmed.startsWith('|')) {
          const lines = trimmed.split('\n').filter(line => line.trim().startsWith('|'));
          if (lines.length >= 2) {
            const headerRow = lines[0].split('|').slice(1, -1).map(cell => cell.trim());
            const bodyRows = lines.slice(2).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));

            return (
              <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-[#141414] shadow-lg">
                <table className="w-full text-left text-sm text-[#D4D4D8]">
                  <thead className="bg-[#1C1C22] text-xs uppercase tracking-wider text-white font-mono border-b border-white/10">
                    <tr>
                      {headerRow.map((col, cIdx) => (
                        <th key={cIdx} className="px-4 py-3 font-semibold text-[#A78BFA]">
                          {parseFormattedText(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-[14px]">
                            {parseFormattedText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Check for Unordered Bullet List
        if (trimmed.startsWith('- ') || trimmed.includes('\n- ')) {
          const items = trimmed.split('\n- ').map(item => item.replace(/^- /, ''));
          return (
            <ul key={idx} className="my-4 space-y-2 pl-2">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3 text-[#D4D4D8]">
                  <span className="text-[#8B5CF6] font-bold mt-1">•</span>
                  <span>{parseFormattedText(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-[#D4D4D8] leading-relaxed">
            {parseFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
