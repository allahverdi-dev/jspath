import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as supa from '../services/supabase.js';
import { clearPremiumCache } from '../services/premiumContent.js';

const AuthContext = createContext(null);

const identityValue = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

/** OAuth providers use different metadata keys, so identity reads stay defensive. */
export function getAuthDisplayName(user) {
  if (!user) return null;
  const metadata = user.user_metadata ?? {};
  return (
    identityValue(metadata.display_name) ??
    identityValue(metadata.full_name) ??
    identityValue(metadata.name) ??
    identityValue(metadata.user_name) ??
    identityValue(metadata.preferred_username) ??
    identityValue(user.email)?.split('@')[0] ??
    'Learner'
  );
}

export function getAuthAvatarUrl(user) {
  const metadata = user?.user_metadata ?? {};
  return identityValue(metadata.avatar_url) ?? identityValue(metadata.picture);
}

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
      if (!cancelled) {
        // Paid payloads are cached per user in memory. Dropping the cache on any
        // identity change means a sign-out, a token loss or an account switch can
        // never serve one learner's authorised content to the next.
        clearPremiumCache();
        setSession(s);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [configured]);

  const signInWithGoogle = useCallback((redirectPath) => supa.signInWithGoogle(redirectPath), []);
  const signInWithGitHub = useCallback((redirectPath) => supa.signInWithGitHub(redirectPath), []);
  const signOut = useCallback(async () => {
    const result = await supa.signOut();
    if (!result.error) {
      clearPremiumCache();
      setSession(null);
    }
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
      displayName: getAuthDisplayName(user),
      avatarUrl: getAuthAvatarUrl(user),
      signInWithGoogle,
      signInWithGitHub,
      signOut,
    }),
    [configured, loading, session, user, signInWithGoogle, signInWithGitHub, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
