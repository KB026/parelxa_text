import { MetadataRoute } from 'next';
import { getAgents, getCategories } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://parlexa.in';

  // Fetch all agents and categories
  const [agents, categories] = await Promise.all([
    getAgents(),
    getCategories()
  ]);

  // Static routes
  const staticRoutes = [
    '',
    '/products',
    '/directory',
    '/blog',
    '/login',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Agent routes
  const agentRoutes = agents.map(agent => ({
    url: `${baseUrl}/products/${agent.slug || agent.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Category routes
  const categoryRoutes = categories.map(cat => ({
    url: `${baseUrl}/products?cats=${encodeURIComponent(cat.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...agentRoutes, ...categoryRoutes];
}
