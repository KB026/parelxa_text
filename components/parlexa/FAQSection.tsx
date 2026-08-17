"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { FaqSchema } from '@/components/seo/FaqSchema';

export const HOMEPAGE_FAQS = [
  {
    question: "What is an AI agent marketplace and what is Parlexa?",
    answer: "An AI agent marketplace is a centralized platform where organizations can discover, evaluate, and procure autonomous AI software tools. Parlexa (parlexa.in) is the premier B2B marketplace featuring over 200+ verified AI agents and tools, enabling enterprise decision-makers to search by category, compare pricing, and deploy AI solutions with confidence."
  },
  {
    question: "What are AI agents used for across enterprise business verticals?",
    answer: "Enterprise AI agents automate complex, multi-step workflows across sales, customer support, contact centers, software development, finance, and HR. Unlike static text generators, autonomous agents invoke internal APIs, query enterprise databases, and execute operational tasks—such as resolving support tickets, processing multilingual voice calls, auditing financial transactions, and generating production code."
  },
  {
    question: "How should a business choose the right AI tool for its tech stack?",
    answer: "When selecting an AI tool, businesses should evaluate five core parameters: workflow latency, data compliance (such as SOC2 or local sovereign isolation), API integration ecosystem, pricing model (per-resolution vs seat-based), and auditability. Parlexa simplifies this selection by providing standardized feature matrices, verified buyer reviews, and contextual AI search matching."
  },
  {
    question: "What do enterprise AI tools typically cost?",
    answer: "Enterprise AI pricing generally follows three models: freemium or tiered plans for SMBs, per-resolution or usage-based pricing for customer support and voice bots, and custom annual licenses for air-gapped enterprise deployments. Many tools on Parlexa offer free trials or starter tiers, allowing organizations to benchmark performance before committing to custom enterprise contracts."
  },
  {
    question: "How does Parlexa's Tool Quality Review and verification process work?",
    answer: "Every AI tool listed on Parlexa undergoes strict administrative auditing before publication. Our verification team reviews data privacy standards, active maintenance records, security parameters, and integration capabilities. Only tools that meet enterprise quality standards receive verified badges and active directory placement."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-3xl mx-auto py-24 px-5 scroll-mt-20">
      <FaqSchema faqs={HOMEPAGE_FAQS} />
      
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#EDEDED] mb-4 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-base md:text-lg text-[#A1A1AA] leading-relaxed">
          Everything you need to know about Parlexa and enterprise AI agent deployment
        </p>
      </div>

      <div className="flex flex-col">
        {HOMEPAGE_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="border-b border-white/[0.08] py-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-base md:text-lg font-medium text-[#EDEDED] transition-colors cursor-pointer group text-left gap-4"
                data-state={isOpen ? "open" : "closed"}
              >
                <span>{faq.question}</span>
                <Plus className="w-5 h-5 text-[#71717A] shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-45 group-hover:text-[#EDEDED]" />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out text-[#A1A1AA] leading-relaxed text-[15px] ${isOpen ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                {faq.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
