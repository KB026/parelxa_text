'use client';

import { Agent, ReviewStats } from '@/lib/types';
import { StarRating } from '../reviews/ReviewStats';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Share2, ArrowRightLeft, CheckCircle } from 'lucide-react';
import { SaveToWishlistButton } from './SaveToWishlistButton';
import { useCompare } from '@/context/CompareContext';

interface HeroSectionProps {
  agent: Agent;
  stats: ReviewStats | null;
  onVisitWebsite?: () => void;
  onCompare?: () => void;
  onShare?: () => void;
}

export function HeroSection({ 
  agent, 
  stats, 
  onVisitWebsite, 
  onCompare, 
  onShare 
}: HeroSectionProps) {
  const { selectedIds, toggleCompare } = useCompare();
  const isInCompare = selectedIds.includes(agent.id);

  const handleShare = async () => {
    if (onShare) return onShare();
    try {
      if (navigator.share) {
        await navigator.share({
          title: agent.name,
          text: `Check out ${agent.name} on Parlexa!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };


  return (
    <section className="mb-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Tool Logo */}
        <div className="w-[120px] h-[120px] rounded-3xl bg-[#0d1524] border border-white/5 flex items-center justify-center text-5xl shrink-0 overflow-hidden">
          {agent.logoUrl ? (
            <Image src={agent.logoUrl} alt={agent.name} width={120} height={120} className="w-full h-full object-cover" />
          ) : (
            agent.name[0]
          )}
        </div>

        {/* Content */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold m-0 tracking-tight">{agent.name}</h1>
            {agent.isVerified && (
              <span className="relative group/badge flex items-center">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[10px] font-bold shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                  <CheckCircle className="w-3 h-3" />
                </span>
              </span>
            )}
          </div>
          
          <p className="text-xl text-slate-400 m-0 mb-4 leading-relaxed">
            {agent.oneLiner || agent.summary.split('.')[0] + '.'}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <StarRating rating={stats?.averageRating || 0} size="sm" />
              <span className="font-bold text-base">{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
            </div>
            <span className="text-white/10">|</span>
            <span className="text-slate-500 text-sm">
              {(stats?.totalReviews || 0).toLocaleString()} Reviews
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="default" className="bg-blue-700 hover:bg-blue-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-none">
              {agent.category}
            </Badge>
            {agent.tags?.map(tag => (
              <Badge key={tag} variant="outline" className="px-3 py-1 bg-white/5 rounded-full text-[13px] text-slate-400 border-white/5 font-normal">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg"
              className="px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              onClick={() => {
                const url = agent.website ? (agent.website.startsWith('http') ? agent.website : `https://${agent.website}`) : '#';
                window.open(url, '_blank', 'noopener,noreferrer');
                onVisitWebsite?.();
              }}
            >
              Visit Website
            </Button>
            <div className="flex gap-3">
              <SaveToWishlistButton agentId={agent.id.toString()} />
              <Button 
                variant="outline"
                size="icon"
                className={`w-12 h-12 rounded-xl border-white/10 ${isInCompare ? 'bg-sky-400 text-black border-sky-400 hover:bg-sky-500' : 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white'}`}
                onClick={() => { toggleCompare(agent.id); onCompare?.(); }}
                title={isInCompare ? "Remove from Compare" : "Add to Compare"}
              >
                <ArrowRightLeft className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-xl bg-slate-900 border-white/10 text-white hover:bg-slate-800 hover:text-white"
                onClick={handleShare}
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden mt-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-orange-400" /> Key Features</h3>
        <ul className="grid grid-cols-1 gap-3">
          {agent.features?.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
