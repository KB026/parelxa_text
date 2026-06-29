'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function upgradeToVendor() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Update profile role
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'vendor' })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to upgrade to vendor:', error);
    redirect('/dashboard?auth_err=upgrade_failed');
  }

  // Also update auth metadata for faster checks
  await supabase.auth.updateUser({
    data: { role: 'vendor' }
  });

  revalidatePath('/', 'layout');
  redirect('/vendor/listings/new?fresh=true');
}
