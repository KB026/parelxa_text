export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { ApprovalQueueClient, PendingAgent } from '@/components/parlexa/admin/ApprovalQueueClient';

export default async function ApprovalQueuePage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('agents')
    .select('id, name, summary, one_liner, website, category, logo_url, created_at, user_email')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('ApprovalQueue: Failed to fetch pending agents', error);
  }

  const agents: PendingAgent[] = (data || []).map((a) => ({
    id: a.id,
    name: a.name,
    summary: a.summary ?? null,
    one_liner: a.one_liner ?? null,
    website: a.website ?? null,
    category: a.category ?? null,
    logo_url: a.logo_url ?? null,
    created_at: a.created_at ?? new Date().toISOString(),
    user_email: a.user_email ?? null,
  }));

  return <ApprovalQueueClient agents={agents} />;
}
