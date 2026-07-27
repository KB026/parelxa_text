import { NextRequest, NextResponse } from 'next/server';
import { getBundleBySlug } from '@/lib/bundles-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const bundle = await getBundleBySlug(slug);

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: `Bundle not found for slug '${slug}'` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bundle: {
        id: bundle.id,
        slug: bundle.slug,
        name: bundle.name,
        tagline: bundle.tagline,
        description: bundle.description,
        category: bundle.category,
        headline: bundle.headline,
        benefits: bundle.benefits,
        use_case: bundle.use_case,
        who_needs_it: bundle.who_needs_it,
        tool_count: bundle.tool_count,
        rating: bundle.rating,
        review_count: bundle.review_count,
        is_featured: bundle.is_featured,
        tools: bundle.tools_full
      }
    });
  } catch (error: any) {
    console.error('Error fetching bundle detail:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bundle detail' },
      { status: 500 }
    );
  }
}
