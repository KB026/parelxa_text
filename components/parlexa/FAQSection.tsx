"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: "What is Parlexa?",
    answer: "Parlexa is India's first AI agent marketplace, connecting businesses with vetted AI tools across categories like customer support, marketing, HR, healthcare, and fintech — built for the Indian business context."
  },
  {
    question: "Is Parlexa free to use?",
    answer: "Yes. Browsing, searching, and comparing AI tools on Parlexa is completely free for businesses and individuals."
  },
  {
    question: "How is Parlexa different from global AI agent marketplaces?",
    answer: "Most AI agent marketplaces (like the GPT Store or Poe) are built for global, English-first, subscription-based markets. Parlexa focuses specifically on tools relevant to Indian businesses, with local pricing context, category curation for Indian industries, and no assumption of a global monetization model."
  },
  {
    question: "How do I list my AI tool on Parlexa?",
    answer: "Click \"List your tool\" in the navbar, fill in your company details, and our team reviews and approves listings before they go live — keeping the marketplace curated and trustworthy."
  },
  {
    question: "Are the AI tools on Parlexa verified?",
    answer: "Yes. Every listing goes through admin review before approval. Verified tools display a blue checkmark badge."
  },
  {
    question: "Can I compare multiple AI tools before choosing one?",
    answer: "Yes. Use our Compare feature to see AI tools side-by-side across pricing, features, and reviews."
  },
  {
    question: "How does Parlexa's AI Search work?",
    answer: "Parlexa uses AI to understand what you're trying to solve (not just keyword matching) and recommends the most relevant tools from our marketplace, with a plain-language explanation of why."
  },
  {
    question: "What categories of AI tools does Parlexa cover?",
    answer: "AI & LLMs, Customer Experience, Marketing & Sales, HR & Workforce, Healthcare, FinTech, Retail & E-Commerce, Developer Tools, Logistics, AgriTech, EdTech, and Enterprise Automation."
  },
  {
    question: "Is Parlexa only for Indian companies?",
    answer: "No — while Parlexa is built with Indian businesses in mind, any business can list or discover AI tools on the platform."
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
    <section style={{ maxWidth: '800px', margin: '80px auto', padding: '0 20px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
          Frequently Asked Questions
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '18px' }}>
          Everything you need to know about Parlexa
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              style={{
                background: 'var(--bg-card, rgba(30, 41, 59, 0.5))',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease',
                borderColor: isOpen ? 'var(--cyan, #0ea5e9)' : 'var(--border-subtle, rgba(255, 255, 255, 0.1))'
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  background: 'transparent',
                  border: 'none',
                  color: isOpen ? 'var(--cyan, #0ea5e9)' : '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {faq.question}
                <ChevronDown 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    transition: 'transform 0.3s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: isOpen ? 'var(--cyan, #0ea5e9)' : 'var(--text-dim, #94a3b8)'
                  }} 
                />
              </button>
              
              <div 
                style={{
                  padding: isOpen ? '0 20px 20px 20px' : '0 20px',
                  maxHeight: isOpen ? '500px' : '0',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  color: 'var(--text-dim, #cbd5e1)',
                  lineHeight: 1.6,
                  fontSize: '15px'
                }}
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
