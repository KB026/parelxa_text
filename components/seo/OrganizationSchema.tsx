import React from 'react';

export function OrganizationSchema() {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Parlexa",
    "url": "https://parlexa.in",
    "logo": "https://parlexa.in/logo.png",
    "description": "Parlexa is an enterprise AI agent directory and AI marketplace enabling organizations to discover, compare, benchmark, and deploy verified autonomous AI agents, voice intelligence platforms, and domain-adapted LLMs.",
    "sameAs": [
      "https://twitter.com/parlexa_ai",
      "https://linkedin.com/company/parlexa"
    ]
  };

  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Parlexa",
    "url": "https://parlexa.in",
    "description": "Enterprise AI agent directory and AI marketplace for discovering, comparing, and deploying 200+ verified AI tools and autonomous agents.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://parlexa.in/products?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd) }}
      />
    </>
  );
}
