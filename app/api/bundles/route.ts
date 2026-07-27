import { NextResponse } from 'next/server';
import { getBundlesList } from '@/lib/bundles-service';

export async function GET() {
  try {
    const bundles = await getBundlesList();
    
    // Format response as specified in API contract
    const formattedBundles = bundles.map(b => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      category: b.category,
      tagline: b.tagline,
      description: b.description,
      headline: b.headline,
      tool_count: b.tool_count,
      bundle_icon_url: b.bundle_icon_url || null,
      tool_logos: b.tool_logos,
      rating: b.rating,
      review_count: b.review_count,
      is_featured: b.is_featured,
      display_order: b.display_order
    }));

    return NextResponse.json({
      success: true,
      bundles: formattedBundles
    });
  } catch (error: any) {
    console.error('Error fetching bundles list:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bundles' },
      { status: 500 }
    );
  }
}
