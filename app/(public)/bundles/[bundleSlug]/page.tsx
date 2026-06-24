import React from 'react';
import { Agent } from '@/lib/types';
import { notFound } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getBundleTools(_slug: string): Promise<Agent[]> {
  // In a real scenario, this would query Supabase with specific tags.
  // We'll mock this for now to return an empty array until DB is seeded.
  return [];
}

const BUNDLE_META: Record<string, { title: string; description: string; tags: string[] }> = {
  'd2c-starter-kit': {
    title: 'D2C Starter Kit',
    description: 'Essential Indian AI tools required to scale your Direct-to-Consumer brand.',
    tags: ['E-Commerce', 'Marketing & Sales', 'Customer Experience'],
  },
  'e-commerce-starter-kit': {
    title: 'E-Commerce Starter Kit',
    description: 'Boost your online retail store with these cutting-edge AI technologies.',
    tags: ['Retail & E-Commerce', 'Logistics & Supply Chain'],
  },
  'hiring-automation-bundle': {
    title: 'Hiring Automation Bundle',
    description: 'Transform your recruitment process with AI-driven HR and hiring automation tools.',
    tags: ['HR & Workforce'],
  },
  'ai-kit-logistics': {
    title: 'AI Kit for Logistics',
    description: 'Optimize routes, manage fleets, and predict supply chain issues with AI.',
    tags: ['Logistics & Supply Chain'],
  },
  'learning-edtech-kit': {
    title: 'AI for Learning and EdTech',
    description: 'Revolutionize education with personalized AI learning, testing, and engagement systems.',
    tags: ['EdTech'],
  },
};

export default async function BundlePage({ params }: { params: { bundleSlug: string } }) {
  const meta = BUNDLE_META[params.bundleSlug];
  
  if (!meta) {
    return notFound();
  }

  const tools = await getBundleTools(params.bundleSlug);

  return (
    <div className="container mx-auto px-4 py-16 text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#00ffff] to-[#ff00ff] bg-clip-text text-transparent">
            {meta.title}
          </h1>
          <p className="text-xl text-gray-400">
            {meta.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {meta.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="my-10 h-px bg-white/10" />

        {tools.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-xl font-medium text-white mb-2">No tools in this bundle yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">We are currently gathering the best &quot;Made in India&quot; AI tools for this specific use-case. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => (
              <div key={tool.id} className="p-6 bg-[#0B0F19] border border-white/10 rounded-xl hover:border-white/20 transition-all">
                <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{tool.oneLiner || tool.summary}</p>
                {tool.pricingInInr && (
                  <div className="text-sm font-semibold text-emerald-400">{tool.pricingInInr}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
