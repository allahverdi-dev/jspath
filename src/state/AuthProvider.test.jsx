import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, getAuthAvatarUrl, getAuthDisplayName, useAuth } from './AuthProvider.jsx';

const supabase = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(),
  getSession: vi.fn(),
  onAuthChange: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithGitHub: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../services/supabase.js', () => supabase);

function AuthStatus() {
  const { isAuthenticated, signOut } = useAuth();
  return (
    <>
      <p>{isAuthenticated ? 'Signed in' : 'Guest mode'}</p>
      <button type="button" onClick={signOut}>Sign out</button>
    </>
  );
}

describe('OAuth identity metadata', () => {
  it('resolves names returned by Google and GitHub defensively', () => {
    expect(getAuthDisplayName({ user_metadata: { full_name: 'Ada Lovelace' } })).toBe('Ada Lovelace');
    expect(getAuthDisplayName({ user_metadata: { user_name: 'grace-hopper' } })).toBe('grace-hopper');
    expect(getAuthDisplayName({ user_metadata: {}, email: 'learner@example.com' })).toBe('learner');
    expect(getAuthDisplayName({ user_metadata: { name: '   ' } })).toBe('Learner');
    expect(getAuthDisplayName(null)).toBeNull();
  });

  it('supports both common OAuth avatar fields', () => {
    expect(getAuthAvatarUrl({ user_metadata: { avatar_url: 'https://example.com/github.png' } }))
      .toBe('https://example.com/github.png');
    expect(getAuthAvatarUrl({ user_metadata: { picture: 'https://example.com/google.png' } }))
      .toBe('https://example.com/google.png');
  });
});

describe('OAuth session state', () => {
  beforeEach(() => {
    supabase.signOut.mockReset();
    supabase.isSupabaseConfigured.mockReturnValue(true);
    supabase.getSession.mockResolvedValue({ user: { id: 'oauth-user' } });
    supabase.onAuthChange.mockReturnValue(() => {});
    supabase.signOut.mockResolvedValue({ error: null });
  });

  it('returns to guest mode after Supabase signs out', async () => {
    render(<AuthProvider><AuthStatus /></AuthProvider>);
    expect(await screen.findByText('Signed in')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.getByText('Guest mode')).toBeInTheDocument());
    expect(supabase.signOut).toHaveBeenCalledOnce();
  });

  it('does not pretend to sign out when Supabase rejects the request', async () => {
    supabase.signOut.mockResolvedValue({ error: { message: 'Network unavailable.' } });
    render(<AuthProvider><AuthStatus /></AuthProvider>);
    expect(await screen.findByText('Signed in')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(supabase.signOut).toHaveBeenCalledOnce());
    expect(screen.getByText('Signed in')).toBeInTheDocument();
  });
});
