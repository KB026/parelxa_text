"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    question: "What is Parlexa?",
    answer: "Parlexa is India's first AI agent marketplace, connecting businesses with vetted AI tools across categories like customer support, marketing, HR, healthcare, and fintech — built for the Indian business context."
  },
  {
    question: "How is Parlexa different from global AI agent marketplaces?",
    answer: "Most AI agent marketplaces (like the GPT Store or Poe) are built for global, English-first, subscription-based markets. Parlexa focuses specifically on tools relevant to Indian businesses, with local pricing context, category curation for Indian industries, and no assumption of a global monetization model."
  },
  {
    question: "How does Parlexa's AI Search work?",
    answer: "Parlexa uses AI to understand what you're trying to solve (not just keyword matching) and recommends the most relevant tools from our marketplace, with a plain-language explanation of why."
  },
  {
    question: "Are the AI tools on Parlexa verified?",
    answer: "Yes. Every listing goes through admin review before approval. Verified tools display a blue checkmark badge."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="max-w-3xl mx-auto py-24 px-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <div className="text-center mb-12">
        <h2 className="text-4xl font-semibold text-[#EDEDED] mb-4 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-[#A1A1AA] leading-relaxed">
          Everything you need to know about Parlexa
        </p>
      </div>

      <div className="flex flex-col">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="border-b border-white/[0.08] py-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-lg font-medium text-[#EDEDED] transition-colors cursor-pointer group text-left"
                data-state={isOpen ? "open" : "closed"}
              >
                {faq.question}
                <Plus className="w-5 h-5 text-[#71717A] transition-transform duration-300 group-data-[state=open]:rotate-45 group-hover:text-[#EDEDED]" />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out text-[#A1A1AA] leading-relaxed text-[15px] ${isOpen ? 'max-h-[500px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}
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
