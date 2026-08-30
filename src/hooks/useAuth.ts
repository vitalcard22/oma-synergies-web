import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../lib/database.types';

interface AuthState {
  loading: boolean;
  userId: string | null;
  email: string | null;
  role: UserRole | null;
  fullName: string | null;
  suspended: boolean;
}

const initialState: AuthState = {
  loading: true,
  userId: null,
  email: null,
  role: null,
  fullName: null,
  suspended: false,
};

/**
 * Wraps Supabase Auth session state + the profiles.role/status lookup that
 * decides what a logged-in user is actually allowed to see (super_admin /
 * staff_admin / client). Session persists automatically across page
 * refreshes - Supabase's client stores it in localStorage by default.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile(userId: string, email: string | undefined) {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, status')
        .eq('id', userId)
        .single();

      if (cancelled) return;

      if (error || !data) {
        // Auth succeeded but no matching profiles row exists yet - treat as
        // logged out rather than crash, since role-gated pages need role to
        // decide anything.
        setState({ ...initialState, loading: false });
        return;
      }

      if (data.status === 'suspended') {
        // Suspending someone only flips a flag on their profile row - their
        // Supabase Auth credentials still work fine on their own, so this
        // check is what actually enforces "this person can no longer get
        // in" (e.g. staff who've left). Sign them back out immediately
        // rather than leaving a valid session sitting around that just
        // happens to be blocked client-side - a stale but "valid" session
        // is exactly the kind of thing that causes surprises later.
        await supabase.auth.signOut();
        if (cancelled) return;
        setState({ ...initialState, loading: false, suspended: true });
        return;
      }

      setState({
        loading: false,
        userId,
        email: email ?? null,
        role: data.role,
        fullName: data.full_name,
        suspended: false,
      });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
      } else {
        setState({ ...initialState, loading: false });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState((s) => ({ ...s, loading: true }));
        loadProfile(session.user.id, session.user.email);
      } else {
        setState({ ...initialState, loading: false });
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    setState((s) => ({ ...s, suspended: false }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { ...state, signIn, signOut };
}
