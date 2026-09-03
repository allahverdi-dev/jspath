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

  /**
   * Delete the account, then tear down everything that belonged to it.
   *
   * Order matters and is the opposite of the obvious one: nothing local is
   * cleared until the server confirms the account is gone. A failed deletion
   * that had already wiped the browser would leave a live account behind a
   * signed-out, empty-looking app — the worst of both outcomes.
   *
   * `onDeleted` is where the caller drops the local learning document. It runs
   * after the session is discarded, so resetting local state cannot trigger a
   * doomed sync write against an account that no longer exists.
   */
  const deleteAccount = useCallback(async ({ acknowledgeForfeit = false } = {}, onDeleted) => {
    const outcome = await supa.deleteAccount({ acknowledgeForfeit });
    if (outcome.result !== supa.DELETE_ACCOUNT_RESULT.OK) return outcome;

    // The paid payload dies first: it is the only thing here that another
    // person could still read off this machine.
    clearPremiumCache();
    await supa.signOut();
    setSession(null);
    onDeleted?.();
    return outcome;
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
      deleteAccount,
    }),
    [configured, loading, session, user, signInWithGoogle, signInWithGitHub, signOut, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
