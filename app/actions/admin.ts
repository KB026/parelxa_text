import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendFeaturedAlert } from '@/lib/email/actions';

/**
 * Creates a manual promotion (e.g., for partners) without a transaction
 */
export async function authorizeManualPromotion(data: {
  agent_id: number;
  plan: 'weekly' | 'monthly';
  reason: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  // Get owner of agent
  const { data: agent } = await supabase.from('agents').select('user_id').eq('id', data.agent_id).single();
  if (!agent) throw new Error('Agent not found');

  const startDate = new Date();
  const endDate = new Date();
  if (data.plan === 'weekly') endDate.setDate(startDate.getDate() + 7);
  else endDate.setDate(startDate.getDate() + 30);
  
  try {
    const { error } = await supabase
      .from('promotions')
      .insert({
        agent_id: data.agent_id,
        user_id: agent.user_id,
        type: 'featured_home',
        plan: data.plan,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        amount: 0,
        currency: 'INR'
      });
      
    if (error) throw error;

    // Update agent featured status
    await supabase.from('agents').update({ is_featured: true }).eq('id', data.agent_id);
    
    // Send Confirmation Email
    const { data: agentData } = await supabase.from('agents').select('name').eq('id', data.agent_id).single();
    if (agentData && user.email) {
      await sendFeaturedAlert(user.email, agentData.name, false);
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/'); // For homepage featured Tools
    revalidatePath('/products');
    
    return { success: true };
  } catch (err) {
    console.error('Manual Promotion Error:', err);
    return { success: false, error: 'Failed to authorize manual promotion' };
  }
}

/**
 * Deactivates or expires a promotion early
 */
export async function updatePromotionStatus(id: string, agentId: number, status: 'active' | 'expired') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  try {
    const { error } = await supabase
      .from('promotions')
      .update({ status })
      .eq('id', id);
      
    if (error) throw error;
    
    // If expiring, check if any other active promotions exist for this agent
    if (status === 'expired') {
        const { count } = await supabase
            .from('promotions')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agentId)
            .eq('status', 'active');
        
        if (count === 0) {
            await supabase.from('agents').update({ is_featured: false }).eq('id', agentId);
        }
    } else {
        await supabase.from('agents').update({ is_featured: true }).eq('id', agentId);
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    revalidatePath('/products');
    
    return { success: true };
  } catch (err) {
    console.error('Update Promotion Error:', err);
    return { success: false, error: 'Failed to update promotion status' };
  }
}
