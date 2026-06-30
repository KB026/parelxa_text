/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(agentId: number, folderId?: string | null) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return { error: 'You must be logged in to save tools.' };
  }

  const userId = session.user.id;

  // Check if it exists in saved_tools
  const { data: existing } = (await supabase
    .from('saved_tools' as any)
    .select('id')
    .eq('user_id', userId)
    .eq('tool_id', agentId)
    .single()) as any;

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('saved_tools' as any)
      .delete()
      .eq('id', existing.id);

    if (error) return { error: 'Failed to remove from saved tools' };
    
    revalidatePath('/products/[slug]', 'page');
    revalidatePath('/dashboard/consumer/saved', 'page');
    return { isSaved: false };
  } else {
    // Add
    const { error } = await supabase
      .from('saved_tools' as any)
      .insert({ user_id: userId, tool_id: agentId, folder_id: folderId || null });

    if (error) return { error: 'Failed to save tool' };
    
    revalidatePath('/products/[slug]', 'page');
    revalidatePath('/dashboard/consumer/saved', 'page');
    return { isSaved: true };
  }
}

export async function checkWishlistStatus(agentId: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return false;

  const { data } = await supabase
    .from('saved_tools' as any)
    .select('id')
    .eq('user_id', session.user.id)
    .eq('tool_id', agentId)
    .maybeSingle();

  return !!data;
}

export async function createFolder(name: string): Promise<{ error?: string; folder?: { id: string; name: string } }> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('saved_tools_folders' as any)
    .insert({ user_id: session.user.id, name })
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath('/dashboard/consumer/saved', 'page');
  return { folder: data as unknown as { id: string; name: string } };
}

export async function getFolders(): Promise<{ id: string; name: string }[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return [];

  const { data } = await supabase
    .from('saved_tools_folders' as any)
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true });

  return (data as unknown as { id: string; name: string }[]) || [];
}

export async function moveToolToFolder(agentId: number, folderId: string | null) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('saved_tools' as any)
    .update({ folder_id: folderId })
    .eq('user_id', session.user.id)
    .eq('tool_id', agentId);

  if (error) return { error: error.message };
  
  revalidatePath('/dashboard/consumer/saved', 'page');
  return { success: true };
}
