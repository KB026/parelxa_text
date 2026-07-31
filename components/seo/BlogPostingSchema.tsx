import React from 'react';
import { BlogPost } from '@/lib/blog';

interface BlogPostingSchemaProps {
  post: BlogPost;
  url: string;
}

export function BlogPostingSchema({ post, url }: BlogPostingSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Organization",
      "name": post.author.name,
      "url": "https://parlexa.in"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Parlexa",
      "url": "https://parlexa.in",
      "description": "Parlexa is an enterprise AI agent directory and AI marketplace.",
      "logo": {
        "@type": "ImageObject",
        "url": "https://parlexa.in/logo.png"
      }
    },
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": post.category,
    "keywords": post.tags.join(', ')
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://parlexa.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://parlexa.in/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": url
      }
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
