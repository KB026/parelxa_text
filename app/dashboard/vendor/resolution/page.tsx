import { createClient } from '@/lib/supabase/server';
import { VendorResolutionClient, VendorThread } from '@/components/parlexa/dashboard/VendorResolutionClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VendorResolutionPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch all agents owned by this vendor
  const { data: userAgents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name, approval_status')
    .eq('user_id', user.id);

  if (agentsError) {
    console.error('Error fetching user agents:', agentsError);
  }

  const agentIds = (userAgents || []).map(a => a.id);

  // If vendor has no agents, they can't have messages
  if (agentIds.length === 0) {
    return <VendorResolutionClient threads={[]} />;
  }

  // 2. Fetch all messages for these agents
  const { data: messages, error: messagesError } = await (supabase as any)
    .from('vendor_messages')
    .select('*')
    .in('agent_id', agentIds)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Error fetching vendor messages:', messagesError);
  }

  // 3. Group messages into threads
  const threadsMap = new Map<number, VendorThread>();

  (messages || []).forEach((msg: any) => {
    const agentId = msg.agent_id;
    if (!threadsMap.has(agentId)) {
      const agent = userAgents?.find(a => a.id === agentId);
      threadsMap.set(agentId, {
        agent_id: agentId,
        agent_name: agent?.name || `Agent #${agentId}`,
        approval_status: agent?.approval_status || 'pending',
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

  // Convert map to array and sort by the latest message's created_at (descending)
  const threads = Array.from(threadsMap.values()).sort((a, b) => {
    const lastA = a.messages[a.messages.length - 1];
    const lastB = b.messages[b.messages.length - 1];
    if (!lastA) return 1;
    if (!lastB) return -1;
    return new Date(lastB.created_at).getTime() - new Date(lastA.created_at).getTime();
  });

  return <VendorResolutionClient threads={threads} />;
}
