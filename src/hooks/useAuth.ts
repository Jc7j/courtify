import { useSupabase } from '@/providers/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ROUTES } from '@/config/constants';
import { supabase } from '@/lib/supabase/client';

export function useAuth() {
  const { user, loading } = useSupabase();
  const router = useRouter();

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push(ROUTES.AUTH.SIGN_IN);
    }
    return { error };
  }, [router]);

  const requireAuth = useCallback(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.SIGN_IN);
    }
  }, [loading, user, router]);

  return {
    user,
    loading,
    signOut,
    requireAuth,
    isAuthenticated: !!user,
  };
} 
