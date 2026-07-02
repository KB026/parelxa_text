'use client';

import Link from 'next/link';
import { Agent } from '@/lib/types';
import { trackClick } from '@/lib/api';
import { useCompare } from '@/context/CompareContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Sparkles, MapPin, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toggleWishlist } from '@/app/actions/wishlist';
import { getSavedToolsIds, clearSavedToolsCache } from '@/lib/wishlistClient';

export function AgentCard({ agent }: { agent: Agent }) {
  const { selectedIds, toggleCompare } = useCompare();
  const isFeatured = agent.isFeatured;
  const promotionId = agent.promotionId;
  const name = agent?.name || 'Unnamed Agent';
  const category = agent?.category || 'Uncategorized';
  const rating = (agent?.rating != null && !isNaN(Number(agent.rating))) 
    ? Number(agent.rating).toFixed(1) 
    : '0.0';
  const subCategory = agent?.subCategory || '';
  const summary = agent?.summary || 'No description available.';
  const reviews = (agent?.reviews_count ?? agent?.reviews ?? 0).toLocaleString();
  const pricing = agent?.pricing || 'Contact for pricing';
  const isVerified = agent?.isVerified === true;
  const hasIndiaPricing = agent?.pricing?.toLowerCase().includes('inr') || agent?.pricing?.toLowerCase().includes('₹');
  
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
        clearSavedToolsCache(); // Invalidate cache so other cards update if re-mounted
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
    <div 
      className={`relative group ${isFeatured ? 'z-10 scale-[1.03] transition-transform duration-300' : 'z-0 transition-transform duration-300 hover:-translate-y-1'}`}
    >
      {isFeatured && (
        <span className="absolute -top-3 left-5 z-10 bg-gradient-to-br from-orange-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-[0_4px_15px_rgba(249,115,22,0.4)] border border-white/30 tracking-wider flex items-center">
          <Sparkles className="w-3 h-3 mr-1" /> FEATURED
        </span>
      )}

      {/* Compare Toggle Button */}
      <button 
        onClick={handleCompareToggle}
        title={isInCompare ? "Remove from Compare" : "Add to Compare"}
        className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 pointer-events-auto hover:scale-110 ${isInCompare ? 'bg-sky-400 text-black border-none' : 'bg-white/5 border border-white/5 text-white'}`}
      >
        {isInCompare ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        )}
      </button>

      {/* Bookmark Save Button */}
      <button 
        onClick={handleSave}
        disabled={isSaving}
        title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
        className={`absolute top-4 right-14 z-10 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 pointer-events-auto hover:scale-110 ${isSaved ? 'bg-sky-400 text-black border-none' : 'bg-white/5 border border-white/5 text-white'} ${isSaving ? 'opacity-50' : ''}`}
      >
        <Bookmark 
          size={16} 
          fill={isSaved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
        />
      </button>
      
      <Link 
        href={`/products/${agent?.slug || agent?.id}`} 
        className="block h-full no-underline text-inherit focus:outline-none"
        onClick={handleVisitSite}
      >
        <Card className={`h-full flex flex-col transition-all duration-300 ${isFeatured ? 'bg-[#191e2d]/95 border-2 border-orange-400/50 shadow-[0_10px_40px_rgba(251,146,60,0.15)]' : 'bg-[#111c2e] border-white/5 group-hover:bg-[#162035] group-hover:border-sky-400/25 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'}`}>
          <CardHeader className="pb-2 pr-16">
            <div className="flex items-start justify-between">
              <Badge variant="default" className={`${isFeatured ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-700 hover:bg-blue-800'} text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-none`}>
                {category}
              </Badge>
              <div className="flex items-center gap-1 bg-amber-900/50 text-amber-400 text-xs font-bold px-2 py-1 rounded-md mr-1">
                <Star className="w-3 h-3 fill-current" /> {rating}
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-1.5 mt-2">
                {name}
                {isVerified && (
                  <span className="relative group/badge flex items-center">
                    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[10px] font-bold shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                      <CheckCircle className="w-3 h-3" />
                    </span>
                  </span>
                )}
              </CardTitle>
              <div className="text-xs font-medium text-sky-400 mt-0.5">{subCategory}</div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <p className="text-[13px] text-slate-400 leading-relaxed">
              {summary}
            </p>
            {hasIndiaPricing && (
              <div className="inline-flex items-center px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md text-[11px] font-semibold text-orange-400 mt-2">
                <MapPin className="w-3 h-3 mr-1.5" /> Special India Pricing Available
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-white/5 pt-4 bg-transparent justify-between items-center px-4">
            <span className="text-xs text-slate-500">{reviews} reviews</span>
            <span className={`text-[13px] font-bold truncate max-w-[150px] ${isFeatured ? 'text-orange-400' : 'text-sky-400'}`} title={pricing}>
              {pricing}
            </span>
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}
