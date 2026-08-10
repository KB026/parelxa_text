import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedBlogPosts, getPublishedBlogPostBySlug } from '@/lib/blog-service';
import { BlogPostingSchema } from '@/components/seo/BlogPostingSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { ArrowLeft, Clock, Calendar, User, Share2, Tag, BookOpen, HelpCircle } from 'lucide-react';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Post Not Found | Parlexa Blog',
      description: 'The requested blog article could not be found.',
    };
  }

  return {
    title: `${post.title} | Parlexa Blog`,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      url: `https://parlexa.in/blog/${post.slug}`,
      siteName: 'Parlexa',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://parlexa.in/blog/${post.slug}`,
    },
  };
}

// Helper to convert inline markdown links e.g. [Uniphore](/products/uniphore) into interactive Next.js Link components
function renderMarkdownContent(content: string) {
  const sections = content.trim().split('\n\n');

  return sections.map((section, idx) => {
    // Check for H2
    if (section.startsWith('## ')) {
      const headingText = section.replace(/^##\s+/, '');
      return (
        <h2 
          key={idx} 
          className="text-2xl md:text-3xl font-bold font-serif text-[#F4F4F5] mt-10 mb-4 tracking-tight border-b border-white/10 pb-3"
          style={{ fontFamily: '"Playfair Display", "PT Serif", Georgia, serif' }}
        >
          {parseFormattedText(headingText)}
        </h2>
      );
    }

    // Check for H3
    if (section.startsWith('### ')) {
      const headingText = section.replace(/^###\s+/, '');
      return (
        <h3 
          key={idx} 
          className="text-xl md:text-2xl font-bold font-serif text-[#E4E4E7] mt-8 mb-3"
          style={{ fontFamily: '"Playfair Display", "PT Serif", Georgia, serif' }}
        >
          {parseFormattedText(headingText)}
        </h3>
      );
    }

    // Check for horizontal divider
    if (section.trim() === '---') {
      return (
        <hr key={idx} className="my-10 border-t border-white/10" />
      );
    }

    // Check for Markdown Table (lines starting with |)
    if (section.trim().startsWith('|')) {
      const lines = section.trim().split('\n').filter(line => line.trim().startsWith('|'));
      if (lines.length >= 2) {
        const headerRow = lines[0].split('|').slice(1, -1).map(cell => cell.trim());
        // lines[1] is alignment separator e.g. | :--- | :--- |
        const bodyRows = lines.slice(2).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));

        return (
          <div key={idx} className="my-8 overflow-x-auto rounded-xl border border-white/10 bg-[#141414] shadow-xl">
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
                      <td key={cIdx} className="px-4 py-3 text-[15px] leading-relaxed">
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

    // Check for unordered bullet list
    if (section.startsWith('- ') || section.includes('\n- ')) {
      const items = section.split('\n- ').map(item => item.replace(/^- /, ''));
      return (
        <ul key={idx} className="my-5 space-y-3 pl-2">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-3 text-[17px] leading-[1.7] text-[#D4D4D8]">
              <span className="text-[#8B5CF6] font-bold mt-1">•</span>
              <span>{parseFormattedText(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Check for ordered list (1. 2. 3.)
    if (/^\d+\.\s/.test(section)) {
      const items = section.split(/\n(?=\d+\.\s)/);
      return (
        <ol key={idx} className="my-5 space-y-3 pl-2">
          {items.map((item, itemIdx) => {
            const cleanItem = item.replace(/^\d+\.\s+/, '');
            return (
              <li key={itemIdx} className="flex items-start gap-3 text-[17px] leading-[1.7] text-[#D4D4D8]">
                <span className="bg-[#8B5CF6]/20 text-[#A78BFA] font-mono text-xs font-bold px-2 py-0.5 rounded border border-[#8B5CF6]/30 shrink-0 mt-0.5">
                  {itemIdx + 1}
                </span>
                <span>{parseFormattedText(cleanItem)}</span>
              </li>
            );
          })}
        </ol>
      );
    }

    // Standard paragraph
    return (
      <p 
        key={idx} 
        className="text-[17px] md:text-[18px] leading-[1.7] text-[#D4D4D8] mb-6 font-normal tracking-normal text-justify"
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {parseFormattedText(section)}
      </p>
    );
  });
}

// Helper function to parse bold text (**text**), markdown links ([text](url)), bold links (**[text](url)**), and inline code (`code`)
function parseFormattedText(text: string): React.ReactNode[] {
  if (!text) return [];

  const tokenRegex = /(\*\*\s*\[.*?\]\(.*?\)\s*\*\*|\[\s*\*\*.*?\*\*\s*\]\(.*?\)|\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(tokenRegex);

  const nodes: React.ReactNode[] = [];
  parts.forEach((part, index) => {
    if (!part) return;

    // 1. Match **[text](url)**
    const boldLinkMatch = part.match(/^\*\*\s*\[(.*?)\]\((.*?)\)\s*\*\*$/);
    if (boldLinkMatch) {
      const [, linkText, linkUrl] = boldLinkMatch;
      const isInternal = linkUrl.startsWith('/');
      if (isInternal) {
        nodes.push(
          <Link
            key={index}
            href={linkUrl}
            className="text-[#A78BFA] hover:text-[#C4B5FD] font-bold underline underline-offset-4 decoration-[#8B5CF6]/60 hover:decoration-[#8B5CF6] transition-all bg-[#8B5CF6]/15 px-1.5 py-0.5 rounded border border-[#8B5CF6]/30 inline-flex items-center gap-0.5"
          >
            <strong>{linkText}</strong>
          </Link>
        );
        return;
      }
      nodes.push(
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#A78BFA] hover:text-[#C4B5FD] font-bold underline underline-offset-4 transition-colors"
        >
          <strong>{linkText}</strong>
        </a>
      );
      return;
    }

    // 2. Match [**text**](url)
    const linkBoldMatch = part.match(/^\[\s*\*\*(.*?)\*\*\s*\]\((.*?)\)$/);
    if (linkBoldMatch) {
      const [, linkText, linkUrl] = linkBoldMatch;
      const isInternal = linkUrl.startsWith('/');
      if (isInternal) {
        nodes.push(
          <Link
            key={index}
            href={linkUrl}
            className="text-[#A78BFA] hover:text-[#C4B5FD] font-bold underline underline-offset-4 decoration-[#8B5CF6]/60 hover:decoration-[#8B5CF6] transition-all bg-[#8B5CF6]/15 px-1.5 py-0.5 rounded border border-[#8B5CF6]/30 inline-flex items-center gap-0.5"
          >
            <strong>{linkText}</strong>
          </Link>
        );
        return;
      }
      nodes.push(
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#A78BFA] hover:text-[#C4B5FD] font-bold underline underline-offset-4 transition-colors"
        >
          <strong>{linkText}</strong>
        </a>
      );
      return;
    }

    // 3. Match standard link [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, linkText, linkUrl] = linkMatch;
      const isInternal = linkUrl.startsWith('/');
      if (isInternal) {
        nodes.push(
          <Link
            key={index}
            href={linkUrl}
            className="text-[#A78BFA] hover:text-[#C4B5FD] font-semibold underline underline-offset-4 decoration-[#8B5CF6]/40 hover:decoration-[#8B5CF6] transition-all bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded"
          >
            {linkText}
          </Link>
        );
        return;
      }
      nodes.push(
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#A78BFA] hover:text-[#C4B5FD] font-semibold underline underline-offset-4 transition-colors"
        >
          {linkText}
        </a>
      );
      return;
    }

    // 4. Match bold text **text**
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      nodes.push(
        <strong key={index} className="font-semibold text-[#FAFAFA]">
          {boldMatch[1]}
        </strong>
      );
      return;
    }

    // 5. Match italic text *text*
    const italicMatch = part.match(/^\*(.*?)\*$/);
    if (italicMatch) {
      nodes.push(
        <em key={index} className="italic text-[#E4E4E7]">
          {italicMatch[1]}
        </em>
      );
      return;
    }

    // 6. Match inline code `code`
    const codeMatch = part.match(/^`(.*?)`$/);
    if (codeMatch) {
      nodes.push(
        <code key={index} className="bg-white/10 text-[#A78BFA] font-mono text-xs px-1.5 py-0.5 rounded">
          {codeMatch[1]}
        </code>
      );
      return;
    }

    nodes.push(part);
  });

  return nodes;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const postUrl = `https://parlexa.in/blog/${post.slug}`;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] selection:bg-[#8B5CF6]/30 selection:text-white pb-24 overflow-x-hidden">
      <BlogPostingSchema post={post} url={postUrl} />
      {post.faqs && <FaqSchema faqs={post.faqs} />}

      {/* --- Top Navigation --- */}
      <div className="border-b border-white/[0.08] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-[#A1A1AA] hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Blog Index
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-mono bg-[#8B5CF6]/15 text-[#A78BFA] px-2.5 py-1 rounded-full border border-[#8B5CF6]/30 font-semibold">
              {post.category}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 pt-10 md:pt-14">
        
        {/* --- Header & Title --- */}
        <header className="mb-10 pb-8 border-b border-white/10">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FAFAFA] tracking-tight leading-[1.15] mb-6 font-serif"
            style={{ fontFamily: '"Playfair Display", "PT Serif", Georgia, serif' }}
          >
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-lg md:text-xl text-[#A1A1AA] leading-relaxed mb-8 font-light italic border-l-2 border-[#8B5CF6] pl-4">
              {post.subtitle}
            </p>
          )}

          {/* --- Trust Signals: Author Byline, Published Date, Read Time --- */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white font-bold text-sm shadow-md">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                  {post.author.name}
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono uppercase">Verified</span>
                </div>
                <div className="text-xs text-[#A1A1AA]">{post.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-[#A1A1AA] border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </header>

        {/* --- Content Column (Capped at ~700px for optimal readability) --- */}
        <article className="prose prose-invert max-w-none">
          {renderMarkdownContent(post.content)}
        </article>

        {/* --- Post Tags --- */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider flex items-center gap-1 mr-2">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono text-[#A1A1AA] bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-md hover:bg-white/[0.08] transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* --- Article AEO / FAQ Answer Blocks --- */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-14 pt-10 border-t border-white/10">
            <h3 className="text-2xl font-bold font-serif text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#8B5CF6]" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {post.faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-[#141414] border border-white/10 rounded-xl p-5 md:p-6"
                >
                  <h4 className="text-base md:text-lg font-semibold text-white mb-2 leading-snug">
                    {faq.question}
                  </h4>
                  <p className="text-sm md:text-base text-[#A1A1AA] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Footer CTA / Return to Directory --- */}
        <div className="mt-14 bg-gradient-to-r from-[#141414] via-[#1A1A1E] to-[#141414] border border-[#8B5CF6]/30 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-white mb-3">
            Explore Enterprise AI Solutions on Parlexa
          </h3>
          <p className="text-sm text-[#A1A1AA] mb-6 max-w-md mx-auto leading-relaxed">
            Discover, evaluate, and benchmark verified AI agents, speech intelligence tools, and enterprise automation platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/directory"
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-[#8B5CF6]/20 inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Browse Parlexa Directory
            </Link>
            <Link
              href="/blog"
              className="bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-lg border border-white/10 transition-all inline-flex items-center gap-2"
            >
              More Articles
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
