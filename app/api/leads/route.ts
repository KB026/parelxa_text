import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendorId, agentId, customerName, customerEmail, message } = body;

    if (!vendorId || !customerName || !customerEmail || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();
    const supabaseAny = supabase as unknown as {
      from: (t: string) => {
        insert: (v: unknown) => {
          select: () => {
            single: () => Promise<{ data: unknown; error: unknown }>
          }
        }
      }
    };

    // Insert the lead
    const { data, error } = await supabaseAny
      .from('leads')
      .insert({
        vendor_id: vendorId,
        agent_id: agentId || null,
        customer_name: customerName,
        customer_email: customerEmail,
        message: message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting lead:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('Lead submission error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
