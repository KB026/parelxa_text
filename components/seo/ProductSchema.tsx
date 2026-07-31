import React from 'react';
import { Agent } from '@/lib/types';

interface ProductSchemaProps {
  agent: Agent;
  stats?: {
    averageRating: number;
    totalReviews: number;
  } | null;
}

export function ProductSchema({ agent, stats }: ProductSchemaProps) {
  const isFree = agent.pricing ? agent.pricing.toLowerCase().includes('free') : false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": agent.name,
    "description": (agent.description || agent.summary || agent.oneLiner) 
      ? `${agent.description || agent.summary || agent.oneLiner} Discovered on Parlexa, the enterprise AI agent directory and AI marketplace.`
      : `${agent.name} is an enterprise AI tool listed on Parlexa, the AI agent directory and AI marketplace.`,
    "applicationCategory": agent.category || "BusinessApplication",
    "operatingSystem": "Web, Cloud, Cross-Platform",
    "image": agent.logoUrl || undefined,
    "url": `https://parlexa.in/products/${agent.slug || agent.id}`,
    "offers": {
      "@type": "Offer",
      "price": isFree ? "0" : "1",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "publisher": agent.companyName ? {
      "@type": "Organization",
      "name": agent.companyName
    } : undefined,
    "aggregateRating": stats && stats.totalReviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": stats.averageRating,
      "reviewCount": stats.totalReviews,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Marketplace", "item": "https://parlexa.in/products" },
      { "@type": "ListItem", "position": 2, "name": agent.category, "item": `https://parlexa.in/products?cats=${encodeURIComponent(agent.category)}` },
      { "@type": "ListItem", "position": 3, "name": agent.name, "item": `https://parlexa.in/products/${agent.slug || agent.id}` }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  );
}
