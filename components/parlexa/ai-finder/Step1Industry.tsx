'use client';
import { Industry, useAIFinderWizard } from '@/lib/hooks/useAIFinderWizard';

const industries: { id: Industry; label: string; emoji: string; desc: string }[] = [
  { id: 'saas-tech', label: 'SaaS / Tech', emoji: '💻', desc: 'Software, cloud, developer tools' },
  { id: 'marketing-sales', label: 'Marketing & Sales', emoji: '📣', desc: 'Ads, outreach, CRM, growth' },
  { id: 'ecommerce-retail', label: 'E-Commerce / Retail', emoji: '🛒', desc: 'Online store, D2C, marketplace' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥', desc: 'Clinics, hospitals, healthtech' },
  { id: 'fintech', label: 'FinTech', emoji: '💳', desc: 'Payments, lending, compliance, fraud' },
  { id: 'hr-recruitment', label: 'HR / Recruitment', emoji: '👥', desc: 'Hiring, talent, workforce' },
  { id: 'logistics', label: 'Logistics & Supply Chain', emoji: '🚚', desc: 'Delivery, fleet, warehouse' },
  { id: 'agritech', label: 'AgriTech', emoji: '🌾', desc: 'Farming, crop, agri-intelligence' },
  { id: 'edtech', label: 'EdTech', emoji: '📚', desc: 'Learning, training, schools' },
  { id: 'content-creation', label: 'Content Creation', emoji: '🎨', desc: 'Video, writing, social media, design' },
  { id: 'real-estate', label: 'Real Estate', emoji: '🏢', desc: 'Property, listings, agents' },
  { id: 'other', label: 'Other', emoji: '🔧', desc: 'Something else entirely' },
];

export function Step1Industry() {
  const { selectIndustry } = useAIFinderWizard();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-blue-400 font-medium mb-1">Step 1 of 3</p>
        <h2 className="text-3xl font-bold mb-2">What industry are you in?</h2>
        <p className="text-gray-400">We will match you with tools built for your sector</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {industries.map(ind => (
          <button
            key={ind.id}
            onClick={() => selectIndustry(ind.id)}
            className="p-4 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left group"
          >
            <div className="text-2xl mb-2">{ind.emoji}</div>
            <div className="font-semibold text-sm text-white group-hover:text-blue-400">
              {ind.label}
            </div>
            <div className="text-xs text-gray-500 mt-1">{ind.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
