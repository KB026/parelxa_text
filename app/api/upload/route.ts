import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = formData.get('bucket') as string | null;
    const filePath = formData.get('filePath') as string | null;

    if (!file || !bucket || !filePath) {
      return NextResponse.json(
        { error: 'Missing file, bucket, or filePath parameters' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let supabase: any;
    if (supabaseServiceKey) {
      supabase = createAdminClient(supabaseUrl, supabaseServiceKey);
    } else {
      supabase = createClient();
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) {
      console.error('API Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (error: any) {
    console.error('API Upload exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
