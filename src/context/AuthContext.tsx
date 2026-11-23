import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { checkIsAdmin } from '../services/adminService';
import { isSupabaseConfigured, supabase, withTimeout } from '../services/supabase';

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  /** Set when Supabase could not be reached while checking the session / admin status. */
  unreachable: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication is only used by /admin. The public storefront never waits on it.
 * "isAdmin" is a UI convenience; the real enforcement is Row Level Security in the database.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [unreachable, setUnreachable] = useState(false);

  const resolveAdmin = useCallback(async (s: Session | null) => {
    if (!s) {
      setIsAdmin(false);
      return;
    }
    try {
      setIsAdmin(await checkIsAdmin(s.user.id));
      setUnreachable(false);
    } catch (err) {
      console.warn('[veloura] Could not verify admin status.', err);
      setIsAdmin(false);
      setUnreachable(true);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    withTimeout(supabase.auth.getSession())
      .then(async ({ data }) => {
        if (!active) return;
        setSession(data.session);
        await resolveAdmin(data.session);
      })
      .catch(() => active && setUnreachable(true))
      .finally(() => active && setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      // Defer to avoid calling Supabase inside the auth callback.
      setTimeout(() => void resolveAdmin(next), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [resolveAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }), 12000);
    if (error) throw error;
    setSession(data.session);
    await resolveAdmin(data.session);
  }, [resolveAdmin]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ configured: isSupabaseConfigured, loading, user: session?.user ?? null, isAdmin, unreachable, signIn, signOut }),
    [loading, session, isAdmin, unreachable, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
