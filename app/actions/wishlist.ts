/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(agentId: number) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return { error: 'You must be logged in to save to your wishlist.' };
  }

  const userId = session.user.id;

  // Check if it exists
  const { data: existing } = await (supabase
    .from('wishlists' as any)
    .select('id')
    .eq('user_id', userId)
    .eq('agent_id', agentId)
    .single());

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('wishlists' as any)
      .delete()
      .eq('id', existing.id);

    if (error) return { error: 'Failed to remove from wishlist' };
    
    revalidatePath('/products/[slug]', 'page');
    revalidatePath('/dashboard/wishlist', 'page');
    return { isSaved: false };
  } else {
    // Add
    const { error } = await supabase
      .from('wishlists' as any)
      .insert({ user_id: userId, agent_id: agentId });

    if (error) return { error: 'Failed to add to wishlist' };
    
    revalidatePath('/products/[slug]', 'page');
    revalidatePath('/dashboard/wishlist', 'page');
    return { isSaved: true };
  }
}

export async function checkWishlistStatus(agentId: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return false;

  const { data } = await supabase
    .from('wishlists' as any)
    .select('id')
    .eq('user_id', session.user.id)
    .eq('agent_id', agentId)
    .single();

  return !!data;
}
