import { createClient } from '@/lib/supabase/server';
import { sendEmail } from './resend';
import { templates } from './templates';

export async function processWeeklyDigest() {
  const supabase = createClient();
  
  // 1. Get all users who haven't opted out
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, notification_prefs')
    .eq('notification_prefs->weekly_digest', true);

  if (!users) return { success: false, error: 'No recipients' };

  // 2. Get new tools from last 7 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const { data: newTools } = await supabase
    .from('agents')
    .select('name, category, slug')
    .eq('approval_status', 'approved')
    .gte('created_at', lastWeek.toISOString())
    .limit(5);

  if (!newTools || newTools.length === 0) return { success: false, error: 'No new tools this week' };

  const formattedTools = newTools.map(t => ({
    name: t.name || 'Unnamed Tool',
    category: t.category || 'AI & LLMs',
    slug: t.slug || ''
  }));

  const typedUsers = users as unknown as { id: string; email: string; full_name: string | null }[];

  // 3. Send emails
  const results = await Promise.all(typedUsers.map(user => {
    const unsubscribeLink = `https://parlexa.in/api/email/unsubscribe?userId=${user.id}&type=weekly_digest`;
    const html = templates.weeklyDigest(user.full_name || 'User', formattedTools, unsubscribeLink);
    return sendEmail({ to: user.email, subject: 'Weekly AI Insights: New Tools on Parlexa ðŸ§ ', html });
  }));

  return { success: true, count: results.filter(r => r.success).length };
}

export async function triggerSavedToolVerificationAlert(agentId: string) {
  const supabase = createClient();

  // 1. Get the agent name/slug
  const { data: agent } = await supabase
    .from('agents')
    .select('name, slug')
    .eq('id', Number(agentId))
    .single();

  if (!agent) return;

  // 2. Find users who have this tool in their 'ai_finder_results' or some saved list
  // Note: For this MVP, we'll look at the user preferences or a 'saved_tools' table if it exists.
  // Assuming a table 'saved_tools' (Common in marketplaces)
  const { data: saves } = await supabase
    .from('saved_tools')
    .select('user_id, profiles(email, notification_prefs)')
    .eq('agent_id', Number(agentId));

  if (!saves) return;

  for (const save of saves) {
    const profile = save.profiles as unknown as { email: string; notification_prefs?: Record<string, boolean | undefined> } | null;
    if (profile?.email && profile?.notification_prefs?.verified_alert !== false) {
      const unsubscribeLink = `https://parlexa.in/api/email/unsubscribe?userId=${save.user_id}&type=verified_alert`;
      const html = templates.savedToolVerified(agent.name || 'Unnamed Tool', agent.slug || '', unsubscribeLink);
      await sendEmail({ to: profile.email, subject: `âœ“ Verification Alert: ${agent.name || 'Unnamed Tool'}`, html });
    }
  }
}

