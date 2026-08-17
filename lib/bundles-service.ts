import { createClient } from '@supabase/supabase-js';
import { SEED_JOURNEY_BUNDLES, JourneyBundleDefinition } from './bundles-data';

export interface BundleToolFull {
  id: string | number;
  agent_id: number;
  role_id?: number;
  role_name: string;
  role_description?: string;
  role_order: number;
  position: number;
  role_in_workflow: string;
  reason: string;
  what_it_does: string;
  why_in_step: string;
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
  is_primary?: boolean;
}

export interface BundleRoleFull {
  id: number;
  role_name: string;
  role_description: string;
  role_order: number;
  tool: BundleToolFull | null;
}

export interface BundleFull {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  type: 'journey' | 'department';
  headline: string;
  benefits: string[];
  use_case: string;
  who_needs_it: string[];
  bundle_icon_url?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  tool_count: number;
  rating: number;
  review_count: number;
  tool_logos: string[];
  roles: BundleRoleFull[];
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
    type: 'journey' | 'department';
  };
  currentToolRole: string;
  otherTools: BundleToolFull[];
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
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
    // ignore
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
      .select('*, bundle_roles(*, bundle_tools(*, agents(*)))')
      .order('display_order', { ascending: true });

    if (!bErr && dbBundles && dbBundles.length > 0) {
      return dbBundles.map((b: any) => {
        const seedDef = SEED_JOURNEY_BUNDLES.find(sb => sb.slug === b.slug) || SEED_JOURNEY_BUNDLES[0];
        const rawRoles = (b.bundle_roles || []).sort((x: any, y: any) => x.role_order - y.role_order);

        const roles: BundleRoleFull[] = [];
        const toolsFull: BundleToolFull[] = [];

        rawRoles.forEach((r: any, idx: number) => {
          const seedRole = seedDef.roles.find(sr => sr.role_order === r.role_order) || seedDef.roles[idx] || seedDef.roles[0];
          const primaryToolLink = (r.bundle_tools || []).find((bt: any) => bt.is_primary !== false) || (r.bundle_tools || [])[0];
          let toolObj: BundleToolFull | null = null;

          if (primaryToolLink) {
            const a = primaryToolLink.agents || {};
            toolObj = {
              id: primaryToolLink.id,
              agent_id: primaryToolLink.agent_id,
              role_id: r.id,
              role_name: r.role_name,
              role_description: r.role_description || seedRole.role_description,
              role_order: r.role_order,
              position: r.role_order,
              role_in_workflow: r.role_name,
              reason: seedRole.why_in_step || r.role_description || `Provides ${r.role_name} in the ${b.name} journey.`,
              what_it_does: seedRole.what_it_does || a.one_liner || 'Handles workflow execution for this journey step.',
              why_in_step: seedRole.why_in_step || `Ensures step ${r.role_order} (${r.role_name}) is executed seamlessly.`,
              name: a.name || 'Tool',
              slug: a.slug || 'tool',
              logo_url: a.logo_url || null,
              rating: Number(a.rating) || 4.7,
              reviews_count: Number(a.reviews_count || a.reviews) || 15,
              pricing: a.pricing || 'Custom / Contact',
              pricing_model: a.pricing_model || 'paid',
              website: a.website || null,
              one_liner: a.one_liner || null,
              category: a.category || b.category,
              is_primary: primaryToolLink.is_primary !== false
            };
            toolsFull.push(toolObj);
          }

          roles.push({
            id: r.id,
            role_name: r.role_name,
            role_description: r.role_description || seedRole.role_description,
            role_order: r.role_order,
            tool: toolObj
          });
        });

        const ratings = toolsFull.map(t => t.rating).filter(Boolean);
        const avgRating = ratings.length > 0 ? Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)) : 4.7;
        const totalReviews = toolsFull.reduce((s, t) => s + t.reviews_count, 0);

        return {
          id: b.id,
          slug: b.slug,
          name: b.name,
          tagline: seedDef.tagline,
          description: b.description || seedDef.description,
          category: seedDef.category,
          type: b.type || seedDef.type,
          headline: seedDef.headline,
          benefits: seedDef.benefits,
          use_case: seedDef.use_case,
          who_needs_it: seedDef.who_needs_it,
          bundle_icon_url: b.bundle_icon_url,
          is_featured: Boolean(seedDef.is_featured),
          is_active: true,
          display_order: b.display_order || 1,
          tool_count: toolsFull.length,
          rating: avgRating,
          review_count: totalReviews,
          tool_logos: toolsFull.map(t => t.logo_url).filter((l): l is string => Boolean(l)),
          roles,
          tools_full: toolsFull
        };
      });
    }
  } catch (err) {
    console.warn('DB query journey bundles failed, falling back to static definitions with DB agent enrichment:', err);
  }

  // Fallback: Fetch real active agents from agents table to enrich seed definitions
  const allAgentIds = Array.from(new Set(SEED_JOURNEY_BUNDLES.flatMap(b => b.roles.map(r => r.agent_id))));
  const { data: agentsData } = await supabase
    .from('agents')
    .select('id, name, slug, logo_url, rating, reviews_count, reviews, pricing, pricing_model, website, one_liner, category')
    .in('id', allAgentIds);

  const agentsMap = new Map<number, any>();
  if (agentsData) {
    agentsData.forEach((a: any) => agentsMap.set(a.id, a));
  }

  return SEED_JOURNEY_BUNDLES.map(b => {
    const roles: BundleRoleFull[] = [];
    const toolsFull: BundleToolFull[] = [];

    b.roles.forEach((r, idx) => {
      const a = agentsMap.get(r.agent_id) || {};
      const toolObj: BundleToolFull = {
        id: `tool-${b.id}-${r.agent_id}`,
        agent_id: r.agent_id,
        role_id: idx + 1,
        role_name: r.role_name,
        role_description: r.role_description,
        role_order: r.role_order,
        position: r.role_order,
        role_in_workflow: r.role_name,
        reason: r.why_in_step,
        what_it_does: r.what_it_does,
        why_in_step: r.why_in_step,
        name: a.name || `Tool ${r.agent_id}`,
        slug: a.slug || `tool-${r.agent_id}`,
        logo_url: a.logo_url || null,
        rating: Number(a.rating) || 4.7,
        reviews_count: Number(a.reviews_count || a.reviews) || 18,
        pricing: a.pricing || 'Custom / Contact',
        pricing_model: a.pricing_model || 'paid',
        website: a.website || null,
        one_liner: a.one_liner || null,
        category: a.category || b.category,
        is_primary: true
      };

      toolsFull.push(toolObj);
      roles.push({
        id: idx + 1,
        role_name: r.role_name,
        role_description: r.role_description,
        role_order: r.role_order,
        tool: toolObj
      });
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
      roles,
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
          type: b.type
        },
        currentToolRole: matchedTool.role_name,
        otherTools
      };
    }
  }
  return null;
}
