'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendVendorMessageEmail } from '@/lib/resend';

export async function sendMessageToVendor(agentId: number, content: string) {
  const supabase = createClient();

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  // Find the vendor's user_id for this agent
  const { data: agentData, error: agentError } = await supabase
    .from('agents')
    .select('user_id, name')
    .eq('id', agentId)
    .single();

  if (agentError || !agentData?.user_id) {
    console.error('Failed to find vendor for agent:', agentError);
    return { success: false, error: 'Could not find vendor for this tool' };
  }

  const vendorId = agentData.user_id;

  // Insert message (bypassing strict typing with `any` as done previously)
  const { data: insertedMessage, error: insertError } = await (supabase as any).from('vendor_messages')
    .insert({
      agent_id: agentId,
      vendor_id: vendorId,
      admin_id: user.id,
      message_content: content.trim(),
      sender_type: 'admin',
      is_read: false,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error sending message:', insertError);
    return { success: false, error: 'Failed to send message' };
  }

  try {
    const { data: vendor } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (vendor?.email) {
      await sendVendorMessageEmail(vendor.email, agentData.name || 'Your Tool', content.trim());
    }
  } catch (err) {
    console.error('Failed to send vendor message email:', err);
  }

  revalidatePath('/admin/resolution-center');
  
  return { success: true, message: insertedMessage };
}
