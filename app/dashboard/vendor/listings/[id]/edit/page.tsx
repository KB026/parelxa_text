/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { EditListingForm } from '@/components/parlexa/vendor/EditListingForm';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', Number(params.id))
    .single();

  if (error || !agent) {
    notFound();
  }

  // Final ownership check on the server
  const isAdmin = user.user_metadata?.role === 'admin';
  if (agent.user_id !== user.id && !isAdmin) {
    redirect('/vendor/listings');
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <EditListingForm agent={agent as any} />
    </div>
  );
}
