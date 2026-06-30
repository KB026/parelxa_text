import { getSavedToolsList } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import { getFolders } from '@/app/actions/wishlist';
import { SavedToolsClient } from '@/components/parlexa/dashboard/SavedToolsClient';

export const dynamic = 'force-dynamic';

export default async function SavedToolsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your saved tools.</div>;
  }

  // Fetch all saved tools across all folders
  const savedAgents = await getSavedToolsList(user.id);
  // Fetch all user folders
  const folders = await getFolders();

  return (
    <section>
      <SavedToolsClient initialTools={savedAgents} initialFolders={folders} />
    </section>
  );
}
