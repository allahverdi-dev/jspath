import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/index.jsx';
import { useAuth } from '../../state/AuthProvider.jsx';
import { GitHubIcon, GoogleIcon } from './ProviderIcons.jsx';

const providerLabel = { google: 'Google', github: 'GitHub' };

export function OAuthButtons({ redirectPath, guestPath }) {
  const { isConfigured, signInWithGoogle, signInWithGitHub } = useAuth();
  const [busyProvider, setBusyProvider] = useState(null);
  const [error, setError] = useState(null);

  const startOAuth = async (provider) => {
    if (!isConfigured || busyProvider) return;
    setError(null);
    setBusyProvider(provider);

    const signIn = provider === 'google' ? signInWithGoogle : signInWithGitHub;
    try {
      const result = await signIn(redirectPath);
      if (result?.error) {
        setError(`We couldn't start ${providerLabel[provider]} sign-in. ${result.error.message}`);
        setBusyProvider(null);
      }
    } catch (caught) {
      setError(`We couldn't start ${providerLabel[provider]} sign-in. ${caught?.message ?? 'Please try again.'}`);
      setBusyProvider(null);
    }
  };

  const disabled = !isConfigured || Boolean(busyProvider);

  return (
    <div className="space-y-4">
      <Button
        type="button"
        className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => startOAuth('google')}
        loading={busyProvider === 'google'}
        disabled={disabled}
      >
        {busyProvider !== 'google' && <GoogleIcon />}
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => startOAuth('github')}
        loading={busyProvider === 'github'}
        disabled={disabled}
      >
        {busyProvider !== 'github' && <GitHubIcon />}
        Continue with GitHub
      </Button>

      {error && (
        <p className="rounded border border-error/40 bg-error/5 px-3 py-2 font-body-sm text-error" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 py-1" aria-hidden="true">
        <span className="h-px flex-1 bg-outline-variant" />
        <span className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">or</span>
        <span className="h-px flex-1 bg-outline-variant" />
      </div>

      <Button as={Link} to={guestPath} variant="ghost" className="w-full">Continue as guest</Button>
    </div>
  );
}
