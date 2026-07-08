import { createClient } from '@/lib/supabase/server';
import { ResolutionCenterClient, Thread, Message } from '@/components/parlexa/admin/ResolutionCenterClient';

export const dynamic = 'force-dynamic';

export default async function ResolutionCenterPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const agentIdParam = searchParams?.agentId;
  const targetAgentId = agentIdParam ? Number(agentIdParam) : null;

  // Fetch all messages and join with agents
  const { data: messages, error } = await (supabase as any)
    .from('vendor_messages')
    .select(`
      *,
      agents:agent_id (
        id,
        name,
        website,
        user_email
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching vendor messages:', error);
  }

  // Group messages by agent_id to create threads
  const threadsMap = new Map<number, Thread>();

  (messages || []).forEach((msg: any) => {
    const agentId = msg.agent_id;
    if (!threadsMap.has(agentId)) {
      threadsMap.set(agentId, {
        agent_id: agentId,
        agent_name: msg.agents?.name || `Agent #${agentId}`,
        vendor_email: msg.agents?.user_email || 'Unknown',
        website: msg.agents?.website || null,
        messages: [],
      });
    }
    
    threadsMap.get(agentId)!.messages.push({
      id: msg.id,
      agent_id: msg.agent_id,
      vendor_id: msg.vendor_id,
      admin_id: msg.admin_id,
      message_content: msg.message_content,
      sender_type: msg.sender_type,
      is_read: msg.is_read,
      created_at: msg.created_at,
    });
  });

  // Inject a draft thread if we came from Approval Queue for a new conversation
  if (targetAgentId && !threadsMap.has(targetAgentId)) {
    const { data: agentData } = await (supabase as any)
      .from('agents')
      .select('id, name, website, user_email')
      .eq('id', targetAgentId)
      .single();

    if (agentData) {
      threadsMap.set(targetAgentId, {
        agent_id: agentData.id,
        agent_name: agentData.name,
        vendor_email: agentData.user_email || 'Unknown',
        website: agentData.website || null,
        messages: [],
      });
    }
  }

  // Convert map to array and sort by the latest message's created_at (descending)
  const threads = Array.from(threadsMap.values()).sort((a, b) => {
    if (a.messages.length === 0) return -1;
    if (b.messages.length === 0) return 1;

    const lastA = a.messages[a.messages.length - 1];
    const lastB = b.messages[b.messages.length - 1];
    return new Date(lastB.created_at).getTime() - new Date(lastA.created_at).getTime();
  });

  return <ResolutionCenterClient threads={threads} />;
}
