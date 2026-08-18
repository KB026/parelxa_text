'use client';

import { useState, useEffect } from 'react';
import { Star, Bookmark, ArrowLeftRight, Share2, Check } from 'lucide-react';
import { Agent, ReviewStats } from '@/lib/types';
import { toggleWishlist } from '@/app/actions/wishlist';
import { useCompare } from '@/context/CompareContext';
import { VisitWebsiteButton } from './VisitWebsiteButton';
import { SaveFolderToast } from './SaveFolderToast';

interface MobileStickyBarProps {
  agent: Agent;
  stats: ReviewStats | null;
  initialSaved?: boolean;
}

export function MobileStickyBar({ agent, stats, initialSaved = false }: MobileStickyBarProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { selectedIds, toggleCompare } = useCompare();
  const isInCompare = selectedIds.includes(agent.id);

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const handleSave = async () => {
    if (isSaving) return;
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
    <>
      <div className="flex lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090B] border-t border-white/10 p-4 flex-row items-center justify-between gap-4">
        {/* Left Column (Info & Actions) */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Top Row (Secondary Actions & Rating) */}
          <div className="flex items-center gap-3 text-gray-400">
            <div className="flex items-center gap-1 text-white font-bold text-sm">
              <Star size={16} className="text-amber-500 fill-current" />
              <span>{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`p-1.5 rounded-lg transition-colors border ${
                isSaved ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : 'text-gray-400 hover:text-white border-transparent'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
              aria-label="Save tool"
            >
              <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            <button 
              onClick={() => toggleCompare(agent.id)}
              className={`p-1.5 rounded-lg transition-colors border ${
                isInCompare ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : 'text-gray-400 hover:text-white border-transparent'
              }`}
              title={isInCompare ? 'In Compare' : 'Compare'}
              aria-label="Compare tool"
            >
              <ArrowLeftRight size={18} />
            </button>

            <button 
              onClick={handleShare}
              className={`p-1.5 rounded-lg transition-colors border ${
                isCopied ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-gray-400 hover:text-white border-transparent'
              }`}
              title={isCopied ? 'Copied Link!' : 'Share'}
              aria-label="Share tool"
            >
              {isCopied ? <Check size={18} /> : <Share2 size={18} />}
            </button>
          </div>
          
          {/* Bottom Row (Pricing) */}
          <div className="text-xs text-gray-400 truncate">
            {agent.pricing}
          </div>
        </div>

        {/* Right Column (Primary CTA) */}
        <VisitWebsiteButton 
          agent={agent}
          className="w-auto px-5 h-11 bg-[#2563eb] text-white font-semibold rounded-xl shrink-0 flex items-center justify-center no-underline hover:bg-[#1d4ed8] transition-colors text-sm"
        />
      </div>

      <SaveFolderToast 
        agentId={Number(agent.id)} 
        isOpen={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </>
  );
}
