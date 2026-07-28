/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { getBundlesList } from '@/lib/bundles-service';
import { createClient } from '@/lib/supabase/server';
import { BundleBuilderClient } from './BundleBuilderClient';
import { Layers } from 'lucide-react';

export const metadata = {
  title: 'Bundle Builder | Parlexa Admin',
  description: 'Manage journey-based bundle roles and tool assignments'
};

export default async function BundleBuilderAdminPage() {
  const supabase = createClient();

  // Fetch approved agents for tool assignment dropdowns
  const { data: agentsData } = await supabase
    .from('agents')
    .select('id, name, slug, logo_url, category, pricing, one_liner')
    .eq('approval_status', 'approved')
    .order('name', { ascending: true });

  const bundles = await getBundlesList();
  const candidateAgents = agentsData || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#38BDF8] text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            Admin Bundle Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Journey Bundle Builder
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure journey roles and assign 1 primary tool per step across the 7 Kits.
          </p>
        </div>
      </div>

      {/* Interactive Builder Client */}
      <BundleBuilderClient
        initialBundles={bundles}
        candidateAgents={candidateAgents}
      />
    </div>
  );
}
