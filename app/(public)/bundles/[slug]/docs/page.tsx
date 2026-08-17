import React from 'react';
import { notFound } from 'next/navigation';
import { getBundleBySlug, getBundlesList } from '@/lib/bundles-service';
import { BundleDocsClient } from '@/components/parlexa/bundles/BundleDocsClient';

export async function generateStaticParams() {
  const bundles = await getBundlesList();
  return bundles.map((b) => ({
    slug: b.slug
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const bundle = await getBundleBySlug(params.slug);
  if (!bundle) return { title: 'Bundle Docs Not Found | Parlexa' };

  return {
    title: `${bundle.name} Documentation & Deployment Playbook | Parlexa`,
    description: `Complete system documentation, tool roles, and setup guide for the ${bundle.name} AI Kit.`
  };
}

export default async function BundleDocsPage({ params }: { params: { slug: string } }) {
  const bundle = await getBundleBySlug(params.slug);

  if (!bundle) {
    notFound();
  }

  return (
    <BundleDocsClient
      bundleSlug={bundle.slug}
      bundleName={bundle.name}
      bundleTagline={bundle.tagline}
      bundleHeadline={bundle.headline}
      bundleDescription={bundle.description}
      bundleCategory={bundle.category}
      benefits={bundle.benefits}
      whoNeedsIt={bundle.who_needs_it}
      useCase={bundle.use_case}
      tools={bundle.tools_full}
    />
  );
}
