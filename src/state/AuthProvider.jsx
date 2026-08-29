import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as supa from '../services/supabase.js';

const AuthContext = createContext(null);

/**
 * Authentication.
 *
 * When Supabase is not configured, `isConfigured` is false and every learner is a
 * guest — which is a fully supported state, not a degraded one. Nothing in the
 * learning experience waits on this provider resolving.
 */
export function AuthProvider({ children }) {
  const configured = supa.isSupabaseConfigured();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;

    supa.getSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setLoading(false);
      }
    });

    const unsubscribe = supa.onAuthChange((s) => {
      if (!cancelled) setSession(s);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback((credentials) => supa.signIn(credentials), []);
  const signUp = useCallback((credentials) => supa.signUp(credentials), []);
  const signInWithGoogle = useCallback(() => supa.signInWithGoogle(), []);
  const resetPassword = useCallback((email) => supa.resetPassword(email), []);
  const signOut = useCallback(async () => {
    const result = await supa.signOut();
    setSession(null);
    return result;
  }, []);

  const user = session?.user ?? null;

  const value = useMemo(
    () => ({
      isConfigured: configured,
      loading,
      session,
      user,
      isAuthenticated: Boolean(user),
      displayName: user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? null,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
    }),
    [configured, loading, session, user, signIn, signUp, signInWithGoogle, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
