'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendVendorReply(agentId: number, content: string) {
  const supabase = createClient();

  // Verify caller
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Verify vendor owns this agent
  const { data: agentData, error: agentError } = await supabase
    .from('agents')
    .select('user_id')
    .eq('id', agentId)
    .single();

  if (agentError || agentData?.user_id !== user.id) {
    console.error('Failed to verify agent ownership:', agentError);
    return { success: false, error: 'Unauthorized or tool not found' };
  }

  // Find the admin_id from the existing thread
  const { data: existingMessages, error: msgError } = await (supabase as any)
    .from('vendor_messages')
    .select('admin_id')
    .eq('agent_id', agentId)
    .limit(1);

  if (msgError || !existingMessages || existingMessages.length === 0) {
    return { success: false, error: 'Cannot reply to a thread that has not been started by an admin.' };
  }

  const adminId = existingMessages[0].admin_id;

  // Insert message (bypassing strict typing with `any`)
  const { data: insertedMessage, error: insertError } = await (supabase as any)
    .from('vendor_messages')
    .insert({
      agent_id: agentId,
      vendor_id: user.id,
      admin_id: adminId,
      message_content: content.trim(),
      sender_type: 'vendor',
      is_read: false,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error sending message:', insertError);
    return { success: false, error: 'Failed to send message' };
  }

  revalidatePath('/dashboard/vendor/resolution');
  
  return { success: true, message: insertedMessage };
}
