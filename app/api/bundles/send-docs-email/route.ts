import { NextResponse } from 'next/server';
import { sendBundleDocsEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email, bundleName, bundleSlug } = await req.json();

    if (!email || !bundleSlug) {
      return NextResponse.json(
        { success: false, error: 'Email and bundleSlug are required' },
        { status: 400 }
      );
    }

    const result = await sendBundleDocsEmail(
      email,
      bundleName || 'AI Kit',
      bundleSlug
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('API send-docs-email error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
