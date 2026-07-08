'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveAgent(agentId: number) {
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

  const { error } = await (supabase.from('agents') as any)
    .update({
      approval_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq('id', agentId);

  if (error) {
    console.error('approveAgent error:', error);
    return { success: false, error: 'Failed to approve agent' };
  }

  revalidatePath('/admin/approval-queue');
  revalidatePath('/admin');
  revalidatePath('/products');
  revalidatePath('/directory');
  revalidatePath('/');
  revalidatePath('/dashboard/vendor');
  revalidatePath('/dashboard/vendor/listings');

  return { success: true };
}

export async function rejectAgent(agentId: number, notes?: string) {
  const supabase = createClient();

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

  const updatePayload: Record<string, string> = {
    approval_status: 'rejected',
  };
  if (notes) {
    updatePayload.approval_notes = notes.trim();
  }

  const { error } = await (supabase.from('agents') as any)
    .update(updatePayload)
    .eq('id', agentId);

  if (error) {
    console.error('rejectAgent error:', error);
    return { success: false, error: 'Failed to reject agent' };
  }

  revalidatePath('/admin/approval-queue');
  revalidatePath('/admin');

  return { success: true };
}
