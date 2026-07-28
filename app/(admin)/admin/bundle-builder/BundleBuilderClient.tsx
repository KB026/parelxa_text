'use client';

import React, { useState } from 'react';
import { BundleFull, BundleRoleFull } from '@/lib/bundles-service';
import { Layers, CheckCircle2, AlertTriangle, Save, Search, ArrowRight, ShieldCheck } from 'lucide-react';

interface CandidateAgent {
  id: number;
  name: string;
  slug: string | null;
  logo_url: string | null;
  category: string | null;
  pricing: string | null;
  one_liner: string | null;
}

interface BundleBuilderClientProps {
  initialBundles: BundleFull[];
  candidateAgents: CandidateAgent[];
}

export const BundleBuilderClient: React.FC<BundleBuilderClientProps> = ({
  initialBundles,
  candidateAgents
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialBundles[0]?.slug || '');
  const [bundles, setBundles] = useState<BundleFull[]>(initialBundles);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const currentBundle = bundles.find(b => b.slug === selectedSlug) || bundles[0];

  const handleAssignTool = (roleOrder: number, agentId: number) => {
    const selectedAgent = candidateAgents.find(a => Number(a.id) === Number(agentId));
    if (!selectedAgent || !currentBundle) return;

    const updatedRoles: BundleRoleFull[] = currentBundle.roles.map(r => {
      if (r.role_order === roleOrder) {
        return {
          ...r,
          tool: {
            id: `tool-${currentBundle.id}-${selectedAgent.id}`,
            agent_id: selectedAgent.id,
            role_id: r.id,
            role_name: r.role_name,
            role_description: r.role_description,
            role_order: r.role_order,
            position: r.role_order,
            role_in_workflow: r.role_name,
            reason: `Assigned to ${r.role_name} step.`,
            what_it_does: selectedAgent.one_liner || `Handles ${r.role_name} step execution.`,
            why_in_step: `Ensures step ${r.role_order} (${r.role_name}) is executed seamlessly.`,
            name: selectedAgent.name,
            slug: selectedAgent.slug || `tool-${selectedAgent.id}`,
            logo_url: selectedAgent.logo_url,
            rating: 4.8,
            reviews_count: 15,
            pricing: selectedAgent.pricing || 'Custom / Contact',
            pricing_model: 'paid',
            website: null,
            one_liner: selectedAgent.one_liner,
            category: selectedAgent.category || currentBundle.category,
            is_primary: true
          }
        };
      }
      return r;
    });

    const updatedToolsFull = updatedRoles
      .map(r => r.tool)
      .filter((t): t is NonNullable<typeof t> => Boolean(t));

    const updatedBundles = bundles.map(b => {
      if (b.slug === selectedSlug) {
        return {
          ...b,
          roles: updatedRoles,
          tools_full: updatedToolsFull,
          tool_count: updatedToolsFull.length,
          tool_logos: updatedToolsFull.map(t => t.logo_url).filter((l): l is string => Boolean(l))
        };
      }
      return b;
    });

    setBundles(updatedBundles);
  };

  const handleSave = async () => {
    if (!currentBundle) return;
    setSaving(true);
    setMessage(null);

    const roleAssignments = currentBundle.roles.map(r => ({
      role_id: r.id,
      role_name: r.role_name,
      agent_id: r.tool ? r.tool.agent_id : null
    }));

    try {
      const res = await fetch('/api/admin/bundle-builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundle_slug: currentBundle.slug,
          role_assignments: roleAssignments
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`✅ Saved ${currentBundle.name} setup successfully!`);
      } else {
        setMessage(`❌ Save failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setMessage(`❌ Network error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Bundle Selector & Header Controls */}
      <div className="p-6 rounded-2xl bg-[#121215] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider block">
            Select Bundle to Configure:
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="bg-[#18181C] text-white text-base font-bold px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#0EA5E9] outline-none cursor-pointer min-w-[280px]"
          >
            {bundles.map(b => (
              <option key={b.slug} value={b.slug}>
                {b.name} ({b.type.toUpperCase()} • {b.tool_count} Tools)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-slate-950 font-extrabold text-sm transition-all duration-200 shadow-lg shadow-[#0EA5E9]/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Bundle Setup'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-[#18181C] border border-[#0EA5E9]/30 text-sm font-semibold text-[#38BDF8]">
          {message}
        </div>
      )}

      {/* Selected Bundle Info Summary */}
      {currentBundle && (
        <div className="p-6 rounded-2xl bg-[#121215] border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#0EA5E9]/10 text-[#38BDF8] border border-[#0EA5E9]/30 uppercase">
              {currentBundle.type} Kit
            </span>
            <span className="text-xs text-gray-400 font-semibold">{currentBundle.category}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{currentBundle.headline}</h2>
          <p className="text-sm text-gray-300 italic">"{currentBundle.tagline}"</p>
        </div>
      )}

      {/* Journey Roles Sequence & Tool Assignment List */}
      {currentBundle && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#38BDF8]" />
              Journey Role Steps & Tool Assignments ({currentBundle.roles.length} Steps)
            </h3>
            <span className="text-xs text-gray-400 font-semibold">1 Tool per Role (No Duplicates)</span>
          </div>

          <div className="space-y-4">
            {currentBundle.roles.map((r) => {
              const tool = r.tool;

              return (
                <div
                  key={r.role_order}
                  className="p-5 rounded-2xl bg-[#121215] border border-white/10 hover:border-[#0EA5E9]/40 transition-all space-y-4"
                >
                  {/* Step Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {r.role_order}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <span>{r.role_name}</span>
                          <span className="text-xs text-[#38BDF8] font-normal font-sans">
                            ({r.role_description})
                          </span>
                        </h4>
                      </div>
                    </div>

                    {/* Tool Assignment Dropdown */}
                    <div className="flex items-center gap-2 min-w-[260px]">
                      <select
                        value={tool ? tool.agent_id : ''}
                        onChange={(e) => handleAssignTool(r.role_order, Number(e.target.value))}
                        className="w-full bg-[#18181C] text-xs font-bold text-white px-3 py-2 rounded-xl border border-white/10 focus:border-[#0EA5E9] outline-none"
                      >
                        <option value="">-- Select Tool for Step {r.role_order} --</option>
                        {candidateAgents.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.category || 'General'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Assigned Tool Card Preview or Warning Gap */}
                  {tool ? (
                    <div className="p-4 rounded-xl bg-[#18181C] border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#09090B] p-1 border border-white/10 flex items-center justify-center shrink-0">
                          {tool.logo_url ? (
                            <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <span className="font-bold text-[#38BDF8] text-sm">{tool.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">{tool.name}</h5>
                          <span className="text-xs text-gray-400 truncate block">{tool.what_it_does}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#38BDF8] font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Assigned to Step {r.role_order}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>⚠️ Catalog Gap: No tool currently assigned to the {r.role_name} step.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
