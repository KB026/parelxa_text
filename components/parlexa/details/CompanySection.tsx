'use client';
import { ArrowRight } from 'lucide-react';

interface CompanySectionProps {
  companyName?: string;
  foundingYear?: number;
  city?: string;
  teamSize?: string;
  companyLinkedin?: string;
  companyBlurb?: string;
}

export function CompanySection({ 
  companyName, 
  foundingYear, 
  city, 
  teamSize, 
  companyLinkedin, 
  companyBlurb 
}: CompanySectionProps) {
  return (
    <section>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <h3 className="m-0 text-xl font-bold text-white">Company Stats</h3>
          <p className="mt-2 mb-0 text-sm text-white/70 leading-relaxed">
            {companyBlurb || `A forward-thinking company focused on pushing the boundaries of AI in India. Built by ${companyName || 'the Team'}.`}
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-[1px] bg-white/5">
          <div className="p-6 bg-[#0f172a]">
            <div className="text-white/50 text-xs font-semibold tracking-wider uppercase mb-2">Founded</div>
            <div className="text-lg font-bold text-white">{foundingYear || 'N/A'}</div>
          </div>
          <div className="p-6 bg-[#0f172a]">
            <div className="text-white/50 text-xs font-semibold tracking-wider uppercase mb-2">HQ</div>
            <div className="text-lg font-bold text-white">{city || 'India'}</div>
          </div>
          <div className="p-6 bg-[#0f172a]">
            <div className="text-white/50 text-xs font-semibold tracking-wider uppercase mb-2">Team Size</div>
            <div className="text-lg font-bold text-white">{teamSize || '1-10'} members</div>
          </div>
          <div className="p-6 bg-[#0f172a]">
            <div className="text-white/50 text-xs font-semibold tracking-wider uppercase mb-2">Funding</div>
            <div className="text-lg font-bold text-white">Undisclosed</div>
          </div>
        </div>

        {/* Footer Link */}
        {companyLinkedin && (
          <a 
            href={companyLinkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-white/[0.02] hover:bg-white/[0.04] text-white text-sm font-semibold no-underline transition-colors border-t border-white/5"
          >
            LinkedIn Profile
            <ArrowRight size={16} />
          </a>
        )}
      </div>
    </section>
  );
}
