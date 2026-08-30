import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createClient }));

describe('Supabase OAuth service', () => {
  let auth;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    auth = { signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://provider.test' }, error: null }) };
    mocks.createClient.mockReset();
    mocks.createClient.mockReturnValue({ auth });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the publishable key and identity-only OAuth options for both providers', async () => {
    const supabase = await import('./supabase.js');

    await supabase.signInWithGoogle('/dashboard');
    await supabase.signInWithGitHub('/onboarding/level');

    expect(mocks.createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'sb_publishable_test',
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
    );
    expect(auth.signInWithOAuth).toHaveBeenNthCalledWith(1, {
      provider: 'google',
      options: { redirectTo: 'http://localhost:3000/dashboard' },
    });
    expect(auth.signInWithOAuth).toHaveBeenNthCalledWith(2, {
      provider: 'github',
      options: { redirectTo: 'http://localhost:3000/onboarding/level' },
    });
  });

  it('keeps OAuth redirects on the application origin', async () => {
    const { createOAuthRedirectUrl } = await import('./supabase.js');

    expect(createOAuthRedirectUrl('/dashboard?from=login#ready', 'https://jspath.dev'))
      .toBe('https://jspath.dev/dashboard?from=login#ready');
    expect(() => createOAuthRedirectUrl('https://evil.test', 'https://jspath.dev')).toThrow(/application path/i);
    expect(() => createOAuthRedirectUrl('//evil.test/path', 'https://jspath.dev')).toThrow(/JSPath origin/i);
  });

  it('rejects providers outside the OAuth allowlist', async () => {
    const { signInWithOAuth } = await import('./supabase.js');
    const result = await signInWithOAuth('twitter', '/dashboard');

    expect(result.error.code).toBe('unsupported-provider');
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it('falls back to the legacy anon key for existing deployments', async () => {
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'legacy-anon-key');
    const supabase = await import('./supabase.js');

    supabase.getSupabase();

    expect(mocks.createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'legacy-anon-key',
      expect.any(Object),
    );
  });
});
