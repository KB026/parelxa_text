import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BlogPostRecord {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  author: string | null;
  published_date: string | null;
  read_time_minutes: number | null;
  faqs: { question: string; answer: string }[] | null;
  status: string;
  source: string | null;
  created_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface FormattedBlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  content: string;
  tags: string[];
  faqs?: {
    question: string;
    answer: string;
  }[];
}

const CATEGORY_MAP: Record<string, string> = {
  'ai-agents-enterprise-guide': 'Enterprise AI',
  'comparing-ai-tools-features-pricing-deployment': 'Procurement & Evaluation',
  'why-india-needs-vertical-ai-solutions': 'Sovereign & Vertical AI',
  'rise-of-ai-agents-2026': 'Market Trends',
  'parlexa-marketplace-vendor-guide': 'Guide',
  'vertical-ai-vs-general-models': 'Architecture'
};

export function formatBlogPost(record: BlogPostRecord, isFirst: boolean = false): FormattedBlogPost {
  const category = CATEGORY_MAP[record.slug] || 'Enterprise AI';

  return {
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt || '',
    category: category,
    author: {
      name: record.author || 'Parlexa Team',
      role: 'Enterprise AI Research & Editorial',
    },
    publishedAt: record.published_date 
      ? record.published_date.split('T')[0]
      : new Date().toISOString().split('T')[0],
    readTime: `${record.read_time_minutes || 5} min read`,
    featured: isFirst,
    content: record.body,
    tags: ['AI Agents', 'Enterprise'],
    faqs: Array.isArray(record.faqs) ? record.faqs : [],
  };
}

export async function getPublishedBlogPosts(): Promise<FormattedBlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_date', { ascending: false });

  if (error || !data) {
    console.error('Error fetching published blog posts from Supabase:', error);
    return [];
  }

  return data.map((record, index) => formatBlogPost(record as BlogPostRecord, index === 0));
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<FormattedBlogPost | undefined> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    console.error(`Error fetching published blog post with slug "${slug}":`, error);
    return undefined;
  }

  return formatBlogPost(data as BlogPostRecord, false);
}
