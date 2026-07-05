'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Share2, GitCompare, Check, ShieldCheck, Link as LinkIcon, Users } from 'lucide-react';
import { Agent } from '@/lib/types';
import { toggleWishlist } from '@/app/actions/wishlist';
import { useCompare } from '@/context/CompareContext';
import { SaveFolderToast } from './SaveFolderToast';

interface StickyLeadBoxProps {
  agent: Agent;
  initialSaved?: boolean;
  onVisitWebsite?: () => void;
}

export function StickyLeadBox({ agent, initialSaved = false, onVisitWebsite }: StickyLeadBoxProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { selectedIds, toggleCompare } = useCompare();
  const isInCompare = selectedIds.includes(agent.id);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await toggleWishlist(Number(agent.id));
      if (result.error) {
        if (result.error === 'You must be logged in to save tools.') {
          window.dispatchEvent(new CustomEvent('open-auth', { detail: { view: 'signin' } }));
        }
      } else {
        const nextSaved = result.isSaved || false;
        setIsSaved(nextSaved);
        if (nextSaved) setShowToast(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: agent.name,
          text: agent.oneLiner || agent.summary,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 shadow-sm">
      {/* Header / Pricing */}
      <div className="mb-6 pb-6 border-b border-white/[0.06]">
        <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Access & Pricing</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {agent.pricing.toLowerCase().includes('free') ? 'Free Tier Available' : agent.pricing}
          </span>
        </div>
        {agent.pricingModel && (
          <div className="text-sm font-semibold text-gray-400 mt-2">{agent.pricingModel}</div>
        )}
      </div>

      {/* Primary CTA */}
      <a 
        href={agent.website ? (agent.website.startsWith('http') ? agent.website : `https://${agent.website}`) : '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onVisitWebsite?.()}
        className="block w-full py-4 px-6 bg-white text-black text-center font-bold text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100 no-underline mb-4"
      >
        Visit Website
      </a>

      {/* Secondary Actions */}
      <div className="flex gap-3 mb-6">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 border ${
            isSaved ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/[0.06] text-gray-300 hover:bg-white/[0.05]'
          }`}
        >
          <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        
        <button 
          onClick={() => toggleCompare(agent.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 border ${
            isInCompare ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-white/[0.02] border-white/[0.06] text-gray-300 hover:bg-white/[0.05]'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          Compare
        </button>

        <button 
          onClick={handleShare}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 border ${
            isCopied ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/[0.02] border-white/[0.06] text-gray-300 hover:bg-white/[0.05]'
          }`}
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          Share
        </button>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <ShieldCheck className="w-5 h-5 text-gray-500" />
          <span>Verified AI Vendor</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <LinkIcon className="w-5 h-5 text-gray-500" />
          <span>Direct Official Access</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Users className="w-5 h-5 text-gray-500" />
          <span>Trusted Community</span>
        </div>
      </div>

      <SaveFolderToast 
        agentId={Number(agent.id)} 
        isOpen={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
