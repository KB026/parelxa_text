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

  const comparison_id = crypto.randomUUID();

  const inserts = agentIds.map(id => ({
    user_id: user.id,
    agent_id: id,
    action_type: 'compare',
    comparison_id: comparison_id
  }));

  const { error } = await supabase
    .from('agent_interactions')
    .insert(inserts);

  if (error) {
    console.error('Error saving comparison:', JSON.stringify(error, null, 2));
    // If it's a constraint error on action_type, log it explicitly
    if (error.code === '23514') {
      console.error('Constraint error: The action_type "compare" may not be allowed in agent_interactions CHECK constraint.');
      return { error: 'Database constraint error: "compare" action not allowed.' };
    }
    return { error: `Failed to save comparison to dashboard: ${error.message || 'Unknown DB error'}` };
  }

  return { success: true };
}
