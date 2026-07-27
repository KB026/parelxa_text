import { createClient } from '@supabase/supabase-js';
import { SEED_BUNDLES, BundleDefinition } from './bundles-data';

export interface BundleToolFull {
  id: string | number;
  agent_id: number;
  position: number;
  role_in_workflow: string;
  reason: string;
  name: string;
  slug: string;
  logo_url: string | null;
  rating: number;
  reviews_count: number;
  pricing: string | null;
  pricing_model: string | null;
  website: string | null;
  one_liner: string | null;
  category: string | null;
}

export interface BundleFull extends BundleDefinition {
  tool_count: number;
  rating: number;
  review_count: number;
  tool_logos: string[];
  tools_full: BundleToolFull[];
}

export interface AgentBundleCrossSell {
  bundle: {
    id: number;
    slug: string;
    name: string;
    category: string;
    tagline: string;
    headline: string;
  };
  otherTools: BundleToolFull[];
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://quhctuntkvwvjgxebhst.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function normalizeSlug(str: string): string {
  if (!str) return '';
  try {
    str = decodeURIComponent(str);
  } catch (e) {
    // ignore decode error if malformed
  }
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function getBundlesList(): Promise<BundleFull[]> {
  const supabase = getSupabaseClient();

  try {
    const { data: dbBundles, error: bErr } = await supabase
      .from('bundles')
      .select('*, bundle_tools(*, agents(*))')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!bErr && dbBundles && dbBundles.length > 0) {
      return dbBundles.map((b: any) => {
        const rawTools = (b.bundle_tools || []).sort((x: any, y: any) => x.position - y.position);
        const toolsFull: BundleToolFull[] = rawTools.map((bt: any) => {
          const a = bt.agents || {};
          return {
            id: bt.id,
            agent_id: bt.agent_id,
            position: bt.position,
            role_in_workflow: bt.role_in_workflow,
            reason: bt.reason,
            name: a.name || 'Tool',
            slug: a.slug || 'tool',
            logo_url: a.logo_url || null,
            rating: Number(a.rating) || 4.5,
            reviews_count: Number(a.reviews_count || a.reviews) || 12,
            pricing: a.pricing || 'Custom / Contact',
            pricing_model: a.pricing_model || 'paid',
            website: a.website || null,
            one_liner: a.one_liner || null,
            category: a.category || b.category
          };
        });

        const ratings = toolsFull.map(t => t.rating).filter(Boolean);
        const avgRating = ratings.length > 0 ? Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)) : 4.6;
        const totalReviews = toolsFull.reduce((s, t) => s + t.reviews_count, 0);

        return {
          id: b.id,
          slug: b.slug,
          name: b.name,
          tagline: b.tagline,
          description: b.description,
          category: b.category,
          headline: b.headline,
          benefits: b.benefits || [],
          use_case: b.use_case || '',
          who_needs_it: b.who_needs_it || [],
          bundle_icon_url: b.bundle_icon_url,
          cover_image_url: b.cover_image_url,
          is_featured: Boolean(b.is_featured),
          is_active: Boolean(b.is_active),
          display_order: b.display_order || 1,
          tools: b.bundle_tools || [],
          tool_count: toolsFull.length,
          rating: avgRating,
          review_count: totalReviews,
          tool_logos: toolsFull.map(t => t.logo_url).filter((l): l is string => Boolean(l)),
          tools_full: toolsFull
        };
      });
    }
  } catch (err) {
    console.warn('DB query bundles failed, falling back to static definitions with DB agent enrichment:', err);
  }

  // Fallback: Fetch real active agents from agents table to enrich seed definitions
  const allAgentIds = Array.from(new Set(SEED_BUNDLES.flatMap(b => b.tools.map(t => t.agent_id))));
  const { data: agentsData } = await supabase
    .from('agents')
    .select('id, name, slug, logo_url, rating, reviews_count, reviews, pricing, pricing_model, website, one_liner, category')
    .in('id', allAgentIds);

  const agentsMap = new Map<number, any>();
  if (agentsData) {
    agentsData.forEach((a: any) => agentsMap.set(a.id, a));
  }

  return SEED_BUNDLES.map(b => {
    const toolsFull: BundleToolFull[] = b.tools.map(t => {
      const a = agentsMap.get(t.agent_id) || {};
      return {
        id: `tool-${b.id}-${t.agent_id}`,
        agent_id: t.agent_id,
        position: t.position,
        role_in_workflow: t.role_in_workflow,
        reason: t.reason,
        name: a.name || `Tool ${t.agent_id}`,
        slug: a.slug || `tool-${t.agent_id}`,
        logo_url: a.logo_url || null,
        rating: Number(a.rating) || 4.6,
        reviews_count: Number(a.reviews_count || a.reviews) || 18,
        pricing: a.pricing || 'Custom / Contact',
        pricing_model: a.pricing_model || 'paid',
        website: a.website || null,
        one_liner: a.one_liner || null,
        category: a.category || b.category
      };
    });

    const ratings = toolsFull.map(t => t.rating);
    const avgRating = Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1));
    const totalReviews = toolsFull.reduce((s, t) => s + t.reviews_count, 0);

    return {
      ...b,
      tool_count: toolsFull.length,
      rating: avgRating,
      review_count: totalReviews,
      tool_logos: toolsFull.map(t => t.logo_url).filter((l): l is string => Boolean(l)),
      tools_full: toolsFull
    };
  });
}

export async function getBundleBySlug(slug: string): Promise<BundleFull | null> {
  const bundles = await getBundlesList();
  const target = normalizeSlug(slug);
  return bundles.find(b => normalizeSlug(b.slug) === target || String(b.id) === target) || null;
}

export async function getBundleForAgent(agentId: number): Promise<AgentBundleCrossSell | null> {
  const bundles = await getBundlesList();
  for (const b of bundles) {
    const matchedTool = b.tools_full.find(t => Number(t.agent_id) === Number(agentId));
    if (matchedTool) {
      const otherTools = b.tools_full.filter(t => Number(t.agent_id) !== Number(agentId));
      return {
        bundle: {
          id: b.id,
          slug: b.slug,
          name: b.name,
          category: b.category,
          tagline: b.tagline,
          headline: b.headline,
        },
        otherTools
      };
    }
  }
  return null;
}
