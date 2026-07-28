'use client';

import Link from 'next/link';
import { Agent } from '@/lib/types';
import { trackClick } from '@/lib/api';
import { useCompare } from '@/context/CompareContext';
import { Star, Bookmark, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toggleWishlist } from '@/app/actions/wishlist';
import { getSavedToolsIds, clearSavedToolsCache } from '@/lib/wishlistClient';

export function AgentCard({ agent, rank }: { agent: Agent, rank?: number }) {
  const { selectedIds, toggleCompare } = useCompare();
  const isFeatured = agent.isFeatured;
  const promotionId = agent.promotionId;
  const name = agent?.name || 'Unnamed Agent';
  const category = agent?.category || 'Uncategorized';
  const rating = (agent?.rating != null && !isNaN(Number(agent.rating))) 
    ? Number(agent.rating).toFixed(1) 
    : '0.0';
  const summary = agent?.summary || 'No description available.';
  const reviewsCount = agent?.reviews_count ?? agent?.reviews ?? 0;
  const pricing = agent?.pricing || 'Contact for pricing';
  
  const isInCompare = selectedIds.includes(agent?.id);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (agent?.id) {
      getSavedToolsIds().then((ids) => {
        setIsSaved(ids.includes(Number(agent.id)));
      });
    }
  }, [agent?.id]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving || !agent?.id) return;
    
    setIsSaving(true);
    try {
      const result = await toggleWishlist(Number(agent.id));
      if (result.error) {
        if (result.error === 'You must be logged in to save tools.') {
          window.dispatchEvent(new CustomEvent('open-auth', { detail: { view: 'signin' } }));
        } else {
          console.error(result.error);
        }
      } else {
        setIsSaved(result.isSaved || false);
        clearSavedToolsCache();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVisitSite = async () => {
    if (isFeatured && promotionId) {
      await trackClick(promotionId);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(agent.id);
  };
  
  return (
    <Link 
      href={`/products/${agent?.slug || agent?.id}`} 
      onClick={handleVisitSite}
      className="group relative block w-full h-full focus:outline-none transition-transform duration-200 hover:-translate-y-1"
    >
      {/* Overlapping Rank Badge */}
      {rank && (
        <div className="absolute -top-3 -left-2 z-10">
          <div className="bg-gradient-to-r from-brand-blue to-brand-fuchsia text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            #{rank} TRENDING
          </div>
        </div>
      )}

      {/* Card Container with subtle gradient border glow on hover */}
      <div className="relative flex flex-col p-4 md:p-6 rounded-2xl border border-white/[0.08] bg-[#1C1C21] group-hover:border-brand-violet/50 transition-all duration-300 w-full h-full shadow-lg group-hover:shadow-[0_15px_35px_rgba(139,92,246,0.15)]">
        
        {/* Top-Right Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`p-1.5 rounded-md transition-colors ${isSaved ? 'text-brand-violet bg-brand-violet/10' : 'text-[#71717A] hover:text-white hover:bg-white/10'}`}
              title="Save to Wishlist"
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleCompareToggle}
              className={`p-1.5 rounded-md transition-colors ${isInCompare ? 'text-brand-violet bg-brand-violet/10' : 'text-[#71717A] hover:text-white hover:bg-white/10'}`}
              title="Add to Compare"
            >
              <Plus className="w-4 h-4" />
            </button>
        </div>
        
        {/* Header Section */}
        <h3 className="font-bold text-white text-xl mb-2 mt-2 group-hover:text-brand-violet transition-colors pr-16 truncate">
          {name}
        </h3>
        <p className="text-sm text-[#A1A1AA] mb-6 flex-1 line-clamp-3 leading-relaxed">
          {summary}
        </p>
        
        {/* Bottom Stats and Match */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
          <span className="text-amber-500 font-bold text-lg flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            {rating}
          </span>
          <div className="inline-flex items-center justify-center font-bold text-[#0A0A0A] bg-white rounded-lg px-5 py-2.5 transition-all duration-300 shadow-sm border border-transparent group-hover:bg-white/5 group-hover:text-white group-hover:border-white/20 group-hover:backdrop-blur-md">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
}
