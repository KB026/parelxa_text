import { redirect } from 'next/navigation';

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'ai-llms': 'AI & LLMs',
  'ai-and-llms': 'AI & LLMs',
  'ai': 'AI & LLMs',
  'llm': 'AI & LLMs',
  'llms': 'AI & LLMs',
  'customer-experience': 'Customer Experience',
  'customer-support': 'Customer Experience',
  'cx': 'Customer Experience',
  'marketing-sales': 'Marketing & Sales',
  'marketing-and-sales': 'Marketing & Sales',
  'marketing': 'Marketing & Sales',
  'sales': 'Marketing & Sales',
  'enterprise-automation': 'Enterprise & Automation',
  'enterprise-and-automation': 'Enterprise & Automation',
  'enterprise': 'Enterprise & Automation',
  'automation': 'Enterprise & Automation',
  'hr-workforce': 'HR & Workforce',
  'hr-and-workforce': 'HR & Workforce',
  'hr': 'HR & Workforce',
  'workforce': 'HR & Workforce',
  'healthcare': 'Healthcare',
  'health': 'Healthcare',
  'medical': 'Healthcare',
  'fintech': 'FinTech',
  'finance': 'FinTech',
  'banking': 'FinTech',
  'retail-e-commerce': 'Retail & E-Commerce',
  'retail-ecommerce': 'Retail & E-Commerce',
  'retail-and-e-commerce': 'Retail & E-Commerce',
  'retail': 'Retail & E-Commerce',
  'ecommerce': 'Retail & E-Commerce',
  'e-commerce': 'Retail & E-Commerce',
  'developer-tools-infra': 'Developer Tools & Infra',
  'developer-tools-and-infra': 'Developer Tools & Infra',
  'developer-tools': 'Developer Tools & Infra',
  'devtools': 'Developer Tools & Infra',
  'infra': 'Developer Tools & Infra',
  'infrastructure': 'Developer Tools & Infra',
  'logistics-supply-chain': 'Logistics & Supply Chain',
  'logistics-and-supply-chain': 'Logistics & Supply Chain',
  'logistics': 'Logistics & Supply Chain',
  'supply-chain': 'Logistics & Supply Chain',
  'agritech': 'AgriTech',
  'agriculture': 'AgriTech',
  'edtech': 'EdTech',
  'education': 'EdTech',
};

const CANONICAL_CATEGORIES = [
  'AI & LLMs',
  'Customer Experience',
  'Marketing & Sales',
  'Enterprise & Automation',
  'HR & Workforce',
  'Healthcare',
  'FinTech',
  'Retail & E-Commerce',
  'Developer Tools & Infra',
  'Logistics & Supply Chain',
  'AgriTech',
  'EdTech',
];

export default function CategorySlugRedirect({ params }: { params: { slug: string } }) {
  const rawSlug = (params.slug || '').toLowerCase().trim();

  // 1. Direct map match
  if (CATEGORY_SLUG_MAP[rawSlug]) {
    redirect(`/products?cats=${encodeURIComponent(CATEGORY_SLUG_MAP[rawSlug])}`);
  }

  // 2. Normalize slug (e.g. replace hyphens with spaces and 'and' with '&')
  const normalized = decodeURIComponent(rawSlug)
    .replace(/-/g, ' ')
    .replace(/\band\b/gi, '&')
    .trim();

  // 3. Find canonical category match
  const match = CANONICAL_CATEGORIES.find(
    (cat) =>
      cat.toLowerCase() === normalized.toLowerCase() ||
      cat.toLowerCase().replace(/[^a-z0-9]/g, '') === rawSlug.replace(/[^a-z0-9]/g, '')
  );

  if (match) {
    redirect(`/products?cats=${encodeURIComponent(match)}`);
  }

  // 4. Default fallback: redirect to products with query
  redirect(`/products?cats=${encodeURIComponent(normalized || rawSlug)}`);
}
