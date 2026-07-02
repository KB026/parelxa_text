/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveComparison(agentIds: number[]) {
  if (agentIds.length === 0) return { error: 'No tools selected' };
  
  const supabase = createClient() as any;
  
  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to save comparisons' };
  }

  const { error } = await supabase
    .from('compare_history')
    .insert({
      user_id: user.id,
      agent_ids: agentIds,
    });

  if (error) {
    console.error('Error saving comparison:', error);
    return { error: 'Failed to save comparison to dashboard' };
  }

  return { success: true };
}
