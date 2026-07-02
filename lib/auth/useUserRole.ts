'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'consumer' | 'vendor' | 'admin' | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        // Check profiles table for role
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setRole((data?.role as UserRole) || 'consumer');
      } catch (err) {
        console.error('Role check failed:', err);
        setRole('consumer'); // Default to consumer
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [supabase]);

  return { role, loading };
}
