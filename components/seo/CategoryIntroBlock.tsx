'use client';

import React, { useState } from 'react';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { Plus, HelpCircle } from 'lucide-react';

interface CategoryIntroBlockProps {
  category?: string;
}

// Helper to format category phrases without duplicating "AI" (e.g. "Enterprise AI tools", NOT "Enterprise AI AI tools")
function formatCatLabel(cat: string, noun?: string): string {
  const hasAi = /\bAI\b/i.test(cat);
  if (!noun) return cat;
  if (hasAi) {
    return `${cat} ${noun}`;
  }
  return `${cat} AI ${noun}`;
}

export function CategoryIntroBlock({ category }: CategoryIntroBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const catName = category || 'Enterprise AI';
  const hasAiInName = /\bAI\b/i.test(catName);

  const toolsLabel = formatCatLabel(catName, 'tools');
  const agentsLabel = formatCatLabel(catName, 'agents');
  const softwareLabel = formatCatLabel(catName, 'software');

  const categoryFaqs = [
    {
      question: `What are ${toolsLabel} and how do they automate enterprise workflows?`,
      answer: `${toolsLabel} leverage domain-adapted machine learning models and autonomous agents to automate complex operational workflows within the ${catName} sector. On Parlexa, you can explore verified AI solutions from Parlexa's 200+ tool catalog that integrate via APIs to streamline manual tasks, reduce operating costs, and improve team output.`
    },
    {
      question: `Why should enterprises deploy specialized ${agentsLabel} over generic LLMs?`,
      answer: `While general-purpose LLMs excel at casual conversation, specialized ${agentsLabel} are trained on domain-specific taxonomy, compliance rules, and enterprise datasets. This domain focus eliminates hallucinations, guarantees deterministic logic, and ensures strict adherence to industry security regulations.`
    },
    {
      question: `How do I compare pricing and features for ${softwareLabel} on Parlexa?`,
      answer: `Parlexa provides side-by-side comparison tools allowing you to inspect pricing models, free trial availability, integration features, and verified user ratings for ${catName} solutions. You can filter by deployment type and business size to select the optimal tool for your infrastructure.`
    },
    {
      question: `Why do Indian enterprises need localized and Indic language AI tools?`,
      answer: `Indian businesses operate across diverse linguistic regions with multi-accent voice calls and vernacular customer interactions. Localized AI tools—such as Indic speech models and sovereign LLMs—provide native fluency in 14+ regional languages while ensuring customer data remains stored on secure, local servers compliant with Indian data governance laws.`
    },
    {
      question: `How can AI tool vendors list their ${catName} solutions on Parlexa?`,
      answer: `AI developers and software companies can submit their ${catName} solutions through Parlexa's vendor portal. Following a thorough quality audit for security and API readiness, approved tools join Parlexa's catalog of 200+ verified listings to gain instant visibility among enterprise decision-makers.`
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-10 space-y-6">
      <FaqSchema faqs={categoryFaqs} />

      {/* --- Intro Overview Box (Left-aligned, capped line width) --- */}
      <div className="bg-[#111116] border border-white/[0.08] rounded-2xl p-6 md:p-8 text-gray-300 text-left">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 tracking-tight">
          {category 
            ? (hasAiInName ? `Comprehensive Guide to Best ${category} Tools & Agents` : `Comprehensive Guide to Best ${category} AI Tools & Agents`)
            : 'Overview of Enterprise AI Tools & Autonomous Agents'}
        </h2>
        <div className="space-y-3.5 max-w-3xl text-sm md:text-base leading-relaxed text-gray-400">
          <p>
            Welcome to the Parlexa Global AI Agent Directory — your comprehensive marketplace for discovering, evaluating, and deploying enterprise-grade artificial intelligence solutions. As modern business operations demand higher efficiency and automated decision-making, selecting the right AI software stack is critical to maintaining a competitive edge.
          </p>
          <p>
            Our verified marketplace indexes over 200+ top-performing AI tools across multiple industry domains. Whether you are looking for intelligent customer support agents, generative code assistants, predictive financial analytics, or multi-channel sales automation systems, Parlexa provides transparent feature breakdowns, real user reviews, deployment criteria, and security compliance insights to empower your procurement process.
          </p>
        </div>
      </div>

      {/* --- Category AEO / FAQ Accordion Block --- */}
      <div className="bg-[#111116] border border-white/[0.08] rounded-2xl p-6 md:p-8 text-left">
        <h3 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2 font-serif">
          <HelpCircle className="w-5 h-5 text-[#8B5CF6]" />
          Frequently Asked Questions About {hasAiInName ? `${catName} Tools` : `${catName} AI Tools`}
        </h3>
        
        <div className="divide-y divide-white/[0.08]">
          {categoryFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-3.5">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-sm md:text-base font-medium text-[#EDEDED] transition-colors cursor-pointer group text-left gap-4"
                  data-state={isOpen ? "open" : "closed"}
                >
                  <span>{faq.question}</span>
                  <Plus className="w-4 h-4 text-[#71717A] shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-45 group-hover:text-[#EDEDED]" />
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out text-[#A1A1AA] leading-relaxed text-xs md:text-sm ${isOpen ? 'max-h-[300px] mt-2.5 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
